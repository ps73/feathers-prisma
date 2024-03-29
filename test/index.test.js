const { expect } = require('chai');
const { service, PrismaService, prismaService } = require('../dist');
const feathers = require('@feathersjs/feathers');
const adapterTests = require('@feathersjs/adapter-tests');
const errors = require('@feathersjs/errors');
const { PrismaClient } = require('@prisma/client');

const testSuite = adapterTests([
  '.options',
  '.events',
  '._get',
  '._find',
  '._create',
  '._update',
  '._patch',
  '._remove',
  '.get',
  '.get + $select',
  '.get + id + query',
  '.get + NotFound',
  '.find',
  '.remove',
  '.remove + $select',
  '.remove + id + query',
  '.remove + multi',
  '.update',
  '.update + $select',
  '.update + id + query',
  '.update + NotFound',
  '.update + query + NotFound',
  '.patch',
  '.patch + $select',
  '.patch + id + query',
  '.patch multiple',
  '.patch + NotFound',
  '.patch multi query same',
  '.patch multi query changed',
  '.patch + query + NotFound',
  '.create',
  '.create + $select',
  '.create multi',
  'internal .find',
  'internal .get',
  'internal .create',
  'internal .update',
  'internal .patch',
  'internal .remove',
  '.find + equal',
  '.find + equal multiple',
  '.find + $sort',
  '.find + $sort + string',
  '.find + $limit',
  '.find + $limit 0',
  '.find + $skip',
  '.find + $select',
  '.find + $or',
  '.find + $in',
  '.find + $nin',
  '.find + $lt',
  '.find + $lte',
  '.find + $gt',
  '.find + $gte',
  '.find + $ne',
  '.find + $gt + $lt + $sort',
  '.find + $or nested + $sort',
  '.find + paginate',
  '.find + paginate + $limit + $skip',
  '.find + paginate + $limit 0',
  '.find + paginate + params',
  '.get + id + query id',
  '.remove + id + query id',
  '.update + id + query id',
  '.patch + id + query id'
]);

const app = feathers();
const prismaClient = new PrismaClient();

try {
  prismaClient.$connect();
} catch (e) {
  console.error(e);
}

const users = prismaService({
  model: 'user',
  events: ['testing'],
  whitelist: ['$eager', '$prisma'],
}, prismaClient);

const people = prismaService({
  model: 'people',
  events: ['testing'],
}, prismaClient);

const peopleId = prismaService({
  model: 'peopleId',
  id: 'customid',
  events: ['testing'],
}, prismaClient);

const todos = prismaService({
  model: 'todo',
  multi: ['create', 'patch', 'remove'],
  whitelist: ['$eager'],
}, prismaClient);

app.use('/users', users);
app.use('/people', people);
app.use('/people-customid', peopleId);
app.use('/todos', todos);


