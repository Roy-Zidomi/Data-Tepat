require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  // Upsert Region (as placeholder for household)
  const region = await prisma.region.upsert({
    where: { id: 1 },
    update: {},
    create: {
      province: 'Jawa Barat',
      city_regency: 'Bandung',
      district: 'Coblong',
      village: 'Dago',
      rt: '001',
      rw: '005',
    }
  });

  // Upsert Admin User
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Super Admin',
      username: 'admin',
      email: 'admin@bantutepat.go.id',
      password_hash: adminPassword,
      role: 'admin',
      phone: '081234567890',
      is_active: true,
    },
  });

  // Upsert Warga User
  const wargaPassword = await bcrypt.hash('warga123', 10);
  const warga = await prisma.user.upsert({
    where: { username: 'warga' },
    update: {},
    create: {
      name: 'Bapak Warga',
      username: 'warga',
      email: 'warga@example.com',
      password_hash: wargaPassword,
      role: 'warga',
      phone: '081234567891',
      is_active: true,
    },
  });

  console.log('Seed executed: Setup Admin, Warga, and initial Region.');
  console.log({ admin: admin.username, warga: warga.username, defaultPassword: 'admin123 / warga123' });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
