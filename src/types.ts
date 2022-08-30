import { Prisma } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Models {

}

export type IdField = string | number | { [key: string]: any };

export type Paginate = {
  default?: number;
  max?: number;
}

export interface PrismaServiceOptions {
  model: Uncapitalize<Prisma.ModelName>;
  events?: string[];
  multi?: boolean | string[];
  id?: string;
  paginate?: Paginate;
  whitelist?: string[];
  filters?: string[];
}

export type EagerQuery = (string | string[] | string[][])[] | Record<string, boolean | string[]>;

export interface QueryParamRecordFilters {
  $in?: (string | boolean | number)[];
  $nin?: (string | boolean | number)[];
  $lt?: string | number;
  $lte?: string | number;
  $gt?: string | number;
  $gte?: string | number;
  $ne?: string | boolean | number;
  $eager?: EagerQuery;
  $rawWhere?: Record<string, any>;
  // prisma specific
  $contains?: string;
  $search?: string;
  $startsWith?: string;
  $endsWith?: string;
  $mode?: string;
}

export type QueryParamRecord = string | boolean | number;
export type QueryParamRecordsOr = Record<string, QueryParamRecord | QueryParamRecordFilters>[];

export type QueryParam = {
  [key: string]: string | boolean | number | QueryParamRecordFilters | QueryParamRecordsOr;
}
