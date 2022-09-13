import type { Id, Params } from '@feathersjs/feathers';
import { AdapterService } from '@feathersjs/adapter-commons';
import * as errors from '@feathersjs/errors';
import { Prisma, PrismaClient } from '@prisma/client';
import { IdField, PrismaServiceOptions } from './types';
import { buildPrismaQueryParams, buildSelectOrInclude } from './utils';
import { OPERATORS } from './constants';
import { errorHandler } from './error-handler';
import { Models } from './types';

type KeyOfModel<T, K extends keyof T> = T[K];

export class PrismaService<K extends keyof PrismaClient & Uncapitalize<Prisma.ModelName>, ModelData = Record<string, any>> extends AdapterService<ModelData> {
  Model: any;
  client: PrismaClient;

  constructor(options: PrismaServiceOptions, client: PrismaClient) {
    super({
      id: options.id || 'id',
      paginate: {
        default: options.paginate?.default,
        max: options.paginate?.max,
      },
      multi: options.multi || [],
      filters: options.filters || [],
      events: options.events || [],
      whitelist: Object.values(OPERATORS).concat(options.whitelist || []),
      // @ts-ignore
      model: options.model || ''
    });

    const { model } = options;
    if (!model) {
      throw new errors.GeneralError('You must provide a model string.');
    }

    if (!(model in client)) {
      throw new errors.GeneralError(`No model with name ${model} found in prisma client.`);
    }
    this.client = client;
    this.Model = (client as any)[model];
  }

  async find(params: Params & { prisma?: Parameters<KeyOfModel<PrismaClient[K], 'findMany'>>[0] } = {}) {
    return super.find(params);
  }

  async _find(params: Params & { prisma?: Parameters<KeyOfModel<PrismaClient[K], 'findMany'>>[0] } = {}) {
    const { query, filters } = this.filterQuery(params);
    const { whitelist } = this.options;
    const { skip, take, orderBy, where, select, include } = buildPrismaQueryParams({
      query, filters, whitelist,
    }, this.options.id, params.prisma);

    try {
      const findMany = () => {
        return this.Model.findMany({
          ...(typeof take === 'number' ? { skip, take } : { skip }),
          orderBy,
          where,
          ...buildSelectOrInclude({ select, include }),
        });
      };

      if (!this.options.paginate.default || (typeof take !== 'number' && !take)) {
        const data = await findMany();
        return data;
      }

      const [data, count] = await this.client.$transaction([
        findMany(),
        this.Model.count(where),
      ]);

      const result = {
        total: count,
        skip,
        limit: take,
        data,
      };
      return result;
    } catch (e) {
      errorHandler(e);
    }
  }

  async get(id: Id, params: Params & { prisma?: Parameters<KeyOfModel<PrismaClient[K], 'findUnique'>>[0] } = {}) {
    return super.get(id, params);
  }

  async _get(id: IdField, params: Params & { prisma?: Parameters<KeyOfModel<PrismaClient[K], 'findUnique'>>[0] } = {}) {
    try {
      const { query, filters } = this.filterQuery(params);
      const { whitelist } = this.options;
      const { where, select, include } = buildPrismaQueryParams({
        id, query, filters, whitelist
      }, this.options.id, params.prisma);

      const result: Partial<ModelData> = await this.Model.findFirst({
        where,
        ...buildSelectOrInclude({ select, include }),
      });
      if (!result) throw new errors.NotFound(`No record found for ${this.options.id} '${id}'`);
      return result;
    } catch (e) {
      errorHandler(e, 'findUnique');
    }
  }

  async _create(data: Partial<ModelData> | Partial<ModelData>[], params: Params = {}) {
    const { query, filters } = this.filterQuery(params);
    const { whitelist } = this.options;
    const { select, include } = buildPrismaQueryParams({ query, filters, whitelist }, this.options.id);
    try {
      if (Array.isArray(data)) {
        const result: Partial<ModelData>[] = await this.client.$transaction(data.map((d) => this.Model.create({
          data: d,
          ...buildSelectOrInclude({ select, include }),
        })));
        return result;
      }
      const result: Partial<ModelData> = await this.Model.create({
        data,
        ...buildSelectOrInclude({ select, include }),
      });
      return result;
    } catch (e) {
      errorHandler(e);
    }
  }

