"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIdInQuery = exports.buildSelectOrInclude = exports.buildPrismaQueryParams = exports.buildPagination = exports.buildOrderBy = exports.buildSelect = exports.buildWhereAndInclude = exports.mergeFiltersWithSameKey = exports.castEagerQueryToPrismaInclude = exports.castFeathersQueryToPrismaFilters = exports.castToNumberBooleanStringOrNull = void 0;
const errors_1 = require("@feathersjs/errors");
const constants_1 = require("./constants");
const castToNumberBooleanStringOrNull = (value) => {
    const isNumber = typeof value === 'number';
    const isBoolean = value === 'true' || value === 'false';
    if (isBoolean || typeof value === 'boolean') {
        return typeof value === 'string' ? value === 'true' : value;
    }
    if (isNumber) {
        return value;
    }
    if (value === 'null') {
        return null;
    }
    return value;
};
exports.castToNumberBooleanStringOrNull = castToNumberBooleanStringOrNull;
const castFeathersQueryToPrismaFilters = (p, whitelist) => {
    const filters = {};
    Object.keys(p).forEach((k) => {
        const key = k;
        const prismaKey = constants_1.OPERATORS_MAP[key];
        if (prismaKey && key !== '$eager' && whitelist.includes(key)) {
            const value = p[key];
            if (Array.isArray(value)) {
                filters[prismaKey] = value.map((v) => (0, exports.castToNumberBooleanStringOrNull)(v));
            }
            else if (key === '$rawWhere' && typeof value === 'object') {
                Object.keys(value).forEach((rawKey) => {
                    filters[rawKey] = value[rawKey];
                });
            }
            else if (value !== undefined && typeof value !== 'object') {
                filters[prismaKey] = (0, exports.castToNumberBooleanStringOrNull)(value);
            }
        }
    });
    return filters;
};
exports.castFeathersQueryToPrismaFilters = castFeathersQueryToPrismaFilters;
const castEagerQueryToPrismaInclude = (value, whitelist, idField) => {
    // we don't care about feathers compliance, we want where queries in our include
    // thus just returnung the $eager value as include 1:1
    return value;
    // const include: Record<string, any> = {};
    // if (Array.isArray(value)) {
    //   value.forEach((v) => {
    //     if (Array.isArray(v) && typeof v[0] === 'string' && v.length > 1) {
    //       const [key, ...includes] = v;
    //       const subinclude = castEagerQueryToPrismaInclude(includes, whitelist, idField);
    //       include[key] = {
    //         include: subinclude,
    //       };
    //     } else if (Array.isArray(v) && typeof v[0] === 'string' && v.length === 1) {
    //       const [key] = v;
    //       include[key] = true;
    //     } else if (typeof v[0] !== 'string') {
    //       throw {
    //         code: 'FP1001',
    //         message: 'First Array Item in a sub-array must be a string!',
    //       };
    //     } else if (typeof v === 'string') {
    //       include[v] = true;
    //     }
    //   });
    // } else {
    //   Object.keys(value).forEach((key) => {
    //     const val = value[key];
    //     if (typeof val === 'boolean') {
    //       include[key] = val;
    //     } else if (Array.isArray(val)) {
    //       include[key] = {
    //         select: {
    //           [idField]: true,
    //           ...buildSelect(val),
    //         },
    //       };
    //     }
    //   });
    // }
    // return include;
};
exports.castEagerQueryToPrismaInclude = castEagerQueryToPrismaInclude;
const mergeFiltersWithSameKey = (where, key, filter) => {
    const current = where[key];
    if (typeof filter === 'object') {
        const currentIsObj = typeof current === 'object';
        return Object.assign(Object.assign(Object.assign({}, (currentIsObj ? current : {})), filter), (!currentIsObj && current ? { equals: current } : {}));
    }
    return filter;
};
exports.mergeFiltersWithSameKey = mergeFiltersWithSameKey;
const buildWhereAndInclude = (query, whitelist, idField) => {
    const where = {};
    let include = {};
    Object.keys(query).forEach((k) => {
        const value = query[k];
        if (k === '$or' && Array.isArray(value)) {
            where.OR = value.map((v) => (0, exports.buildWhereAndInclude)(v, whitelist, idField).where);
        }
        else if (k === '$and' && Array.isArray(value)) {
            value.forEach((v) => {
                const whereValue = (0, exports.buildWhereAndInclude)(v, whitelist, idField).where;
                Object.keys(whereValue).map((subKey) => {
                    where[subKey] = (0, exports.mergeFiltersWithSameKey)(where, subKey, whereValue[subKey]);
                });
            });
        }
        else if (k !== '$eager' && typeof value === 'object' && !Array.isArray(value)) {
            where[k] = (0, exports.mergeFiltersWithSameKey)(where, k, (0, exports.castFeathersQueryToPrismaFilters)(value, whitelist));
        }
        else if (k !== '$eager' && typeof value !== 'object' && !Array.isArray(value)) {
            where[k] = (0, exports.castToNumberBooleanStringOrNull)(value);
        }
        else if (k === '$eager' && whitelist.includes(k)) {
            const eager = value;
            include = (0, exports.castEagerQueryToPrismaInclude)(eager, whitelist, idField);
        }
    });
    return { where, include };
};
exports.buildWhereAndInclude = buildWhereAndInclude;
const buildSelect = ($select) => {
    const select = {};
    $select.forEach((f) => { select[f] = true; });
    return select;
};
exports.buildSelect = buildSelect;
const buildOrderBy = ($sort) => {
    return Object.keys($sort).map((k) => ({ [k]: $sort[k] === 1 ? 'asc' : 'desc' }));
};
exports.buildOrderBy = buildOrderBy;
const buildPagination = ($skip, $limit) => {
    return {
        skip: $skip || 0,
        take: $limit,
    };
};
exports.buildPagination = buildPagination;
const buildPrismaQueryParams = ({ id, query, filters, whitelist }, idField) => {
    let select = (0, exports.buildSelect)(filters.$select || []);
    const selectExists = Object.keys(select).length > 0;
    const { where, include } = (0, exports.buildWhereAndInclude)(id ? Object.assign({ [idField]: id }, query) : query, whitelist, idField);
    const includeExists = Object.keys(include).length > 0;
    const orderBy = (0, exports.buildOrderBy)(filters.$sort || {});
    const { skip, take } = (0, exports.buildPagination)(filters.$skip, filters.$limit);
    const queryWhereExists = Object.keys(where).filter((k) => k !== idField).length > 0;
    const idQueryIsObject = typeof where.id === 'object';
    if (selectExists) {
        select = Object.assign(Object.assign({ [idField]: true }, select), include);
        return {
            skip,
            take,
            orderBy,
            where,
            select,
            _helper: {
                queryWhereExists,
                idQueryIsObject
            },
        };
    }
    if (!selectExists && includeExists) {
        return {
            skip,
            take,
            orderBy,
            where,
            include,
            _helper: {
                queryWhereExists,
                idQueryIsObject
            },
        };
    }
    return {
        skip,
        take,
        orderBy,
        where,
        _helper: {
            queryWhereExists,
            idQueryIsObject
        },
    };
};
exports.buildPrismaQueryParams = buildPrismaQueryParams;
const buildSelectOrInclude = ({ select, include }) => {
    return select ? { select } : include ? { include } : {};
};
exports.buildSelectOrInclude = buildSelectOrInclude;
const checkIdInQuery = (id, query, idField) => {
    if (id && query[idField] && id !== query[idField]) {
        throw new errors_1.NotFound(`No record found for ${idField} '${id}' and query.${idField} '${id}'`);
    }
};
exports.checkIdInQuery = checkIdInQuery;
