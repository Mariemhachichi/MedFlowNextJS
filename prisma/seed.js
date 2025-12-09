import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Exemple utilisateur réceptionniste
  const hashedPassword = await bcrypt.hash('motdepasse123', 10);

  const user = await prisma.user.create({
    data: {
      name: 'mariem',
      email: 'hchichimariem23@gmail.com',
      password: hashedPassword,
      role: 'receptionist',
    },
  });

  console.log('Utilisateur créé :', user);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
