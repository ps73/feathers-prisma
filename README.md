# feathers-prisma

[![Build Status](https://travis-ci.org/ps73/feathers-prisma.png?branch=master)](https://travis-ci.org/ps73/feathers-prisma)
[![Code Climate](https://codeclimate.com/github/ps73/feathers-prisma/badges/gpa.svg)](https://codeclimate.com/github/ps73/feathers-prisma)
[![Test Coverage](https://codeclimate.com/github/ps73/feathers-prisma/badges/coverage.svg)](https://codeclimate.com/github/ps73/feathers-prisma/coverage)
[![Coverage Status](https://coveralls.io/repos/github/ps73/feathers-prisma/badge.svg?branch=main)](https://coveralls.io/github&ps73/feathers-prisma?branch=main)
[![npm](https://img.shields.io/npm/v/feathers-prisma.svg?maxAge=3600)](https://www.npmjs.com/package/feathers-prisma)

> A [Feathers](https://feathersjs.com) service adapter for [Prisma](prisma.io) ORM.

> !!! This plugin is currently under development! It is usable but you have to be aware of it.

Following things are missing before going productive:

- Finish tests
- Add example

## Installation

```
npm install feathers-prisma --save
```

## Documentation

This adapter supports all methods (`create`, `delete`, `update`, `patch`, `find`, `get`) and the common way for querying (`equality`, `$limit`, `$skip`, `$sort`, `$select`, `$in`, `$nin`, `$lt`, `$lte`, `$gt`, `$gte`, `$ne`, `$or`). Also supports eager loading (`$eager`) and full-text search (`$search`).

### Setup

```js
import feathers from "@feathersjs/feathers";
import { prismaService } from "feathers-prisma";

// Initialize the application
const app = feathers();

// Initialize the plugin
const prismaClient = new PrismaClient();
prismaClient.$connect();
app.set("prisma", prismaClient);

const paginate = {
  default: 10,
  max: 50,
};

app.use(
  "/messages",
  prismaService(
    {
      model: "messages",
      paginate,
      multi: ["create", "patch", "remove"],
      whitelist: ["$eager"],
    },
    prismaClient
  )
);
```

### Eager Loading / Relation Queries

Relations can be resolved via `$eager` property in your query. It supports also deep relations. The `$eager` property **has to be** set in the `whitelist` option parameter. Otherwise the service will throw an error.

```js
app.use(
  "/messages",
  prismaService(
    {
      model: "message",
      whitelist: ["$eager"],
    },
    prismaClient
  )
);
// will load the recipients with the related user
// as well as all attachments  of the messages
app.service("messages").find({
  query: {
    $eager: [["recipients", ["user"]], "attachments"],
  },
});
```

### Batch requests

This adapter supports batch requests. This is possible by allowing this in the `multi` property in the service options. Supported methods are `create`, `patch` and `delete`.

```js
app.use(
  "/messages",
  prismaService(
    {
      model: "messages",
      multi: ["create", "patch", "delete"],
    },
    prismaClient
  )
);

app.service("messages").create([{ body: "Lorem" }, { body: "Ipsum" }]);
```

### Full-Text Search

Prisma supports a full-text search which is currently in preview mode. Find out more how to activate it [here](https://www.prisma.io/docs/concepts/components/prisma-client/full-text-search). If you activated it through your schema you have to allow it in the `whitelist` property:

```js
app.use(
  "/messages",
  prismaService(
    {
      model: "messages",
      whitelist: ["$search"],
    },
    prismaClient
  )
);

app.service("messages").find({
  query: {
    body: {
      $search: "hello | hola",
    },
  },
});
```

## Complete Example

Here's an example of a Feathers server that uses `feathers-prisma`.

```js
import feathers from "@feathersjs/feathers";
import { prismaService } from "feathers-prisma";

// Initialize the application
const app = feathers();

// Initialize the plugin
const prismaClient = new PrismaClient();
prismaClient.$connect();
app.set("prisma", prismaClient);

const paginate = {
  default: 10,
  max: 50,
};

app.use(
  "/messages",
  prismaService(
    {
      model: "messages",
      paginate,
      multi: ["create", "patch", "remove"],
      whitelist: ["$eager"],
    },
    prismaClient
  )
);

// Or if you want to extend the service class
import { PrismaService } from "feathers-prisma";
```

## License

Copyright (c) 2021.

Licensed under the [MIT license](LICENSE).
