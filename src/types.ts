export type PrismaClient = any;

export type Paginate = {
  default?: number;
  max?: number;
}

export type PrismaServiceOptions = {
  id?: string;
  model: string;
  whitelist: string[];
  paginate?: Paginate | false;
  multi?: string[];
  useIdGeneration?: boolean;
  idGenerator?: () => string;
};

export type EagerQuery = (string | string[] | string[][])[];

export interface QueryParamRecordFilters {
  $in?: (string | boolean | number)[];
  $nin?: (string | boolean | number)[];
  $lt?: string | number;
  $lte?: string | number;
  $gt?: string | number;
  $gte?: string | number;
  $ne?: string | boolean | number;
  $eager?: EagerQuery;
  // prisma specific
  $contains?: string;
  $search?: string;
  $startsWith?: string;
  $endsWidth?: string;
  $mode?: string;
}

export type QueryParamRecord = string | boolean | number;
export type QueryParamRecordsOr = Record<string, QueryParamRecord | QueryParamRecordFilters>[];

export type QueryParam = {
  [key: string]: string | boolean | number | QueryParamRecordFilters | QueryParamRecordsOr;
}

export type ManyResult = {
  count: number;
}
