import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
  const password = process.env.ADMIN_DEFAULT_PASSWORD || 'unnoto@admin2026';

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (!existingAdmin) {
    const admin = await prisma.adminUser.create({
      data: {
        username,
        passwordHash: hashPassword(password),
        name: 'Sakil Ahammed',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log(`Default admin created: ${admin.username} (${admin.name})`);
  } else {
    console.log(`Admin user ${username} already exists.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
