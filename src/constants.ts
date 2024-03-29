export const OPERATORS = {
  not: '$ne',
  gte: '$gte',
  gt: '$gt',
  lte: '$lte',
  lt: '$lt',
  in: '$in',
  notIn: '$nin',
  and: '$and',
  or: '$or',
  // specific to prisma
  contains: '$contains',
  startsWith: '$startsWith',
  endsWith: '$endsWith',
  mode: '$mode',
};

export const OPERATORS_MAP = {
  $lt: 'lt',
  $lte: 'lte',
  $gt: 'gt',
  $gte: 'gte',
  $in: 'in',
  $nin: 'notIn',
  $ne: 'not',
  $eager: 'includes',
  // specific to prisma
  /**
   * @deprecated use $prisma instead
   */
  $rawWhere: 'rawWhere',
  $prisma: 'prisma',
  $contains: 'contains',
  $search: 'search',
  $startsWith: 'startsWith',
  $endsWith: 'endsWith',
  $mode: 'mode',
};
