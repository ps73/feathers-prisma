"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPrismaQueryParams = exports.buildPagination = exports.buildOrderBy = exports.buildSelect = exports.buildWhereAndInclude = exports.castEagerQueryToPrismaInclude = exports.castFeathersQueryToPrismaFilters = exports.castToNumberBooleanStringOrNull = void 0;
const constants_1 = require("./constants");
const castToNumberBooleanStringOrNull = (value) => {
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
            else if (value !== undefined) {
                filters[prismaKey] = (0, exports.castToNumberBooleanStringOrNull)(value);
            }
        }
    });
    return filters;
};
exports.castFeathersQueryToPrismaFilters = castFeathersQueryToPrismaFilters;
const castEagerQueryToPrismaInclude = (value) => {
    const include = {};
    value.forEach((v) => {
        if (Array.isArray(v) && typeof v[0] === 'string' && v.length > 1) {
            const [key, ...includes] = v;
            const subinclude = (0, exports.castEagerQueryToPrismaInclude)(includes);
            include[key] = {
                include: subinclude,
            };
        }
        else if (Array.isArray(v) && typeof v[0] === 'string' && v.length === 1) {
            const [key] = v;
            include[key] = true;
        }
        else if (typeof v[0] !== 'string') {
            throw {
                code: 'FP1001',
                message: 'First Array Item in a sub-array must be a string!',
            };
        }
        else if (typeof v === 'string') {
            include[v] = true;
        }
    });
    return include;
};
exports.castEagerQueryToPrismaInclude = castEagerQueryToPrismaInclude;
const buildWhereAndInclude = (query, whitelist) => {
    const where = {};
    let include = {};
    Object.keys(query).forEach((k) => {
        const value = query[k];
        if (k === '$or' && Array.isArray(value)) {
            where.OR = value.map((v) => (0, exports.buildWhereAndInclude)(v, whitelist).where);
        }
        else if (k !== '$eager' && typeof value === 'object' && !Array.isArray(value)) {
            where[k] = (0, exports.castFeathersQueryToPrismaFilters)(value, whitelist);
        }
        else if (k !== '$eager' && typeof value !== 'object' && !Array.isArray(value)) {
            where[k] = (0, exports.castToNumberBooleanStringOrNull)(value);
        }
        else if (k === '$eager' && whitelist.includes(k)) {
            const eager = value;
            include = (0, exports.castEagerQueryToPrismaInclude)(eager);
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
const buildPrismaQueryParams = ({ query, filters, whitelist }) => {
    let select = (0, exports.buildSelect)(filters.$select || []);
    const selectExists = Object.keys(select).length > 0;
    const { where, include } = (0, exports.buildWhereAndInclude)(query, whitelist);
    const includeExists = Object.keys(include).length > 0;
    const orderBy = (0, exports.buildOrderBy)(filters.$sort || {});
    const { skip, take } = (0, exports.buildPagination)(filters.$skip, filters.$limit);
    if (selectExists) {
        select = Object.assign(Object.assign({}, select), include);
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
exports.buildPrismaQueryParams = buildPrismaQueryParams;
