"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePrismaService = void 0;
const lib_1 = require("@feathersjs/adapter-commons/lib");
class BasePrismaService extends lib_1.AdapterService {
    find(params) {
        return super.find(params);
    }
    get(id, params) {
        return super.get(id, params);
    }
    create(data, params) {
        return super.create(data, params);
    }
    update(id, data, params) {
        return super.update(id, data, params);
    }
    patch(id, data, params) {
        return super.patch(id, data, params);
    }
    remove(id, params) {
        return super.remove(id, params);
    }
}
exports.BasePrismaService = BasePrismaService;
