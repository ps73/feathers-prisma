import type { Id, Params } from '@feathersjs/feathers';
import { AdapterService } from '@feathersjs/adapter-commons';
import { Prisma, PrismaClient } from '@prisma/client';
import { IdField, PrismaServiceOptions } from './types';
import { Models } from './types';
declare type KeyOfModel<T, K extends keyof T> = T[K];
export declare class PrismaService<K extends keyof PrismaClient & Uncapitalize<Prisma.ModelName>, ModelData = Record<string, any>> extends AdapterService<ModelData> {
    Model: any;
    client: PrismaClient;
    constructor(options: PrismaServiceOptions, client: PrismaClient);
    find(params?: Params & {
        prisma?: Parameters<KeyOfModel<PrismaClient[K], 'findMany'>>[0];
    }): Promise<ModelData[] | import("@feathersjs/feathers").Paginated<ModelData>>;
    _find(params?: Params & {
        prisma?: Parameters<KeyOfModel<PrismaClient[K], 'findMany'>>[0];
    }): Promise<any>;
    get(id: Id, params?: Params & {
        prisma?: Parameters<KeyOfModel<PrismaClient[K], 'findUnique'>>[0];
    }): Promise<ModelData>;
    _get(id: IdField, params?: Params & {
        prisma?: Parameters<KeyOfModel<PrismaClient[K], 'findUnique'>>[0];
    }): Promise<Partial<ModelData> | undefined>;
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
export declare function service<K extends keyof Models, ModelData = Record<string, any>>(options: PrismaServiceOptions, client: PrismaClient): PrismaService<K, ModelData>;
export declare const prismaService: typeof service;
export {};
