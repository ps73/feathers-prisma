const { expect } = require('chai');
const { prismaService: plugin } = require('../dist');

describe('feathers-prisma', () => {
  it('basic functionality', () => {
    expect(typeof plugin).to.equal('function', 'It worked');
    expect(plugin()).to.equal('feathers-prisma');
  });
});
