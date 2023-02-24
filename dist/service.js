"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaService = exports.service = exports.PrismaService = void 0;
const errors = require("@feathersjs/errors");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const error_handler_1 = require("./error-handler");
const base_prisma_service_1 = require("./base-prisma-service");
class PrismaService extends base_prisma_service_1.BasePrismaService {
    constructor(options, client) {
        var _a, _b;
        super({
            id: options.id || 'id',
            paginate: {
                default: (_a = options.paginate) === null || _a === void 0 ? void 0 : _a.default,
                max: (_b = options.paginate) === null || _b === void 0 ? void 0 : _b.max,
            },
            multi: options.multi || [],
            filters: options.filters || [],
            events: options.events || [],
            whitelist: Object.values(constants_1.OPERATORS).concat(options.whitelist || []),
            // @ts-ignore
            model: options.model || ''
        });
        const { model } = options;
        if (!model) {
            throw new errors.GeneralError('You must provide a model string.');
        }
        if (!(model in client)) {
            throw new errors.GeneralError(`No model with name ${model} found in prisma client.`);
        }
        this.client = client;
        this.Model = client[model];
    }
    async _find(params = {}) {
        const { query, filters } = this.filterQuery(params);
        const { whitelist } = this.options;
        const { skip, take, orderBy, where, select, include } = (0, utils_1.buildPrismaQueryParams)({
            query, filters, whitelist,
        }, this.options.id, params.prisma);
        try {
            const findMany = () => {
                return this.Model.findMany({
                    ...(typeof take === 'number' ? { skip, take } : { skip }),
                    orderBy,
                    where,
                    ...(0, utils_1.buildSelectOrInclude)({ select, include }),
                });
            };
            if (!this.options.paginate.default || (typeof take !== 'number' && !take)) {
                const data = await findMany();
                return data;
            }
            const [data, count] = await this.client.$transaction([
                findMany(),
                this.Model.count({ where }),
            ]);
            const result = {
                total: count,
                skip,
                limit: take,
                data,
            };
            return result;
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e);
        }
    }
    async _get(id, params = {}) {
        try {
            if (!id) {
                throw new errors.MethodNotAllowed('Can not call get without a id');
            }
            const { query, filters } = this.filterQuery(params);
            const { whitelist } = this.options;
            const { where, select, include } = (0, utils_1.buildPrismaQueryParams)({
                id, query, filters, whitelist
            }, this.options.id, params.prisma);
            const result = await this.Model.findFirst({
                where,
                ...(0, utils_1.buildSelectOrInclude)({ select, include }),
            });
            if (!result)
                throw new errors.NotFound(`No record found for ${this.options.id} '${id}'`);
            return result;
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, 'findUnique');
        }
    }
    async _create(data, params = {}) {
        const { query, filters } = this.filterQuery(params);
        const { whitelist } = this.options;
        const { select, include } = (0, utils_1.buildPrismaQueryParams)({ query, filters, whitelist }, this.options.id, params.prisma);
        try {
            if (Array.isArray(data)) {
                const result = await this.client.$transaction(data.map((d) => this.Model.create({
                    data: d,
                    ...(0, utils_1.buildSelectOrInclude)({ select, include }),
                })));
                return result;
            }
            const result = await this.Model.create({
                data,
                ...(0, utils_1.buildSelectOrInclude)({ select, include }),
            });
            return result;
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e);
        }
    }
    async _update(id, data, params = {}) {
        return this._patchOrUpdate(id, data, params, false);
    }
    async _patch(id, data, params = {}) {
        return this._patchOrUpdate(id, data, params);
    }
    async _patchOrUpdate(id, data, params = {}, shouldReturnResult = true) {
        const { query, filters } = this.filterQuery(params);
        const { whitelist } = this.options;
        const { where, select, include } = (0, utils_1.buildPrismaQueryParams)({ id: id || undefined, query, filters, whitelist }, this.options.id, params.prisma);
        if (id === null) {
            return await this._patchOrUpdateMany(data, where, select, include);
        }
        else {
            return await this._patchOrUpdateSingle(id, data, where, select, include, shouldReturnResult);
        }
    }
    async _patchOrUpdateMany(data, where, select, include) {
        try {
            // TODO: Currently there is no better solution, if it is possible to handle all three database calls in one transaction, that should be fixed.
            const [result] = await this.client.$transaction([
                this.Model.findMany({
                    where,
                    select: { [this.options.id]: true }
                }),
                this.Model.updateMany({
                    data,
                    where,
                }),
            ]);
            return this.Model.findMany({
                where: {
                    [this.options.id]: {
                        in: result.map((item) => item[this.options.id])
                    }
                },
                ...(0, utils_1.buildSelectOrInclude)({ select, include })
            });
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, 'updateMany');
        }
    }
    async _patchOrUpdateSingle(id, data, where, select, include, shouldReturnResult) {
        try {
            // TODO: Currently there is no better solution, if it is possible to handle all three database calls in one transaction, that should be fixed.
            const [result, { count }] = await this.client.$transaction([
                this.Model.findFirst({
                    where,
                    select: {
                        [this.options.id]: true
                    },
                }),
                this.Model.updateMany({
                    data,
                    where,
                }),
            ]);
            if (count > 0 && !result) {
                throw new Error('[_patchOrUpdateSingle]: Patched multiple item but has no result.');
            }
            else if (!result) {
                throw new errors.NotFound(`No record found for ${this.options.id} '${id}'`);
            }
            else if (count > 1) {
                throw new Error('[_patchOrUpdateSingle]: Multi records updated. Expected single update.');
            }
            if (select || shouldReturnResult) {
                return this.Model.findFirst({
                    where: { [this.options.id]: id },
                    ...(0, utils_1.buildSelectOrInclude)({ select, include }),
                });
            }
            return { [this.options.id]: id, ...data };
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, 'update');
        }
    }
    async _remove(id, params = {}) {
        const { query, filters } = this.filterQuery(params);
        const { whitelist } = this.options;
        const { where, select, include } = (0, utils_1.buildPrismaQueryParams)({
            id: id || undefined, query, filters, whitelist,
        }, this.options.id, params.prisma);
        if (id === null) {
            return this._removeMany(where, select, include);
        }
        else {
            return this._removeSingle(id, where, select, include);
        }
    }
    async _removeSingle(id, where, select, include) {
        try {
            const [data] = await this.client.$transaction([
                this.Model.findFirst({
                    where: where,
                    ...(0, utils_1.buildSelectOrInclude)({ select, include }),
                }),
                this.Model.deleteMany({ where }),
            ]);
            if (!data) {
                throw new errors.NotFound(`No record found for ${this.options.id} '${id}'`);
            }
            return data;
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, 'delete');
        }
    }
    async _removeMany(where, select, include) {
        try {
            const [data] = await this.client.$transaction([
                this.Model.findMany({
                    where: where,
                    ...(0, utils_1.buildSelectOrInclude)({ select, include }),
                }),
                this.Model.deleteMany({ where }),
            ]);
            return data;
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, 'deleteMany');
        }
    }
}
exports.PrismaService = PrismaService;
function service(options, client) {
    return new PrismaService(options, client);
}
exports.service = service;
exports.prismaService = service;
