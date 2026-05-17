const { PrismaClient } = require('@prisma/client');

// Use this to replace BigInt stringification globally if needed
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

module.exports = prisma;