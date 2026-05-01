import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { ProjectController } from './src/controllers/project.controller';

const prisma = new PrismaClient();

async function main() {
    const controller = new ProjectController();
    
    // Mock req and res
    const req = {
        user: { id_persona: 'some-admin-id' } // Note: getDashboardStats doesn't actually use req.user right now except maybe it doesn't need it at all. Let's see.
    } as any;
    
    let responseData = null;
    const res = {
        json: (data: any) => { responseData = data; return res; },
        status: (code: number) => res
    } as any;

    await controller.getDashboardStats(req, res);
    
    console.log(JSON.stringify(responseData.weeklyChart, null, 2));
    console.log(JSON.stringify(responseData.monthlyChart, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
