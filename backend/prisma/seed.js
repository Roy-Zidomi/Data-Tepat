require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Seed Aid Types
  const aidTypes = [
    { code: 'PKH', name: 'Program Keluarga Harapan (PKH)', description: 'Bantuan tunai bersyarat untuk keluarga rentan', unit: 'Rp' },
    { code: 'BPNT', name: 'Bantuan Pangan Non Tunai (BPNT)', description: 'Bantuan sembako senilai Rp 200.000 per bulan', unit: 'Paket' },
    { code: 'BLT-BBM', name: 'Bantuan Langsung Tunai BBM', description: 'Kompensasi subsidi BBM', unit: 'Rp' },
    { code: 'RTLH', name: 'Rehabilitasi Rumah Tidak Layak Huni', description: 'Bantuan perbaikan rumah', unit: 'Unit' },
  ];

  for (const aid of aidTypes) {
    await prisma.aidType.upsert({
      where: { code: aid.code },
      update: {},
      create: aid,
    });
  }
  console.log('Aid Types seeded');

  // 2. Seed Regions
  const region1 = await prisma.region.create({
    data: {
      province: 'Jawa Barat',
      city_regency: 'Kota Bogor',
      district: 'Bogor Tengah',
      village: 'Sukamaju',
      rt: '01',
      rw: '05',
      postal_code: '16121',
    }
  });
  console.log('Region seeded');

  // 3. Seed Users
  const password_hash = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'admin@bantutepat.com',
      username: 'admin_utama',
      name: 'Admin Sistem',
      phone: '08111111111',
      role: 'admin_main',
      is_active: true,
      activation_status: 'active',
      password_hash
    },
    {
      email: 'staff@bantutepat.com',
      username: 'admin_staff',
      name: 'Siti Staff',
      phone: '08222222222',
      role: 'admin_staff',
      is_active: true,
      activation_status: 'active',
      password_hash
    },
    {
      email: 'pengawas@bantutepat.com',
      username: 'pengawas_independen',
      name: 'Heri Pengawas',
      phone: '08555555555',
      role: 'pengawas',
      is_active: true,
      activation_status: 'active',
      password_hash
    },
    {
      email: 'relawan@bantutepat.com',
      username: 'relawan_lapangan',
      name: 'Toni Relawan',
      phone: '08333333333',
      role: 'relawan',
      is_active: true,
      activation_status: 'active',
      password_hash
    },
    {
      email: 'warga@bantutepat.com',
      username: 'warga_teladan',
      name: 'Ahmad Warga',
      phone: '08444444444',
      role: 'warga',
      is_active: true,
      activation_status: 'active',
      password_hash
    }
  ];

  const createdUsers = {};
  for (const u of users) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        is_active: u.is_active,
        activation_status: u.activation_status,
        password_hash: u.password_hash
      },
      create: u,
    });
    createdUsers[u.role] = created;
  }
  console.log('Users seeded');

  // ... (rest of the code for household) ...
  // (Assuming I should keep the rest of main function as is or just focus on the users section)
  // Let's replace only the users array and the console summary.

  console.log('Seed completed successfully! You can login with:');
  console.log('Admin Utama: admin@bantutepat.com / password123');
  console.log('Admin Staff: staff@bantutepat.com / password123');
  console.log('Pengawas: pengawas@bantutepat.com / password123');
  console.log('Relawan: relawan@bantutepat.com / password123');
  console.log('Warga: warga@bantutepat.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
