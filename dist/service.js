"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaService = exports.service = exports.PrismaService = void 0;
const adapter_commons_1 = require("@feathersjs/adapter-commons");
const errors = require("@feathersjs/errors");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const error_handler_1 = require("./error-handler");
class PrismaService extends adapter_commons_1.AdapterService {
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
        });
        const { model } = options;
        if (!model) {
            throw new errors.GeneralError('You must provide a model string.');
        }
        // @ts-ignore
        if (!client[model]) {
            throw new errors.GeneralError(`No model with name ${model} found in prisma client.`);
        }
        this.client = client;
        // @ts-ignore
        this.Model = client[model];
    }
    _find(params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query, filters } = this.filterQuery(params);
            const { whitelist } = this.options;
            const { skip, take, orderBy, where, select, include } = (0, utils_1.buildPrismaQueryParams)({
                query, filters, whitelist,
            }, this.options.id);
            try {
                const findMany = () => {
                    return this.Model.findMany(Object.assign(Object.assign(Object.assign({}, (typeof take === 'number' ? { skip, take } : { skip })), { orderBy,
                        where }), (0, utils_1.buildSelectOrInclude)({ select, include })));
                };
                if (!this.options.paginate.default || (typeof take !== 'number' && !take)) {
                    const data = yield findMany();
                    return data;
                }
                const [data, count] = yield this.client.$transaction([
                    findMany(),
                    this.Model.count({
                        where,
                    }),
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
        });
    }
    _get(id, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { query, filters } = this.filterQuery(params);
                const { whitelist } = this.options;
                const { where, select, include } = (0, utils_1.buildPrismaQueryParams)({
                    id, query, filters, whitelist,
                }, this.options.id);
                if (typeof query.id === 'object') {
                    const result = yield this.Model.findFirst(Object.assign({ where: Object.assign(Object.assign({}, where), { id: Object.assign(Object.assign({}, where.id), { equals: id }) }) }, (0, utils_1.buildSelectOrInclude)({ select, include })));
                    if (!result)
                        throw new errors.NotFound(`No record found for id '${id}' and query`);
                    return result;
                }
                (0, utils_1.checkIdInQuery)({ id, query, idField: this.options.id });
                const result = yield this.Model.findUnique(Object.assign({ where }, (0, utils_1.buildSelectOrInclude)({ select, include })));
                if (!result)
                    throw new errors.NotFound(`No record found for id '${id}'`);
                return result;
            }
            catch (e) {
                (0, error_handler_1.errorHandler)(e, 'findUnique');
            }
        });
    }
    _create(data, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query, filters } = this.filterQuery(params);
            const { whitelist } = this.options;
            const { select, include } = (0, utils_1.buildPrismaQueryParams)({ query, filters, whitelist }, this.options.id);
            try {
                if (Array.isArray(data)) {
                    const result = yield this.client.$transaction(data.map((d) => this.Model.create(Object.assign({ data: d }, (0, utils_1.buildSelectOrInclude)({ select, include })))));
                    return result;
                }
                const result = yield this.Model.create(Object.assign({ data }, (0, utils_1.buildSelectOrInclude)({ select, include })));
                return result;
            }
            catch (e) {
                (0, error_handler_1.errorHandler)(e);
            }
        });
    }
    _update(id, data, params = {}, returnResult = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query, filters } = this.filterQuery(params);
            const { whitelist } = this.options;
            const { where, select, include } = (0, utils_1.buildPrismaQueryParams)({
                id, query, filters, whitelist,
            }, this.options.id);
            try {
                (0, utils_1.checkIdInQuery)({ id, query, idField: this.options.id });
                const result = yield this.Model.update(Object.assign({ data,
                    where }, (0, utils_1.buildSelectOrInclude)({ select, include })));
                if (select || returnResult) {
                    return result;
                }
                return Object.assign({ [this.options.id]: result.id }, data);
            }
            catch (e) {
                (0, error_handler_1.errorHandler)(e, 'update');
            }
        });
    }
    _patch(id, data, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (id && !Array.isArray(data)) {
                const result = yield this._update(id, data, params, true);
                return result;
            }
            const { query, filters } = this.filterQuery(params);
            const { whitelist } = this.options;
            const { where, select, include } = (0, utils_1.buildPrismaQueryParams)({ query, filters, whitelist }, this.options.id);
            try {
                const [, result] = yield this.client.$transaction([
                    this.Model.updateMany(Object.assign({ data,
                        where }, (0, utils_1.buildSelectOrInclude)({ select, include }))),
                    this.Model.findMany(Object.assign({ where: Object.assign(Object.assign({}, where), data) }, (0, utils_1.buildSelectOrInclude)({ select, include }))),
                ]);
                return result;
            }
            catch (e) {
                (0, error_handler_1.errorHandler)(e, 'updateMany');
            }
        });
    }
    _remove(id, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query, filters } = this.filterQuery(params);
            const { whitelist } = this.options;
            if (id) {
                const { where, select, include } = (0, utils_1.buildPrismaQueryParams)({
                    id, query, filters, whitelist,
                }, this.options.id);
                try {
                    (0, utils_1.checkIdInQuery)({ id, query, allowOneOf: true, idField: this.options.id });
                    const result = yield this.Model.delete(Object.assign({ where: id ? { [this.options.id]: id } : where }, (0, utils_1.buildSelectOrInclude)({ select, include })));
                    return result;
                }
                catch (e) {
                    (0, error_handler_1.errorHandler)(e, 'delete');
                }
            }
            const { where, select, include } = (0, utils_1.buildPrismaQueryParams)({ query, filters, whitelist }, this.options.id);
            try {
                const query = Object.assign({ where }, (0, utils_1.buildSelectOrInclude)({ select, include }));
                const [data] = yield this.client.$transaction([
                    this.Model.findMany(query),
                    this.Model.deleteMany(query),
                ]);
                return data;
            }
            catch (e) {
                (0, error_handler_1.errorHandler)(e, 'deleteMany');
            }
        });
    }
}
exports.PrismaService = PrismaService;
function service(options, client) {
    return new PrismaService(options, client);
}
exports.service = service;
exports.prismaService = service;
