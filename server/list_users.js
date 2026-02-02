import prisma from './config/database.js';

async function listUsers() {
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
    users.forEach(u => {
        console.log(`- ${u.email} (${u.role}) Active: ${u.isActive}`);
    });
}

listUsers()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
