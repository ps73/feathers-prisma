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
        id, query, filters, whitelist,
      }, this.options.id);
      const whereLength = Object.keys(where).filter((k) => k !== this.id).length;
      const idQueryIsObject = typeof where.id === 'object';
      if (idQueryIsObject || whereLength > 0) {
        const newWhere = idQueryIsObject ? {
          ...where,
          [this.id]: {
            ...where[this.id],
            equals: id,
          },
        } : where;
        const result: Partial<ModelData> = await this.Model.findFirst({
          where: newWhere,
          ...buildSelectOrInclude({ select, include }),
        });
        if (!result) throw new errors.NotFound(`No record found for id '${id}' and query`);
        return result;
      }
      checkIdInQuery({ id, query, idField: this.options.id });
      const result: Partial<ModelData> = await this.Model.findUnique({
        where,
        ...buildSelectOrInclude({ select, include }),
      });
      if (!result) throw new errors.NotFound(`No record found for id '${id}'`);
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

  async _update(id: IdField, data: Partial<ModelData>, params: Params = {}, returnResult = false) {
    const { query, filters } = this.filterQuery(params);
    const { whitelist } = this.options;
    const { where, select, include } = buildPrismaQueryParams({
      id, query, filters, whitelist,
    }, this.options.id);
    try {
      checkIdInQuery({ id, query, idField: this.options.id });
      const result = await this.Model.update({
        data,
        where,
        ...buildSelectOrInclude({ select, include }),
      });
      if (select || returnResult) {
        return result;
      }
      return { [this.options.id]: result.id, ...data };
    } catch (e) {
      errorHandler(e, 'update');
    }
  }

  async _patch(id: IdField | null, data: Partial<ModelData> | Partial<ModelData>[], params: Params = {}) {
    if (id && !Array.isArray(data)) {
      const result = await this._update(id, data, params, true);
      return result;
    }
    const { query, filters } = this.filterQuery(params);
    const { whitelist } = this.options;
    const { where, select, include } = buildPrismaQueryParams({ query, filters, whitelist }, this.options.id);
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

  async _remove(id: IdField | null, params: Params = {}) {
    const { query, filters } = this.filterQuery(params);
    const { whitelist } = this.options;
    if (id) {
      const { where, select, include } = buildPrismaQueryParams({
        id, query, filters, whitelist,
      }, this.options.id);
      try {
        checkIdInQuery({ id, query, allowOneOf: true, idField: this.options.id });
        const result: Partial<ModelData> = await this.Model.delete({
          where: id ? { [this.options.id]: id } : where,
          ...buildSelectOrInclude({ select, include }),
        });
        return result;
      } catch (e) {
        errorHandler(e, 'delete');
      }
    }
    const { where, select, include } = buildPrismaQueryParams({ query, filters, whitelist }, this.options.id);
    try {
      const query = {
        where,
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
