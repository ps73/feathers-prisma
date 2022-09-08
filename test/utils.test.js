const { PrismaClient } = require('@prisma/client');
const feathers = require('@feathersjs/feathers');
const { prismaService } = require('../dist');
const { buildPrismaQueryParams } = require('../dist/utils');
const { expect } = require('chai');

const app = feathers();
const prismaClient = new PrismaClient();

const todos = prismaService({
  model: 'todo',
  multi: ['create', 'patch', 'remove'],
  whitelist: ['$eager'],
}, prismaClient);

const users = prismaService({
  model: 'user',
  events: ['testing'],
  whitelist: ['$eager', '$rawWhere'],
}, prismaClient);


app.use('/todos', todos);
app.use('/users', users);

describe('Feathers Prisma Utils', () => {

  before(async () => {
    await prismaClient.$connect();
    await prismaClient.todo.deleteMany({});
    await prismaClient.people.deleteMany({});
    await prismaClient.user.deleteMany({});
    await prismaClient.peopleId.deleteMany({});
  });

  after(async () => {
    await prismaClient.$disconnect();
  });

  afterEach(async () => {
    await prismaClient.todo.deleteMany({});
    await prismaClient.people.deleteMany({});
    await prismaClient.user.deleteMany({});
    await prismaClient.peopleId.deleteMany({});
  });

  describe('the \'buildPrismaQueryParams\' function', () => {


    beforeEach(async () => {
      const data = await prismaClient.user.create({
        data: {
          name: 'Max Power',
          age: 19,
          todos: {
            create: [
              { title: 'Todo1', prio: 1 }
            ],
          }
        }
      });

      await prismaClient.todo.create({ data: { title: 'Lorem', prio: 1, userId: data.id }, });
      await prismaClient.todo.create({ data: { title: 'Lorem Ipsum', prio: 1, userId: data.id, tag1: 'TEST' }, });
      await prismaClient.todo.create({ data: { title: '[TODO]', prio: 1, userId: data.id, tag1: 'TEST2' }, });
    });



    it('should only have one result if the id field is set', async () => {

      const [first, second, third] = await prismaClient.todo.findMany();

      const { where } = buildPrismaQueryParams({
        query: {
          id: {
            $in: [first.id, second.id, third.id]
          }
        },
        id: first.id,
        filters: {},
        whitelist: ['$in']
      }, 'id');

      const result = await prismaClient.todo.findFirst({ where });

      expect(result).to.be.not.null;
      expect(result).to.be.deep.eq(first);

      const todos = await prismaClient.todo.findMany({ where });

      expect(todos).to.be.have.length(1);
      expect(todos[0]).to.be.deep.eq(first);
    });

    it('should only have one result if the id field is set even if the prisma query overwrites are set', async () => {

      const [first, second, third] = await prismaClient.todo.findMany();

      const { where } = buildPrismaQueryParams({
        query: {},
        id: first.id,
        filters: {},
        whitelist: ['$in']
      }, 'id', { where: { id: { in: [first.id, second.id, third.id] } } });

      const result = await prismaClient.todo.findFirst({ where });

      expect(result).to.be.not.null;
      expect(result).to.be.deep.eq(first);

      const todos = await prismaClient.todo.findMany({ where });

      expect(todos).to.be.have.length(1);
      expect(todos[0]).to.be.deep.eq(first);
    });

    it('should have NO result because the requested id is exclude with the feathers query', async () => {
      const [first] = await prismaClient.todo.findMany();

      const { where } = buildPrismaQueryParams({
        query: {
          id: {
            $nin: [first.id]
          }
        },
        id: first.id,
        filters: {},
        whitelist: ['$in', '$nin']
      }, 'id');

      const result = await prismaClient.todo.findFirst({ where });

      expect(result).to.be.null;

      const todos = await prismaClient.todo.findMany({ where });

      expect(todos).to.be.have.length(0);
    });

    it('should have NO result because the requested id is exclude with the prisma query overwrite', async () => {
      const [first, second, third] = await prismaClient.todo.findMany();

      const { where } = buildPrismaQueryParams({
        query: {
          id: {
            $in: [first.id]
          }
        },
        id: first.id,
        filters: {},
        whitelist: ['$in', '$nin']
      }, 'id', { where: { id: { in: [second.id, third.id] } } });

      const result = await prismaClient.todo.findFirst({ where });

      expect(result).to.be.null;

      const todos = await prismaClient.todo.findMany({ where });

      expect(todos).to.be.have.length(0);
    });

  });
});