describe('Feathers Prisma Service', () => {
  describe('Initialization', () => {
    it('clears database', async () => {
      await prismaClient.$connect();
      await prismaClient.people.deleteMany({});
      await prismaClient.user.deleteMany({});
      await prismaClient.peopleId.deleteMany({});
      await prismaClient.todo.deleteMany({});
    });

    describe('when missing a model', () => {
      it('throws an error', () =>
        expect(service.bind(null, {}, prismaClient))
          .to.throw(/You must provide a model string/)
      );
    });

    describe('when model is not included in prisma client', () => {
      it('throws an error', () =>
        expect(service.bind(null, { model: 'test' }, prismaClient))
          .to.throw('No model with name test found in prisma client.')
      );
    });

    describe('test basic functionality of exported members', () => {
      it('class and functions in parity', () => {
        const peopleService = app.service('people');
        expect(typeof service).to.equal('function', 'It worked');
        expect(typeof prismaService).to.equal('function', 'It worked');
        expect(peopleService.Model)
          .to.equal(new PrismaService({ model: 'people' }, prismaClient).Model);
        expect(peopleService.Model)
          .to.equal(prismaService({ model: 'people' }, prismaClient).Model);
        expect(prismaService({ model: 'people', id: 'customid' }, prismaClient).options.id)
          .to.not.equal(peopleService.options.id);
      });
    });
  });

  describe('Custom tests', () => {
    const usersService = app.service('users');
    const todosService = app.service('todos');
    const peopleService = app.service('people');

    let data;
    beforeEach(async () => {
      data = await usersService.create({
        name: 'Max Power',
        age: 19,
        todos: {
          create: [
            { title: 'Todo1', prio: 1 }
          ],
        }
      }, {
        query: {
          $eager: ['todos'],
        },
      });
    });

    afterEach(async () => {
      await todosService.remove(null, { userId: data.id });
      await usersService.remove(data.id);
    });

    describe('relations', () => {
      it('creates with related items', () => {
        expect(data.todos.length).to.equal(1);
      });
      it('.find + eager loading related item', async () => {
        const result = await todosService.find({
          query: {
            $eager: {
              user: ['name'],
            },
          },
        });
        expect(result[0].user.id).to.equal(result[0].userId);
      });
      it('.find + deep eager loading related item', async () => {
        const result = await todosService.find({
          query: {
            $eager: [['user', ['todos', ['user']]]],
          },
        });
        expect(result[0].user.todos[0].user.id).to.equal(result[0].user.todos[0].userId);
      });

      it('.find + throws $eager type error', async () => {
        try {
          await todosService.find({
            query: {
              $eager: [true],
            },
          });
          console.error('never goes here');
        } catch (e) {
          expect(e.code).to.be.equal('FP1001');
        }
      });
    });

    describe('custom query', () => {
      beforeEach(async () => {
        await todosService.create([
          { title: 'Lorem', prio: 1, userId: data.id },
          { title: 'Lorem Ipsum', prio: 1, userId: data.id, tag1: 'TEST' },
          { title: '[TODO]', prio: 1, userId: data.id, tag1: 'TEST2' },
        ]);
      });

      it('.find + $contains', async () => {
        const results = await todosService.find({
          query: {
            title: {
              $contains: 'lorem',
            },
          },
        });
        expect(results.length).to.equal(2);
      });

      it('.find + $startsWith', async () => {
        const results = await todosService.find({
          query: {
            title: {
              $startsWith: 'lorem',
            },
          },
        });
        expect(results.length).to.equal(2);
      });

      it('.find + $endsWith', async () => {
        const results = await todosService.find({
          query: {
            title: {
              $endsWith: 'o]',
            },
          },
        });
        expect(results.length).to.equal(1);
      });

      it('.find + query field "null" value', async () => {
        const results = await todosService.find({
          query: {
            tag1: 'null',
          },
        });
        expect(results.length).to.equal(2);
      });

      it('.find + $prisma + query related items', async () => {
        await todosService.create([
          { title: 'Todo2', prio: 2, userId: data.id },
          { title: 'Todo3', prio: 4, done: true, userId: data.id },
        ]);
        const result = await usersService.find({
          query: {
            todos: {
              $prisma: {
                some: {
                  prio: 2,
                },
              },
            },
            $eager: {
              todos: true,
            },
          },
        });
        const result2 = await usersService.find({
          query: {
            todos: {
              $prisma: {
                every: {
                  done: true,
                },
              },
            },
          },
        });
        expect(result).to.have.lengthOf(1);
        expect(result2).to.have.lengthOf(0);
      });

      it('.find + $and', async () => {
        await todosService.create([
          { title: 'Todo2', prio: 2, userId: data.id },
          { title: 'Todo3', prio: 4, done: true, userId: data.id },
        ]);

        const result = await todosService.find({
          query: {
            $and: [{tag1: {$in: ['TEST', 'TEST2']}}]
          },
        });

        expect(result).to.have.lengthOf(2);
      });

      it('.find + $and + merge with equals', async () => {
        await todosService.create([
          { title: 'Todo2', prio: 2, userId: data.id },
          { title: 'Todo3', prio: 4, done: true, userId: data.id },
        ]);

        const result = await todosService.find({
          query: {
            tag1: 'TEST',
            $and: [{tag1: {$in: ['TEST', 'TEST2']}}],
          },
        });

        expect(result).to.have.lengthOf(1);
      });

      it('.find + $and + merge with normal query', async () => {
        await todosService.create([
          { title: 'Todo2', prio: 2, userId: data.id },
          { title: 'Todo3', prio: 4, done: true, userId: data.id },
        ]);

        const result = await todosService.find({
          query: {
            tag1: { $ne: 'TEST' },
            $and: [{tag1: {$in: ['TEST', 'TEST2']}}],
          },
        });

        expect(result).to.have.lengthOf(1);
      });

      it('.find + $and', async () => {
        await todosService.create([
          { title: 'Todo2', prio: 2, userId: data.id },
          { title: 'Todo3', prio: 4, done: true, userId: data.id },
        ]);

        const result = await todosService.find({
          query: {
            $and: [{tag1: 'TEST'}],
          },
        });

        expect(result).to.have.lengthOf(1);
      });

      it('.get + multiple id queries + NotFound', async () => {
        try {
          await todosService.create([
            { title: 'Todo2', prio: 2, userId: data.id },
            { title: 'Todo3', prio: 4, done: true, userId: data.id },
          ]);
          const results = await todosService.find();
          const inIds = [results[1].id, results[2].id];

          await todosService.get(results[0].id, {
            query: {
              id: {
                $in: inIds,
              }
            },
          });
        } catch (e) {
          expect(e.code).to.be.equal(404);
        }
      });

      it('.get + multiple id queries + result', async () => {
        await todosService.create([
          { title: 'Todo2', prio: 2, userId: data.id },
          { title: 'Todo3', prio: 4, done: true, userId: data.id },
        ]);
        const results = await todosService.find();
        const inIds = [results[1].id, results[0].id];

        const result = await todosService.get(results[0].id, {
          query: {
            id: {
              $in: inIds,
            }
          },
        });
        expect(result.id).to.be.equal(results[0].id);
      });

      it('.get + additional queries + result', async () => {
        const created = await todosService.create([
          { title: 'Todo2', prio: 2, userId: data.id, tag1: 'TEST3' },
          { title: 'Todo3', prio: 4, done: true, userId: data.id, tag1: 'TEST' },
        ]);

        const result = await todosService.get(created[0].id, {
          query: {
            $and: [{tag1: {$nin: ['TEST', 'TEST2']}}],
          },
        });
        expect(result.id).to.be.equal(created[0].id);
      });

      it('.get + id equals query with same id + result', async () => {
        await todosService.create([
          { title: 'Todo2', prio: 2, userId: data.id },
          { title: 'Todo3', prio: 4, done: true, userId: data.id },
        ]);
        const results = await todosService.find();

        const result = await todosService.get(results[0].id, {
          query: {
            $and: [{id: results[0].id}],
          },
        });
        expect(result.id).to.be.equal(results[0].id);
      });

      it('.get + id equals query with other id + NotFound', async () => {
        try {
          await todosService.create([
            { title: 'Todo2', prio: 2, userId: data.id },
            { title: 'Todo3', prio: 4, done: true, userId: data.id },
          ]);
          const results = await todosService.find();

          await todosService.get(results[0].id, {
            query: {
              $and: [{id: results[1].id}],
            },
          });
        } catch (e) {
          expect(e.code).to.be.equal(404);
        }
      });

      it('.remove + multiple id queries + NotFound', async () => {
        try {
          await todosService.create([
            { title: 'Todo2', prio: 2, userId: data.id },
            { title: 'Todo3', prio: 4, done: true, userId: data.id },
          ]);
          const results = await todosService.find();
          const inIds = [results[1].id, results[2].id];

          await todosService.remove(results[0].id, {
            query: {
              $and: [{id: {$in: inIds}}],
            },
          });
        } catch (e) {
          expect(e.code).to.be.equal(404);
        }
      });

      it('.remove + multiple id queries + result', async () => {
        await todosService.create([
          { title: 'Todo2', prio: 2, userId: data.id },
          { title: 'Todo3', prio: 4, done: true, userId: data.id },
        ]);
        const results = await todosService.find();
        const inIds = [results[1].id, results[0].id];

        const result = await todosService.remove(results[0].id, {
          query: {
            $and: [{id: {$in: inIds}}],
          },
        });
        expect(result.id).to.be.equal(results[0].id);
      });

      it('.update + multiple id queries + NotFound', async () => {
        try {
          await todosService.create([
            { title: 'Todo2', prio: 2, userId: data.id },
            { title: 'Todo3', prio: 4, done: true, userId: data.id },
          ]);
          const results = await todosService.find();
          const inIds = [results[1].id, results[2].id];

          await todosService.update(results[0].id, {
            tag1: 'NEW TAG',
          }, {
            query: {
              $and: [{id: {$in: inIds}}],
            },
          });
        } catch (e) {
          expect(e.code).to.be.equal(404);
        }
      });

      it('.update + multiple id queries + result', async () => {
        await todosService.create([
          { title: 'Todo2', prio: 2, userId: data.id },
          { title: 'Todo3', prio: 4, done: true, userId: data.id },
        ]);
        const results = await todosService.find();
        const inIds = [results[1].id, results[0].id];

        const result = await todosService.update(results[0].id, {
          tag1: 'NEW TAG',
        }, {
          query: {
            $and: [{id: {$in: inIds}}],
          },
        });
        expect(result.tag1).to.be.equal('NEW TAG');
      });

      it('.patch + multiple id queries + result', async () => {
        await todosService.create([
          { title: 'Todo2', prio: 2, userId: data.id },
          { title: 'Todo3', prio: 4, done: true, userId: data.id },
        ]);
        const results = await todosService.find();
        const inIds = [results[1].id, results[0].id];

        const result = await todosService.patch(results[0].id, {
          tag1: 'NEW TAG',
        }, {
          query: {
            $and: [{id: {$in: inIds}}],
          },
        });
        expect(result.tag1).to.be.equal('NEW TAG');
      });

      it('.patch + multiple id queries + NotFound', async () => {
        try {
          await todosService.create([
            { title: 'Todo2', prio: 2, userId: data.id },
            { title: 'Todo3', prio: 4, done: true, userId: data.id },
          ]);
          const results = await todosService.find();
          const inIds = [results[1].id, results[2].id];

          await todosService.update(results[0].id, {
            tag1: 'NEW TAG',
          }, {
            query: {
              $and: [{id: {$in: inIds}}],
            },
          });
        } catch (e) {
          expect(e.code).to.be.equal(404);
        }
      });
    });
  });

  testSuite(app, errors, 'users', 'id');
  testSuite(app, errors, 'people', 'id');
  testSuite(app, errors, 'people-customid', 'customid');
});

