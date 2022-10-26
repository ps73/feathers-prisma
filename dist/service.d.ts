import type { Id, Params } from '@feathersjs/feathers';
import { AdapterService } from '@feathersjs/adapter-commons';
import { Prisma, PrismaClient } from '@prisma/client';
import { IdField, PrismaServiceOptions } from './types';
import { Models } from './types';
export declare class PrismaService<K extends keyof PrismaClient & Uncapitalize<Prisma.ModelName>, ModelData = Record<string, any>> extends AdapterService<ModelData> {
    Model: any;
    client: PrismaClient;
    constructor(options: PrismaServiceOptions, client: PrismaClient);
    find(params?: Params & {
        prisma?: Parameters<PrismaClient[K]['findMany']>[0];
    }): Promise<ModelData[] | import("@feathersjs/feathers").Paginated<ModelData>>;
    _find(params?: Params & {
        prisma?: Parameters<PrismaClient[K]['findMany']>[0];
    }): Promise<any>;
    get(id: Id, params?: Params & {
        prisma?: Parameters<PrismaClient[K]['findFirst']>[0];
    }): Promise<ModelData>;
    _get(id: IdField, params?: Params & {
        prisma?: Parameters<PrismaClient[K]['findFirst']>[0];
    }): Promise<Partial<ModelData> | undefined>;
    create(data: Partial<ModelData> | Partial<ModelData>[], params?: Params & {
        prisma?: Parameters<PrismaClient[K]['create']>[0];
    }): Promise<ModelData | ModelData[]>;
    _create(data: Partial<ModelData> | Partial<ModelData>[], params?: Params & {
        prisma?: Parameters<PrismaClient[K]['create']>[0];
    }): Promise<Partial<ModelData> | Partial<ModelData>[] | undefined>;
    update(id: Id, data: ModelData, params?: Params & {
        prisma?: Parameters<PrismaClient[K]['findMany']>[0];
    }): Promise<ModelData>;
    _update(id: IdField | null, data: Partial<ModelData>, params?: Params & {
        prisma?: Parameters<PrismaClient[K]['findMany']>[0];
    }): Promise<any>;
    patch(id: Id | null, data: Partial<ModelData>, params?: Params & {
        prisma?: Parameters<PrismaClient[K]['findMany']>[0];
    }): Promise<ModelData | ModelData[]>;
    _patch(id: IdField | null, data: Partial<ModelData> | Partial<ModelData>[], params?: Params & {
        prisma?: Parameters<PrismaClient[K]['findMany']>[0];
    }): Promise<any>;
    _patchOrUpdate(id: IdField | null, data: Partial<ModelData> | Partial<ModelData>[], params?: Params, shouldReturnResult?: boolean): Promise<any>;
    _patchOrUpdateMany(data: Partial<ModelData> | Partial<ModelData>[], where: any, select: any, include: any): Promise<any>;
    _patchOrUpdateSingle(id: IdField, data: Partial<ModelData> | Partial<ModelData>[], where: any, select: any, include: any, shouldReturnResult: boolean): Promise<any>;
    remove(id: Id | null, params?: Params & {
        prisma?: Parameters<PrismaClient[K]['findMany']>[0];
    }): Promise<ModelData | ModelData[]>;
    _remove(id: IdField | null, params?: Params & {
        prisma?: Parameters<PrismaClient[K]['findMany']>[0];
    }): Promise<any>;
    _removeSingle(id: IdField, where: any, select: any, include: any): Promise<any>;
    _removeMany(where: any, select: any, include: any): Promise<any>;
}
export declare function service<K extends keyof Models, ModelData = Record<string, any>>(options: PrismaServiceOptions, client: PrismaClient): PrismaService<K, ModelData>;
export declare const prismaService: typeof service;
