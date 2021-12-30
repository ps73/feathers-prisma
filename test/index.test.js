const { expect } = require('chai');
const plugin = require('../lib');

describe('feathers-prisma', () => {
  it('basic functionality', () => {
    expect(typeof plugin).to.equal('function', 'It worked');
    expect(plugin()).to.equal('feathers-prisma');
  });
});
