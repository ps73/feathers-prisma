const { expect } = require('chai');
const { service, PrismaService, prismaService } = require('../dist');
const { app, prismaClient } = require('./app');

const todosBatch = [
  { title: 'Title', userId: 1, tag1: 'tag', tag2: 'test' },
  { title: 'Title 2', userId: 1, tag1: 'test', done: true },
  { title: 'Title 3', userId: 1, tag1: 'abc', tag2: 'xyz', prio: 2 },
  { title: 'Title 4', userId: 1, tag1: 'xyz', tag2: 'def'  },
];

const todo = {
  title: 'Todo',
  prio: 3,
  done: true,
  userId: 1,
};

describe('feathers-prisma', () => {
  it('basic functionality', () => {
    expect(typeof service).to.equal('function', 'It worked');
    expect(app.service('todos').Model)
      .to.equal(new PrismaService({ model: 'todo' }, prismaClient).Model);
    expect(app.service('todos').Model)
      .to.equal(prismaService({ model: 'todo' }, prismaClient).Model);
  });

  it('creates user, returns data with id and deletes it', () => {
    app.service('users').create({
      name: 'Test User',
      email: `test.user+${Date.now()}@mail.com`,
    }).then((resp) => {
      expect(resp).to.have.property('id');
      app.service('users').delete(resp.id);
    });
  });

  it('creates batch todos, returns array of data with ids and batch deletes all', async () => {
    const created = await app.service('todos').create(todosBatch);
    const ids = created.map((t) => t.id);
    const { count } = await app.service('todos').remove(null, {
      query: {
        id: {
          $in: ids,
        },
      },
    });
    expect(ids.length).to.equal(4);
    expect(count).to.equal(4);
  });

  it('creates todo, returns data and deletes it', async () => {
    const created = await app.service('todos').create(todo);
    expect(created.title).to.equal('Todo');
    const removed = await app.service('todos').remove(created.id);
    expect(removed.id).to.equal(created.id);
  });

  it('creates multiple todos and filters via find', async () => {
    await app.service('todos').remove(null, {
      query: {
        $skip: 0,
        $limit: 100,
        userId: 1,
      },
    });
    const created = await app.service('todos').create(todosBatch);
    const findLimitWithSort = await app.service('todos').find({
      query: {
        $limit: 2,
        $skip: 2,
        $sort: {
          title: 1,
        },
        userId: 1,
      },
    });
    expect(findLimitWithSort.data.length).to.equal(2);
    expect(findLimitWithSort.data[0].id).to.equal(created[2].id);
    const findInOrEq = await app.service('todos').find({
      query: {
        userId: 1,
        $sort: {
          title: 1,
        },
        title: {
          contains: 'Title',
        },
        $or: [
          { tag1: { $in: ['tag', 'xyz'] } },
          { done: true },
        ],
      },
    });
    expect(findInOrEq.data[0].title).to.equal('Title');
    expect(findInOrEq.data.length).to.equal(3);
  });

  it('get todo and patch title', async () => {
    const created = await app.service('todos').create(todo);
    const findOne = await app.service('todos').get(created.id);
    const patched = await app.service('todos').patch(findOne.id, {
      title: 'New Todo',
    });
    expect(patched.title).not.to.equal(created.title);
    expect(patched.title).to.equal('New Todo');
  });

  it('patches multiple todos', async () => {
    const todos = await app.service('todos').find({
      query: {
        userId: 1,
        title: {
          $contains: 'Title',
        },
        done: false,
        tag1: {
          $gt: 'abc',
          $lte: 'xyz'
        },
        $sort: {
          title: 1,
        },
        $limit: 100,
      },
    });
    const ids = todos.data.map((t) => t.id);
    const { count } = await app.service('todos').patch(null, {
      done: true,
      title: '[Erledigt]'
    }, {
      query: {
        id: {
          $in: ids,
        },
        $limit: 100,
      },
    });
    expect(count).to.be.above(0);
    const potentiallyPatchedTodos = await app.service('todos').find({
      query: {
        userId: 1,
        title: {
          $startsWith: '[',
          $endsWith: ']',
        },
        done: true,
        tag1: {
          $gt: 'abc',
          $lte: 'xyz'
        },
        $sort: {
          title: 1,
        },
        $limit: 100,
      },
    });
    const patchedIds = potentiallyPatchedTodos.data.map((t) => t.id);
    expect(count).to.be.equal(todos.total);
    expect(patchedIds).deep.to.equal(ids);
  });
});
