require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function check() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({ where: { email: 'admin@bantutepat.com' } });
  if (!user) {
    console.log("Admin user not found in DB.");
  } else {
    console.log("Admin user:", user.email, "role:", user.role, "isActive:", user.is_active);
    const isValid = await bcrypt.compare('password123', user.password_hash);
    console.log("Password valid?", isValid);
  }
  await prisma.$disconnect();
}

check().catch(console.error);
