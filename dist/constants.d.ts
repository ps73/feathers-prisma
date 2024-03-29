export declare const OPERATORS: {
    not: string;
    gte: string;
    gt: string;
    lte: string;
    lt: string;
    in: string;
    notIn: string;
    and: string;
    or: string;
    contains: string;
    startsWith: string;
    endsWith: string;
    mode: string;
};
export declare const OPERATORS_MAP: {
    $lt: string;
    $lte: string;
    $gt: string;
    $gte: string;
    $in: string;
    $nin: string;
    $ne: string;
    $eager: string;
    /**
     * @deprecated use $prisma instead
     */
    $rawWhere: string;
    $prisma: string;
    $contains: string;
    $search: string;
    $startsWith: string;
    $endsWith: string;
    $mode: string;
};
