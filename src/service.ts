import type { Params } from '@feathersjs/feathers';
import { AdapterService } from '@feathersjs/adapter-commons';
import * as errors from '@feathersjs/errors';
import { PrismaClient } from '@prisma/client';
import { IdField, PrismaServiceOptions } from './types';
import { buildPrismaQueryParams, buildSelectOrInclude, checkIdInQuery } from './utils';
import { OPERATORS } from './constants';
import { errorHandler } from './error-handler';

export class PrismaService<ModelData = Record<string, any>> extends AdapterService {
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
      model: options.model || ''
    });

    const { model } = options;
    if (!model) {
      throw new errors.GeneralError('You must provide a model string.');
    }
    // @ts-ignore
    if (!client[model]) {
      throw new errors.GeneralError(`No model with name ${model} found in prisma client.`);
    }
    this.client = client;
    // @ts-ignore
    this.Model = client[model];
  }

  async _find(params: Params = {}): Promise<any> {
    const { query, filters } = this.filterQuery(params);
    const { whitelist } = this.options;
    const { skip, take, orderBy, where, select, include } = buildPrismaQueryParams({
      query, filters, whitelist,
    }, this.options.id);
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
        this.Model.count({
          where,
        }),
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

  async _get(id: IdField, params: Params = {}) {
    try {
      const { query, filters } = this.filterQuery(params);
      const { whitelist } = this.options;
      const { where, select, include } = buildPrismaQueryParams({
        id, query, filters, whitelist
      }, this.options.id);

      checkIdInQuery(id, query, this.options.id);
      const result: Partial<ModelData> = await this.Model.findUnique({
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
      checkIdInQuery(id, query, this.options.id);
      return await this._patchOrUpdateSingle(data, where, select, include, shouldReturnResult);
    }

  }

  async _patchOrUpdateMany(data: Partial<ModelData> | Partial<ModelData>[], where: any, select: any, include: any) {
    try {
      const [, result] = await this.client.$transaction([
        this.Model.updateMany({
          data,
          where,
          ...buildSelectOrInclude({ select, include }),
        }),
        this.Model.findMany({
          where: {
            ...where,
            ...data,
          },
          ...buildSelectOrInclude({ select, include }),
        }),
      ]);
      return result;
    } catch (e) {
      errorHandler(e, 'updateMany');
    }
  }

  async _patchOrUpdateSingle(data: Partial<ModelData> | Partial<ModelData>[], where: any, select: any, include: any, shouldReturnResult: boolean) {
    try {
      const result = await this.Model.update({
        data,
        where,
        ...buildSelectOrInclude({ select, include }),
      });

      if (select || shouldReturnResult) {
        return result;
      }
      return { [this.options.id]: result.id, ...data };
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
      checkIdInQuery(id, query, this.options.id);
      return this._removeSingle(where, select, include);
    }
  }

  async _removeSingle(where: any, select: any, include: any) {
    try {
      return await this.Model.delete({
        where: where,
        ...buildSelectOrInclude({ select, include }),
      });
    } catch (e) {
      errorHandler(e, 'delete');
    }
  }

  async _removeMany(where: any, select: any, include: any) {
    try {
      const query = {
        where: where,
        ...buildSelectOrInclude({ select, include }),
      };
      const [data] = await this.client.$transaction([
        this.Model.findMany(query),
        this.Model.deleteMany(query),
      ]);
      return data;
    } catch (e) {
      errorHandler(e, 'deleteMany');
    }
  }
}

export function service<ModelData = Record<string, any>>(options: PrismaServiceOptions, client: PrismaClient) {
  return new PrismaService<ModelData>(options, client);
}

export const prismaService = service;
