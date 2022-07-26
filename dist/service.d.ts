import type { Params } from '@feathersjs/feathers';
import { AdapterService } from '@feathersjs/adapter-commons';
import { PrismaClient } from '@prisma/client';
import { IdField, PrismaServiceOptions } from './types';
export declare class PrismaService<ModelData = Record<string, any>> extends AdapterService {
    Model: any;
    client: PrismaClient;
    constructor(options: PrismaServiceOptions, client: PrismaClient);
    _find(params?: Params): Promise<any>;
    _get(id: IdField, params?: Params): Promise<Partial<ModelData> | undefined>;
    _create(data: Partial<ModelData> | Partial<ModelData>[], params?: Params): Promise<Partial<ModelData> | Partial<ModelData>[] | undefined>;
    _update(id: IdField | null, data: Partial<ModelData>, params?: Params): Promise<any>;
    _patch(id: IdField | null, data: Partial<ModelData> | Partial<ModelData>[], params?: Params): Promise<any>;
    _patchOrUpdate(id: IdField | null, data: Partial<ModelData> | Partial<ModelData>[], params?: Params, shouldReturnResult?: boolean): Promise<any>;
    _patchOrUpdateMany(data: Partial<ModelData> | Partial<ModelData>[], where: any, select: any, include: any): Promise<any>;
    _patchOrUpdateSingle(data: Partial<ModelData> | Partial<ModelData>[], where: any, select: any, include: any, shouldReturnResult: boolean): Promise<any>;
    _remove(id: IdField | null, params?: Params): Promise<any>;
    _removeSingle(where: any, select: any, include: any): Promise<any>;
    _removeMany(where: any, select: any, include: any): Promise<any>;
}
export declare function service<ModelData = Record<string, any>>(options: PrismaServiceOptions, client: PrismaClient): PrismaService<ModelData>;
export declare const prismaService: typeof service;
