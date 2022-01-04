const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const rest = require('@feathersjs/express/rest');
const { PrismaClient } = require('@prisma/client');
const { service } = require('../dist');

// Create an Express compatible Feathers application instance.
const app = express(feathers());
app.configure(rest());
// Turn on JSON parser for REST services
app.use(express.json());
// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({ extended: true }));

const prismaClient = new PrismaClient();
prismaClient.$connect();
app.set('prisma', prismaClient);

const paginate = {
  default: 10,
  max: 50,
};

app.use('/todos', service({
  model: 'todo',
  paginate,
  multi: ['create', 'patch', 'remove'],
  whitelist: ['$eager'],
}, prismaClient));

app.use('/users', service({
  model: 'user',
  paginate,
}, prismaClient));

module.exports = {
  app,
  prismaClient,
};
