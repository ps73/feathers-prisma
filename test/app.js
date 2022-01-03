/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const rest = require('@feathersjs/express/rest');
const { prismaService } = require('feathers-prisma');
const { PrismaClient } = require('@prisma/client');

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

app.use('/todos', prismaService({
  model: 'todo',
  paginate,
  multi: ['create', 'patch', 'remove'],
  whitelist: ['$eager'],
}, prismaClient));

app.use('/users', prismaService({
  model: 'user',
  paginate,
}, prismaClient));

module.exports = app;
