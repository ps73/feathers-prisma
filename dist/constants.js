"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATORS_MAP = exports.OPERATORS = void 0;
exports.OPERATORS = {
    not: '$ne',
    gte: '$gte',
    gt: '$gt',
    lte: '$lte',
    lt: '$lt',
    in: '$in',
    notIn: '$nin',
    // specific to prisma
    contains: '$contains',
    startsWith: '$startsWith',
    endsWidth: '$endsWith',
    mode: '$mode',
};
exports.OPERATORS_MAP = {
    $lt: 'lt',
    $lte: 'lte',
    $gt: 'gt',
    $gte: 'gte',
    $in: 'in',
    $nin: 'notIn',
    $ne: 'not',
    $eager: 'includes',
    // specific to prisma
    $contains: 'contains',
    $search: 'search',
    $startsWith: 'startsWith',
    $endsWidth: 'endsWith',
    $mode: 'mode',
};