  async _update(id: IdField | null, data: Partial<ModelData>, params: Params = {}) {
    return this._patchOrUpdate(id, data, params, false);
  }

  async _patch(id: IdField | null, data: Partial<ModelData> | Partial<ModelData>[], params: Params = {}) {
    return this._patchOrUpdate(id, data, params);
  }

  async _patchOrUpdate(id: IdField | null, data: Partial<ModelData> | Partial<ModelData>[], params: Params = {}, shouldReturnResult = true) {
    const { query, filters } = this.filterQuery(params);
    const { whitelist } = this.options;
    const { where, select, include }
      = buildPrismaQueryParams({ id: id || undefined, query, filters, whitelist }, this.options.id);

    if (id === null) {
      return await this._patchOrUpdateMany(data, where, select, include);
    } else {
      return await this._patchOrUpdateSingle(id, data, where, select, include, shouldReturnResult);
    }
  }

  async _patchOrUpdateMany(data: Partial<ModelData> | Partial<ModelData>[], where: any, select: any, include: any) {
    try {
      // TODO: Currently there is no better solution, if it is possible to handle all three database calls in one transaction, that should be fixed.
      const [result] = await this.client.$transaction([
        this.Model.findMany({
          where,
          select: { [this.options.id]: true }
        }),
        this.Model.updateMany({
          data,
          where,
        }),
      ]);

      return this.Model.findMany({
        where: {
          [this.options.id]: {
            in: result.map((item: any) => item[this.options.id])
          }
        },
        ...buildSelectOrInclude({ select, include })
      });
    } catch (e) {
      errorHandler(e, 'updateMany');
    }
  }

  async _patchOrUpdateSingle(id: IdField, data: Partial<ModelData> | Partial<ModelData>[], where: any, select: any, include: any, shouldReturnResult: boolean) {
    try {
      const [{ count }, result] = await this.client.$transaction([
        this.Model.updateMany({
          data,
          where,
        }),
        this.Model.findFirst({
          where: { [this.options.id]: id },
          ...buildSelectOrInclude({ select, include }),
        }),
      ]);

      if (count === 0) {
        throw new errors.NotFound(`No record found for ${this.options.id} '${id}'`);
      } else if (count > 1) {
        throw new Error('[_patchOrUpdateSingle]: Multi records updated. Expected single update.');
      }

      if (select || shouldReturnResult) {
        return result;
      }
      return { [this.options.id]: id, ...data };
    } catch (e) {
      errorHandler(e, 'update');
    }
  }

  async _remove(id: IdField | null, params: Params = {}) {
    const { query, filters } = this.filterQuery(params);
    const { whitelist } = this.options;
    const { where, select, include } = buildPrismaQueryParams({
      id: id || undefined, query, filters, whitelist,
    }, this.options.id);
    if (id === null) {
      return this._removeMany(where, select, include);
    } else {
      return this._removeSingle(id, where, select, include);
    }
  }

  async _removeSingle(id: IdField, where: any, select: any, include: any) {
    try {
      const [data] = await this.client.$transaction([
        this.Model.findFirst({
          where: where,
          ...buildSelectOrInclude({ select, include }),
        }),
        this.Model.deleteMany({ where }),
      ]);

      if (!data) {
        throw new errors.NotFound(`No record found for ${this.options.id} '${id}'`);
      }

      return data;
    } catch (e) {
      errorHandler(e, 'delete');
    }
  }

  async _removeMany(where: any, select: any, include: any) {
    try {
      const [data] = await this.client.$transaction([
        this.Model.findMany({
          where: where,
          ...buildSelectOrInclude({ select, include }),
        }),
        this.Model.deleteMany({ where }),
      ]);
      return data;
    } catch (e) {
      errorHandler(e, 'deleteMany');
    }
  }
}

export function service<K extends keyof Models, ModelData = Record<string, any>>(options: PrismaServiceOptions, client: PrismaClient) {
  return new PrismaService<K, ModelData>(options, client);
}

export const prismaService = service;
