import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const emails = ["admin@unimayor.edu.co", "docente@unimayor.edu.co"];
    
    for (const email of emails) {
        console.log(`\n--- User: ${email} ---`);
        const user = await prisma.persona.findUnique({
            where: { correo_electronico: email },
            include: {
                actores: {
                    include: {
                        tipo_rol: true,
                        trabajo_grado: true
                    }
                }
            }
        });
        
        if (!user) {
            console.log("User not found");
            continue;
        }
        
        console.log(`ID: ${user.id_persona}`);
        console.log(`Names: ${user.nombres} ${user.apellidos}`);
        console.log(`Roles in projects:`);
        user.actores.forEach(actor => {
            console.log(`  - Project: ${actor.trabajo_grado.titulo_trabajo} | Role: ${actor.tipo_rol.nombre_rol}`);
        });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
