"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSelectOrInclude = exports.buildPrismaQueryParams = exports.buildBasePrismaQueryParams = exports.buildWhereWithId = exports.hasIdObject = exports.buildPagination = exports.buildOrderBy = exports.buildSelect = exports.buildWhereAndInclude = exports.buildIdField = exports.castEagerQueryToPrismaInclude = exports.castFeathersQueryToPrismaFilters = exports.castToNumberBooleanStringOrNull = void 0;
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
// eslint-disable-next-line
const castEagerQueryToPrismaInclude = (value, whitelist, idField) => {
    // we don't care about feathers compliance, we want where queries in our include
    // thus just returning the $eager value as include 1:1
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
/**
 * WARN: This method is not safe for Feathers queries because unwanted queries can reach the Prisma-Client.
 **/
const buildIdField = (value, whitelist) => {
    if (value !== null && typeof value === 'object') {
        const filters = (0, exports.castFeathersQueryToPrismaFilters)(value, whitelist);
        Object.keys(constants_1.OPERATORS_MAP).forEach((key) => {
            key in value && delete value[key];
        });
        return {
            ...value,
            ...filters,
        };
    }
    return value;
};
exports.buildIdField = buildIdField;
const buildWhereAndInclude = (query, whitelist, idField) => {
    const where = {};
    let include = {};
    Object.keys(query).forEach((k) => {
        const value = query[k];
        if (value === null) {
            where[k] = null;
        }
        else if (k === idField) {
            where[k] = (0, exports.buildIdField)(value, whitelist);
        }
        else if (k === '$or' && Array.isArray(value)) {
            where.OR = value.map((v) => (0, exports.buildWhereAndInclude)(v, whitelist, idField).where);
        }
        else if (k === '$and' && Array.isArray(value)) {
            where.AND = value.map((v) => (0, exports.buildWhereAndInclude)(v, whitelist, idField).where);
        }
        else if (k !== '$eager' && typeof value === 'object' && !Array.isArray(value)) {
            where[k] = (0, exports.castFeathersQueryToPrismaFilters)(value, whitelist);
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
const buildOrderByItem = ($sort) => {
    const orderByObj = {};
    for (const key in $sort) {
        const value = $sort[key];
        const valueAsNumber = Number(value);
        if (valueAsNumber === 1) {
            orderByObj[key] = 'asc';
        }
        else if (valueAsNumber === -1) {
            orderByObj[key] = 'desc';
        }
        else if (value !== null && typeof value === 'object') {
            orderByObj[key] = buildOrderByItem(value);
        }
    }
    return Object.keys(orderByObj).length > 0 ? orderByObj : undefined;
};
const buildOrderByArray = ($sort) => {
    const orderBy = [];
    for (const sortItem of $sort) {
        const orderByItem = buildOrderByItem(sortItem);
        if (orderByItem) {
            orderBy.push(orderByItem);
        }
    }
    return orderBy;
};
const buildOrderBy = ($sort) => {
    if (Array.isArray($sort)) {
        return buildOrderByArray($sort);
    }
    else if ($sort !== null && typeof $sort === 'object') {
        return buildOrderByItem($sort);
    }
    return [];
};
exports.buildOrderBy = buildOrderBy;
const buildPagination = ($skip, $limit) => {
    return {
        skip: $skip || 0,
        take: $limit,
    };
};
exports.buildPagination = buildPagination;
const hasIdObject = (where, id) => id && !where.id && id !== null && typeof id === 'object';
exports.hasIdObject = hasIdObject;
const buildWhereWithId = (id, where, idField) => {
    if (!id) {
        return where;
    }
    else if (Object.keys(where).length > 0) {
        return { AND: [{ [idField]: id }, where] };
    }
    else {
        return { [idField]: id };
    }
};
exports.buildWhereWithId = buildWhereWithId;
const buildBasePrismaQueryParams = ({ id, query, filters, whitelist }, idField) => {
    const select = (0, exports.buildSelect)(filters.$select || []);
    const { where, include } = (0, exports.buildWhereAndInclude)(query, whitelist, idField);
    const orderBy = (0, exports.buildOrderBy)(filters.$sort || {});
    const { skip, take } = (0, exports.buildPagination)(filters.$skip, filters.$limit);
    const resultQuery = {
        skip,
        take,
        orderBy,
        where: (0, exports.buildWhereWithId)(id, where, idField)
    };
    if (Object.keys(select).length > 0) {
        resultQuery.select = {
            [idField]: true,
            ...select,
            ...include,
        };
    }
    else if (Object.keys(include).length > 0) {
        resultQuery.include = include;
    }
    return resultQuery;
};
exports.buildBasePrismaQueryParams = buildBasePrismaQueryParams;
const buildPrismaQueryParams = (feathersQueryData, idField, prismaQueryOverwrite) => {
    const basePrismaQuery = (0, exports.buildBasePrismaQueryParams)(feathersQueryData, idField);
    if (prismaQueryOverwrite) {
        const whereOverwrite = prismaQueryOverwrite.where;
        delete prismaQueryOverwrite.where;
        const baseWhere = basePrismaQuery.where;
        return Object.assign(basePrismaQuery, prismaQueryOverwrite, {
            where: whereOverwrite ? { AND: [whereOverwrite, baseWhere] } : baseWhere
        });
    }
    return basePrismaQuery;
};
exports.buildPrismaQueryParams = buildPrismaQueryParams;
const buildSelectOrInclude = ({ select, include }) => {
    return select ? { select } : include ? { include } : {};
};
exports.buildSelectOrInclude = buildSelectOrInclude;
