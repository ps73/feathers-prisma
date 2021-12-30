# feathers-prisma

[![Build Status](https://travis-ci.org/ps73/feathers-prisma.png?branch=master)](https://travis-ci.org/ps73/feathers-prisma)
[![Code Climate](https://codeclimate.com/github/ps73/feathers-prisma/badges/gpa.svg)](https://codeclimate.com/github/ps73/feathers-prisma)
[![Test Coverage](https://codeclimate.com/github/ps73/feathers-prisma/badges/coverage.svg)](https://codeclimate.com/github/ps73/feathers-prisma/coverage)
[![Coverage Status](https://coveralls.io/repos/github/ps73/feathers-prisma/badge.svg?branch=main)](https://coveralls.io/github&ps73/feathers-prisma?branch=main)
[![npm](https://img.shields.io/npm/v/feathers-prisma.svg?maxAge=3600)](https://www.npmjs.com/package/feathers-prisma)

> A [Feathers](https://feathersjs.com) service adapter for [Prisma](prisma.io) orm that works on server.

## Installation

```
npm install feathers-prisma --save
```

## Documentation

TBD

## Complete Example

Here's an example of a Feathers server that uses `feathers-prisma`. 

```js
const feathers = require('@feathersjs/feathers');
const prisma = require('feathers-prisma');

// Initialize the application
const app = feathers();

// Initialize the plugin
app.configure(prisma());
```

## License

Copyright (c) 2021

Licensed under the [MIT license](LICENSE).
