const { PrismaClient } = require("@prisma/client");

// Initialize Prisma Client
const prisma = new PrismaClient();

module.exports = prisma;
