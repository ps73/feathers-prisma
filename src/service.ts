import type { Params } from '@feathersjs/feathers';
import { AdapterService } from '@feathersjs/adapter-commons';
import * as errors from '@feathersjs/errors';
import { PrismaClient } from '@prisma/client';
import { IdField, ManyResult, PrismaServiceOptions } from './types';
import { buildPrismaQueryParams, buildSelectOrInclude } from './utils';
import { OPERATORS } from './constants';

export class PrismaService<ModelData = Record<string, any>> extends AdapterService {
  Model: any;
  client: PrismaClient;

  constructor(options: PrismaServiceOptions, client: PrismaClient) {
    super({
      id: options.id || 'id',
      paginate: {
        default: options.paginate && options.paginate.default || 25,
        max: options.paginate && options.paginate.max || 100,
      },
      multi: options.multi || [],
      filters: options.filters || [],
      events: options.events || [],
      whitelist: Object.values(OPERATORS).concat(options.whitelist || []),
    });

    const { model } = options;
    if (!model) {
      throw new errors.GeneralError('You must provide a model string');
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
    });

    const [data, count] = await this.client.$transaction([
      this.Model.findMany({
        skip,
        take,
        orderBy,
        where,
        ...buildSelectOrInclude({ select, include }),
      }),
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
  }

  async _get(id: IdField, params: Params = {}) {
    const { query, filters } = this.filterQuery(params);
    const { whitelist } = this.options;
    const { where, select, include } = buildPrismaQueryParams({
      id, query, filters, whitelist,
    });
    const result: Partial<ModelData> = await this.Model.findUnique({
      where,
      ...buildSelectOrInclude({ select, include }),
    });
    return result;
  }

  async _create(data: Partial<ModelData> | Partial<ModelData>[], params: Params = {}) {
    const { query, filters } = this.filterQuery(params);
    const { whitelist } = this.options;
    const { select, include } = buildPrismaQueryParams({ query, filters, whitelist });
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
  }

  async _update(id: IdField, data: Partial<ModelData>, params: Params = {}) {
    const { query, filters } = this.filterQuery(params);
    const { whitelist } = this.options;
    const { where, select, include } = buildPrismaQueryParams({
      id, query, filters, whitelist,
    });
    const result: Partial<ModelData> = await this.Model.update({
      data,
      where,
      ...buildSelectOrInclude({ select, include }),
    });
    return result;
  }

  async _patch(id: IdField, data: Partial<ModelData> | Partial<ModelData>[], params: Params = {}) {
    if (id && !Array.isArray(data)) {
      const result = await this._update(id, data, params);
      return result;
    }
    const { query, filters } = this.filterQuery(params);
    const { whitelist } = this.options;
    const { where, select, include } = buildPrismaQueryParams({ query, filters, whitelist });
    const result: ManyResult = await this.Model.updateMany({
      data,
      where,
      ...buildSelectOrInclude({ select, include }),
    });
    return result;
  }

  async _remove(id: IdField, params: Params = {}) {
    const { query, filters } = this.filterQuery(params);
    const { whitelist } = this.options;
    if (id) {
      const { where, select, include } = buildPrismaQueryParams({
        id, query, filters, whitelist,
      });
      const result: Partial<ModelData> = await this.Model.delete({
        where,
        ...buildSelectOrInclude({ select, include }),
      });
      return result;
    }
    const { where, select, include } = buildPrismaQueryParams({ query, filters, whitelist });
    const result: ManyResult = await this.Model.deleteMany({
      where,
      ...buildSelectOrInclude({ select, include }),
    });
    return result;
  }
}

export function service<ModelData = Record<string, any>>(options: PrismaServiceOptions, client: PrismaClient) {
  return new PrismaService<ModelData>(options, client);
}

export const prismaService = service;
