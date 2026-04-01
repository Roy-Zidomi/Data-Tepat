const { PrismaClient } = require('@prisma/client');

// Use this to replace BigInt stringification globally if needed
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;