export declare type PrismaClient = any;
export declare type Paginate = {
    default?: number;
    max?: number;
};
export declare type PrismaServiceOptions = {
    id?: string;
    model: string;
    whitelist: string[];
    paginate?: Paginate | false;
    multi?: string[];
    useIdGeneration?: boolean;
    idGenerator?: () => string;
};
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