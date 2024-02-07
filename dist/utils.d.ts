import { EagerQuery, FeathersQueryData, IdField, QueryParam, QueryParamRecordFilters } from './types';
export declare const castToNumberBooleanStringOrNull: (value: string | boolean | number) => string | number | boolean | null;
export declare const castFeathersQueryToPrismaFilters: (p: QueryParamRecordFilters, whitelist: string[]) => Record<string, any>;
export declare const castEagerQueryToPrismaInclude: (value: EagerQuery, whitelist: string[], idField: string) => EagerQuery;
/**
 * WARN: This method is not safe for Feathers queries because unwanted queries can reach the Prisma-Client.
 **/
export declare const buildIdField: (value: IdField, whitelist: string[]) => string | number | {
    [x: string]: any;
};
export declare const buildWhereAndInclude: (query: QueryParam, whitelist: string[], idField: string) => {
    where: Record<string, any>;
    include: Record<string, any>;
};
export declare const buildSelect: ($select: string[]) => Record<string, boolean>;
export declare const buildOrderBy: ($sort: Record<string, any> | Record<string, any>[]) => Record<string, any> | undefined;
export declare const buildPagination: ($skip: number, $limit: number) => {
    skip: number;
    take: number;
};
export declare const hasIdObject: (where: Record<string, any>, id?: IdField) => boolean | "" | 0 | undefined;
export declare const buildWhereWithId: (id: IdField | undefined, where: Record<string, any>, idField: string) => Record<string, any>;
export declare const buildBasePrismaQueryParams: ({ id, query, filters, whitelist }: FeathersQueryData, idField: string) => any;
export declare const buildPrismaQueryParams: (feathersQueryData: FeathersQueryData, idField: string, prismaQueryOverwrite?: Record<string, any>) => any;
export declare const buildSelectOrInclude: ({ select, include }: {
    select?: Record<string, boolean> | undefined;
    include?: Record<string, any> | undefined;
}) => {
    select: Record<string, boolean>;
    include?: undefined;
} | {
    include: Record<string, any>;
    select?: undefined;
} | {
    select?: undefined;
    include?: undefined;
};
