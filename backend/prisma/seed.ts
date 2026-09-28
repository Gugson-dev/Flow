import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from './generated';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const user = await prisma.user.upsert({
        where: {
            email: 'seed@flow.local',
        },
        update: {},
        create: {
            email: 'seed@flow.local',
            passwordHash: 'seed',
        },
    });

    await prisma.project.create({
        data: {
            name: 'Inbox',
            color: '#6366f1',
            theme: 'dark',
            isSystem: true,
            owner: {
                connect: {
                    id: user.id,
                },
            },
        },
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });