"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("@feathersjs/errors");
const index_1 = require("@prisma/client/runtime/index");
function getType(v) {
    let type = '';
    const cases = {
        common: v >= 1000 && v < 2000,
        query: v >= 2000 && v < 3000,
        migration: v >= 3000 && v < 4000,
        introspection: v >= 4000 && v < 4000,
    };
    Object.keys(cases).map((key) => {
        // @ts-ignore
        if (cases[key]) {
            type = key;
        }
        return key;
    });
    return type;
}
function errorHandler(error) {
    let feathersError;
    if (error instanceof errors.FeathersError) {
        feathersError = error;
    }
    else if (error instanceof index_1.PrismaClientKnownRequestError) {
        const { code, meta, message, clientVersion, } = error;
        const errType = getType(Number(code.substring(1)));
        switch (errType) {
            case 'common':
                feathersError = new errors.GeneralError(message, { code, meta, clientVersion });
                break;
            case 'query':
                feathersError = new errors.BadRequest(message, { code, meta, clientVersion });
                break;
            case 'migration':
                feathersError = new errors.GeneralError(message, { code, meta, clientVersion });
                break;
            case 'introspection':
                feathersError = new errors.GeneralError(message, { code, meta, clientVersion });
                break;
            default:
                feathersError = new errors.BadRequest(message, { code, meta, clientVersion });
        }
    }
    throw feathersError;
}
exports.default = errorHandler;