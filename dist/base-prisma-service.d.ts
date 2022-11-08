import { AdapterService } from '@feathersjs/adapter-commons/lib';
import { Id, NullableId, Paginated, Params } from '@feathersjs/feathers';
import { Prisma, PrismaClient } from '@prisma/client';
export interface FeathersPrismaFindParams<K extends keyof PrismaClient & Uncapitalize<Prisma.ModelName>> extends Params {
    prisma?: Parameters<PrismaClient[K]['findMany']>[0];
}
export interface FeathersPrismaGetParams<K extends keyof PrismaClient & Uncapitalize<Prisma.ModelName>> extends Params {
    prisma?: Parameters<PrismaClient[K]['findFirst']>[0];
}
export interface FeathersPrismaCreateParams<K extends keyof PrismaClient & Uncapitalize<Prisma.ModelName>> extends Params {
    prisma?: Parameters<PrismaClient[K]['create']>[0];
}
export declare type FeathersPrismaUpdateParams<K extends keyof PrismaClient & Uncapitalize<Prisma.ModelName>> = FeathersPrismaFindParams<K>;
export declare type FeathersPrismaPatchParams<K extends keyof PrismaClient & Uncapitalize<Prisma.ModelName>> = FeathersPrismaFindParams<K>;
export declare type FeathersPrismaRemoveParams<K extends keyof PrismaClient & Uncapitalize<Prisma.ModelName>> = FeathersPrismaFindParams<K>;
export declare class BasePrismaService<K extends keyof PrismaClient & Uncapitalize<Prisma.ModelName>, ModelData = Record<string, any>> extends AdapterService<ModelData> {
    find(params?: FeathersPrismaFindParams<K>): Promise<ModelData[] | Paginated<ModelData>>;
    get(id: Id, params?: FeathersPrismaGetParams<K>): Promise<ModelData>;
    create(data: Partial<ModelData>[], params?: FeathersPrismaCreateParams<K>): Promise<ModelData[]>;
    create(data: Partial<ModelData>, params?: FeathersPrismaCreateParams<K>): Promise<ModelData>;
    update(id: Id, data: ModelData, params?: FeathersPrismaUpdateParams<K>): Promise<ModelData>;
    patch(id: Id, data: Partial<ModelData>, params?: FeathersPrismaPatchParams<K>): Promise<ModelData>;
    patch(id: null, data: Partial<ModelData>, params?: FeathersPrismaPatchParams<K>): Promise<ModelData[]>;
    patch(id: NullableId, data: Partial<ModelData>, params?: FeathersPrismaPatchParams<K>): Promise<ModelData | ModelData[]>;
    remove(id: Id, params?: FeathersPrismaRemoveParams<K>): Promise<ModelData>;
    remove(id: null, params?: FeathersPrismaRemoveParams<K>): Promise<ModelData[]>;
    remove(id: NullableId, params?: FeathersPrismaRemoveParams<K>): Promise<ModelData | ModelData[]>;
}
