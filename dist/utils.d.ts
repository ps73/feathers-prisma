import { EagerQuery, FeathersQueryData, IdField, QueryParam, QueryParamRecordFilters } from './types';
export declare const castToNumberBooleanStringOrNull: (value: string | boolean | number) => string | number | boolean | null;
export declare const castFeathersQueryToPrismaFilters: (p: QueryParamRecordFilters, whitelist: string[]) => Record<string, any>;
export declare const castEagerQueryToPrismaInclude: (value: EagerQuery, whitelist: string[], idField: string) => EagerQuery;
export declare const mergeFiltersWithSameKey: (where: Record<string, any>, key: string, filter: Record<string, any> | string | number | boolean | null) => Record<string, any> | string | number | boolean;
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
export declare const buildOrderBy: ($sort: Record<string, any>) => {
    [x: string]: string;
}[];
export declare const buildPagination: ($skip: number, $limit: number) => {
    skip: number;
    take: number;
};
export declare const hasIdObject: (where: Record<string, any>, id?: IdField | undefined) => boolean | "" | 0 | undefined;
export declare const buildBasePrismaQueryParams: ({ id, query, filters, whitelist }: FeathersQueryData, idField: string) => {
    skip: number;
    take: number;
    orderBy: {
        [x: string]: string;
    }[];
    where: Record<string, any>;
    select: Record<string, boolean>;
    include?: undefined;
} | {
    skip: number;
    take: number;
    orderBy: {
        [x: string]: string;
    }[];
    where: Record<string, any>;
    include: Record<string, any>;
    select?: undefined;
} | {
    skip: number;
    take: number;
    orderBy: {
        [x: string]: string;
    }[];
    where: Record<string, any>;
    select?: undefined;
    include?: undefined;
};
export declare const buildPrismaQueryParams: (feathersQueryData: FeathersQueryData, idField: string, prismaQueryOverwrite?: Record<string, any> | undefined) => {
    skip: number;
    take: number;
    orderBy: {
        [x: string]: string;
    }[];
    where: Record<string, any>;
    select: Record<string, boolean>;
    include?: undefined;
} | {
    skip: number;
    take: number;
    orderBy: {
        [x: string]: string;
    }[];
    where: Record<string, any>;
    include: Record<string, any>;
    select?: undefined;
} | {
    skip: number;
    take: number;
    orderBy: {
        [x: string]: string;
    }[];
    where: Record<string, any>;
    select?: undefined;
    include?: undefined;
};
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
export declare const checkIdInQuery: (id: IdField | null, query: Record<string, any>, idField: string) => void;
