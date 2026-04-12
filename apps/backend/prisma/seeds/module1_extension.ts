// prisma/seeds/module1_extension.ts — викликається після seedModule1 з prisma/seed.ts

import type { PrismaClient } from '@prisma/client';

export async function seedModule1Extension(prisma: PrismaClient) {
  void prisma;

  console.log('🌱 Seeding Module 1 extension: Roles, Departments, Industries...');
  console.log('ℹ️ Vocabulary-картки в extension seed вимкнені.');
  console.log('\n🎉 Extension seed завершено!');
  console.log('   📚 Нових vocabulary записів: 0');
}