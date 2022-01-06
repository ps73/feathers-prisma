export declare type PrismaClient = any;
export declare type IdField = string | number | null;
export declare type Paginate = {
    default?: number;
    max?: number;
};
export interface PrismaServiceOptions {
    Model: any;
    model: string;
    events?: string[];
    multi?: boolean | string[];
    id?: string;
    paginate?: {
        default?: number;
        max?: number;
    };
    whitelist?: string[];
    filters?: string[];
}
export declare type EagerQuery = (string | string[] | string[][])[];
export interface QueryParamRecordFilters {
    $in?: (string | boolean | number)[];
    $nin?: (string | boolean | number)[];
    $lt?: string | number;
    $lte?: string | number;
    $gt?: string | number;
    $gte?: string | number;
    $ne?: string | boolean | number;
    $eager?: EagerQuery;
    $contains?: string;
    $search?: string;
    $startsWith?: string;
    $endsWidth?: string;
    $mode?: string;
}
export declare type QueryParamRecord = string | boolean | number;
export declare type QueryParamRecordsOr = Record<string, QueryParamRecord | QueryParamRecordFilters>[];
export declare type QueryParam = {
    [key: string]: string | boolean | number | QueryParamRecordFilters | QueryParamRecordsOr;
};
export declare type ManyResult = {
    count: number;
};
