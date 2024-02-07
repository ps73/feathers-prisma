const { FeathersError } = require('@feathersjs/errors');
const { errorHandler } = require('../dist');
const { assert, expect } = require('chai');
const Prisma = require("@prisma/client");

describe('the \'buildPrismaQueryParams\' function', () => {
  const MESSAGE = 'test';
  const ERROR_BODY = {meta: 'meta', message: 'test', clientVersion: '5.9.1'}

  it('It should return error if instance of errors.FeathersError', async () => {
    try {
      const error = new FeathersError('Test Error');
      errorHandler(error, 'findUnique');
    } catch (error) {
      assert.ok(error instanceof FeathersError);
    }
  });

  it('It should return common type feathers error for P1000', async () => {
    const code = 'P1000';
    const ERROR = { code, ...ERROR_BODY };
    try {
      const error = new Prisma.PrismaClientKnownRequestError(MESSAGE, ERROR);
      errorHandler(error, 'findUnique');
    } catch (error) {
      assert.ok(error instanceof FeathersError);
      expect(error.name).to.be.equal('GeneralError');
      expect(error.message).to.be.equal(MESSAGE);
      expect(error.code).to.be.equal(500);
      expect(error.className).to.be.equal('general-error');
    }
  });

  it('It should return query type feathers error for P2025', async () => {
    const code = 'P2025';
    const ERROR = {code, ...ERROR_BODY};
    try {
      const error = new Prisma.PrismaClientKnownRequestError(MESSAGE, ERROR);
      errorHandler(error, 'findUnique');
    } catch (error) {
      assert.ok(error instanceof FeathersError);
      expect(error.name).to.be.equal('NotFound');
      expect(error.message).to.be.equal('Record not found.');
      expect(error.code).to.be.equal(404);
      expect(error.className).to.be.equal('not-found');
    }
    try {
      const error = new Prisma.PrismaClientKnownRequestError(MESSAGE, { ...ERROR, meta: { cause: 'Something is wrong.' } });
      errorHandler(error, 'findUnique');
    } catch (error) {
      assert.ok(error instanceof FeathersError);
      expect(error.name).to.be.equal('NotFound');
      expect(error.message).to.be.equal('Something is wrong.');
      expect(error.code).to.be.equal(404);
      expect(error.className).to.be.equal('not-found');
    }
    try {
      const error = new Prisma.PrismaClientKnownRequestError(MESSAGE, { ...ERROR, meta: null });
      errorHandler(error, 'findUnique');
    } catch (error) {
      assert.ok(error instanceof FeathersError);
      expect(error.name).to.be.equal('NotFound');
      expect(error.message).to.be.equal('Record not found.');
      expect(error.code).to.be.equal(404);
      expect(error.className).to.be.equal('not-found');
    }
    try {
      const error = new Prisma.PrismaClientKnownRequestError(MESSAGE, { code: 'P2000' });
      errorHandler(error, 'findUnique');
    } catch (error) {
      assert.ok(error instanceof FeathersError);
      expect(error.name).to.be.equal('BadRequest');
      expect(error.message).to.be.equal(MESSAGE);
      expect(error.code).to.be.equal(400);
      expect(error.className).to.be.equal('bad-request');
    }
  });

  it('It should return migration type feathers error for P3000 to P4000', async () => {
    const code = 'P3000';
    const ERROR = {code, ...ERROR_BODY};
    try {
      const error = new Prisma.PrismaClientKnownRequestError(MESSAGE, ERROR);
      errorHandler(error, 'findUnique');
    } catch (error) {
      assert.ok(error instanceof FeathersError);
      expect(error.name).to.be.equal('GeneralError');
      expect(error.message).to.be.equal(MESSAGE);
      expect(error.code).to.be.equal(500);
      expect(error.className).to.be.equal('general-error');
    }
  });

  it('It should return introspection type feathers error for P4000 to P5000', async () => {
    const code = 'P4000';
    const ERROR = {code, ...ERROR_BODY};
    try {
      const error = new Prisma.PrismaClientKnownRequestError(MESSAGE, ERROR);
      errorHandler(error, 'findUnique');
    } catch (error) {
      assert.ok(error instanceof FeathersError);
      expect(error.name).to.be.equal('GeneralError');
      expect(error.message).to.be.equal(MESSAGE);
      expect(error.code).to.be.equal(500);
      expect(error.className).to.be.equal('general-error');
    }
  });

  it('It should return default bad request type feathers error for > P5000', async () => {
    const code = 'P5000';
    const ERROR = {code, ...ERROR_BODY};
    try {
      const error = new Prisma.PrismaClientKnownRequestError(MESSAGE, ERROR);
      errorHandler(error, 'findUnique');
    } catch (error) {
      assert.ok(error instanceof FeathersError);
      expect(error.name).to.be.equal('BadRequest');
      expect(error.message).to.be.equal(MESSAGE);
      expect(error.code).to.be.equal(400);
      expect(error.className).to.be.equal('bad-request');
    }
  });

  it('It should return prisma errors for PrismaClientValidationError and methods 4 methods', async () => {
    const code = 'P2025';
    const ERROR = {code, ...ERROR_BODY};
    const prismaMethods = ['findUnique', 'remove', 'update', 'delete'];
    for (const prismaMethod of prismaMethods) {
      try {
        const error = new Prisma.PrismaClientValidationError(MESSAGE, ERROR);
        errorHandler(error, prismaMethod);
      } catch (error) {
        assert.ok(error instanceof FeathersError);
        expect(error.name).to.be.equal('NotFound');
        expect(error.message).to.be.equal('Record not found.');
        expect(error.code).to.be.equal(404);
        expect(error.className).to.be.equal('not-found');
      }
    }
    try {
      const error = new Prisma.PrismaClientValidationError(MESSAGE, ERROR);
      errorHandler(error, 'unknownMethod');
    } catch (error) {
      assert.ok(error instanceof FeathersError);
      expect(error.name).to.be.equal('GeneralError');
      expect(error.message).to.be.equal(MESSAGE);
      expect(error.code).to.be.equal(500);
      expect(error.className).to.be.equal('general-error');
    }
  });

  it('It should return general feathers error for all other errors.', async () => {
    try {
      const error = new Error(MESSAGE);
      errorHandler(error, 'findUnique');
    } catch (error) {
      assert.ok(error instanceof FeathersError);
      expect(error.name).to.be.equal('GeneralError');
      expect(error.message).to.be.equal(MESSAGE);
      expect(error.code).to.be.equal(500);
      expect(error.className).to.be.equal('general-error');
    }
  });
});
