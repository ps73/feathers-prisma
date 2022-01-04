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
class PrismaService extends adapter_commons_1.AdapterService {
    constructor(options, client) {
        super({
            id: options.id || 'id',
            paginate: {
                default: options.paginate && options.paginate.default || 25,
                max: options.paginate && options.paginate.max || 100,
            },
            multi: options.multi || [],
            whitelist: Object.values(constants_1.OPERATORS).concat(options.whitelist || []),
        });
        this.idGenerator = () => '';
        const { model, useIdGeneration, idGenerator } = options;
        if (!model) {
            throw new errors.GeneralError('You must provide a model string');
        }
        // @ts-ignore
        if (!client[model]) {
            throw new errors.GeneralError(`No model with name ${model} found in prisma client.`);
        }
        if (useIdGeneration && idGenerator)
            this.idGenerator = idGenerator;
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
            });
            const [data, count] = yield this.client.$transaction([
                this.Model.findMany(Object.assign({ skip,
                    take,
                    orderBy,
                    where }, (0, utils_1.buildSelectOrInclude)({ select, include }))),
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
        });
    }
    _get(id, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query, filters } = this.filterQuery(params);
            const { whitelist } = this.options;
            const { where, select, include } = (0, utils_1.buildPrismaQueryParams)({
                id, query, filters, whitelist,
            });
            const result = yield this.Model.findUnique(Object.assign({ where }, (0, utils_1.buildSelectOrInclude)({ select, include })));
            return result;
        });
    }
    _create(data, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query, filters } = this.filterQuery(params);
            const { whitelist } = this.options;
            const { select, include } = (0, utils_1.buildPrismaQueryParams)({ query, filters, whitelist });
            if (Array.isArray(data)) {
                const result = yield this.client.$transaction(data.map((d) => this.Model.create(Object.assign({ data: d }, (0, utils_1.buildSelectOrInclude)({ select, include })))));
                return result;
            }
            const result = yield this.Model.create(Object.assign({ data }, (0, utils_1.buildSelectOrInclude)({ select, include })));
            return result;
        });
    }
    _update(id, data, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query, filters } = this.filterQuery(params);
            const { whitelist } = this.options;
            const { where, select, include } = (0, utils_1.buildPrismaQueryParams)({
                id, query, filters, whitelist,
            });
            const result = yield this.Model.update(Object.assign({ data,
                where }, (0, utils_1.buildSelectOrInclude)({ select, include })));
            return result;
        });
    }
    _patch(id, data, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (id && !Array.isArray(data)) {
                const result = yield this._update(id, data, params);
                return result;
            }
            const { query, filters } = this.filterQuery(params);
            const { whitelist } = this.options;
            const { where, select, include } = (0, utils_1.buildPrismaQueryParams)({ query, filters, whitelist });
            const result = yield this.Model.updateMany(Object.assign({ data,
                where }, (0, utils_1.buildSelectOrInclude)({ select, include })));
            return result;
        });
    }
    _remove(id, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query, filters } = this.filterQuery(params);
            const { whitelist } = this.options;
            if (id) {
                const { where, select, include } = (0, utils_1.buildPrismaQueryParams)({
                    id, query, filters, whitelist,
                });
                const result = yield this.Model.delete(Object.assign({ where }, (0, utils_1.buildSelectOrInclude)({ select, include })));
                return result;
            }
            const { where, select, include } = (0, utils_1.buildPrismaQueryParams)({ query, filters, whitelist });
            const result = yield this.Model.deleteMany(Object.assign({ where }, (0, utils_1.buildSelectOrInclude)({ select, include })));
            return result;
        });
    }
}
exports.PrismaService = PrismaService;
function service(options, client) {
    return new PrismaService(options, client);
}
exports.service = service;
exports.prismaService = service;
