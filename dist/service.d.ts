import type { Params } from '@feathersjs/feathers';
import { AdapterService } from '@feathersjs/adapter-commons';
import { PrismaClient } from '@prisma/client';
import { IdField, ManyResult, PrismaServiceOptions } from './types';
export declare class PrismaService<ModelData = Record<string, any>> extends AdapterService {
    Model: any;
    client: PrismaClient;
    idGenerator: () => string;
    constructor(options: PrismaServiceOptions, client: PrismaClient);
    _find(params?: Params): Promise<any>;
    _get(id: IdField, params?: Params): Promise<Partial<ModelData>>;
    _create(data: Partial<ModelData> | Partial<ModelData>[], params?: Params): Promise<Partial<ModelData> | Partial<ModelData>[]>;
    _update(id: IdField, data: Partial<ModelData>, params?: Params): Promise<Partial<ModelData>>;
    _patch(id: IdField, data: Partial<ModelData> | Partial<ModelData>[], params?: Params): Promise<ManyResult | Partial<ModelData>>;
    _remove(id: IdField, params?: Params): Promise<ManyResult | Partial<ModelData>>;
}
export declare function service<ModelData = Record<string, any>>(options: PrismaServiceOptions, client: PrismaClient): PrismaService<ModelData>;
export declare const prismaService: typeof service;
