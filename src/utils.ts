import { OPERATORS_MAP } from './constants';
import { EagerQuery, IdField, QueryParam, QueryParamRecordFilters } from './types';

export const castToNumberBooleanStringOrNull = (value: string | boolean | number) => {
  const asNumber = Number(value);
  const isNumber = !Number.isNaN(asNumber);
  const isBoolean = value === 'true' || value === 'false';
  if (isBoolean || typeof value === 'boolean') {
    return typeof value === 'string' ? value === 'true' : value;
  }
  if (isNumber) {
    return asNumber;
  }
  if (value === 'null') {
    return null;
  }
  return value;
};

export const castFeathersQueryToPrismaFilters = (p: QueryParamRecordFilters, whitelist: string[]) => {
  const filters: Record<string, any> = {};

  Object.keys(p).forEach((k: string) => {
    const key = (k as keyof typeof OPERATORS_MAP);
    const prismaKey = OPERATORS_MAP[key];
    if (prismaKey && key !== '$eager' && whitelist.includes(key)) {
      const value = p[key];
      if (Array.isArray(value)) {
        filters[prismaKey] = value.map((v) => castToNumberBooleanStringOrNull(v));
      } else if (value !== undefined) {
        filters[prismaKey] = castToNumberBooleanStringOrNull(value);
      }
    }
  });
  return filters;
};

export const castEagerQueryToPrismaInclude = (value: EagerQuery) => {
  const include: Record<string, any> = {};

  value.forEach((v) => {
    if (Array.isArray(v) && typeof v[0] === 'string' && v.length > 1) {
      const [key, ...includes] = v;
      const subinclude = castEagerQueryToPrismaInclude(includes);
      include[key] = {
        include: subinclude,
      };
    } else if (Array.isArray(v) && typeof v[0] === 'string' && v.length === 1) {
      const [key] = v;
      include[key] = true;
    } else if (typeof v[0] !== 'string') {
      throw {
        code: 'FP1001',
        message: 'First Array Item in a sub-array must be a string!',
      };
    } else if (typeof v === 'string') {
      include[v] = true;
    }
  });

  return include;
};

export const buildWhereAndInclude = (query: QueryParam, whitelist: string[]) => {
  const where: Record<string, any> = {};
  let include: Record<string, any> = {};
  Object.keys(query).forEach((k: string | '$or') => {
    const value = query[k];
    if (k === '$or' && Array.isArray(value)) {
      where.OR = value.map((v) => buildWhereAndInclude(v, whitelist).where);
    } else if (k !== '$eager' && typeof value === 'object' && !Array.isArray(value)) {
      where[k] = castFeathersQueryToPrismaFilters(value, whitelist);
    } else if (k !== '$eager' && typeof value !== 'object' && !Array.isArray(value)) {
      where[k] = castToNumberBooleanStringOrNull(value);
    } else if (k === '$eager' && whitelist.includes(k)) {
      const eager = value as EagerQuery;
      include = castEagerQueryToPrismaInclude(eager);
    }
  });
  return { where, include };
};

export const buildSelect = ($select: string[]) => {
  const select: Record<string, boolean> = {};
  $select.forEach((f: string) => { select[f] = true; });
  return select;
};

export const buildOrderBy = ($sort: Record<string, any>) => {
  return Object.keys($sort).map((k) => ({ [k]: $sort[k] === 1 ? 'asc' : 'desc' }));
};

export const buildPagination = ($skip: number, $limit: number) => {
  return {
    skip: $skip || 0,
    take: $limit,
  };
};

export const buildPrismaQueryParams = ({ id, query, filters, whitelist }: {
  id?: IdField,
  query: Record<string, any>,
  filters: Record<string, any>,
  whitelist: string[],
}) => {
  let select = buildSelect(filters.$select || []);
  const selectExists = Object.keys(select).length > 0;
  const { where, include } = buildWhereAndInclude(id ? { id, ...query } : query, whitelist);
  const includeExists = Object.keys(include).length > 0;
  const orderBy = buildOrderBy(filters.$sort || {});
  const { skip, take } = buildPagination(filters.$skip, filters.$limit);

  if (selectExists) {
    select = {
      ...select,
      ...include,
    };

    return {
      skip,
      take,
      orderBy,
      where,
      select,
    };
  }

  if (!selectExists && includeExists) {
    return {
      skip,
      take,
      orderBy,
      where,
      include,
    };
  }

  return {
    skip,
    take,
    orderBy,
    where,
  };
};

export const buildSelectOrInclude = (
  { select, include }: { select?: Record<string, boolean>; include?: Record<string, any> },
) => {
  return select ? { select } : include ? { include } : {};
};
