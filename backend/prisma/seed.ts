// seed.ts - Script para poblar la base de datos con datos de ejemplo
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Función para generar token de 6 dígitos
function generateToken(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Función para hashear contraseñas
async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

async function main() {
    console.log("🌱 Iniciando seed de la base de datos...");

    // 1. TIPOS DE DOCUMENTO
    console.log("📄 Creando tipos de documento...");
    const tiposDocumento = await Promise.all([
        prisma.tipo_documento.create({ data: { documento: "CC" } }),
        prisma.tipo_documento.create({ data: { documento: "CE" } }),
        prisma.tipo_documento.create({ data: { documento: "PAS" } }),
        prisma.tipo_documento.create({ data: { documento: "TI" } }),
    ]);

    // 2. TIPOS DE ROL
    console.log("👥 Creando tipos de rol...");
    const tiposRol = await Promise.all([
        prisma.tipo_rol.create({
            data: {
                nombre_rol: "Estudiante",
                descripcion: "Estudiante que realiza trabajo de grado",
                activo: true,
            },
        }),
        prisma.tipo_rol.create({
            data: {
                nombre_rol: "Director",
                descripcion: "Director del trabajo de grado",
                activo: true,
            },
        }),
        prisma.tipo_rol.create({
            data: {
                nombre_rol: "Jurado",
                descripcion: "Jurado evaluador",
                activo: true,
            },
        }),
        prisma.tipo_rol.create({
            data: {
                nombre_rol: "Coordinador de Carrera",
                descripcion: "Coordinador del programa",
                activo: true,
            },
        }),
        prisma.tipo_rol.create({
            data: {
                nombre_rol: "Decano",
                descripcion: "Decano de la facultad",
                activo: true,
            },
        }),
        prisma.tipo_rol.create({
            data: {
                nombre_rol: "Asesor Externo",
                descripcion: "Asesor de empresa",
                activo: true,
            },
        }),
    ]);

    // 3. FACULTADES
    console.log("🏛️ Creando facultades...");
    const facultades = await Promise.all([
        prisma.facultad.create({
            data: { nombre_facultad: "Ingeniería", codigo_facultad: "ING" },
        }),
        prisma.facultad.create({
            data: {
                nombre_facultad: "Ciencias Económicas y Administrativas",
                codigo_facultad: "CEA",
            },
        }),
        prisma.facultad.create({
            data: {
                nombre_facultad: "Ciencias Sociales y Humanas",
                codigo_facultad: "CSH",
            },
        }),
    ]);

    // 4. NIVELES DE FORMACIÓN
    console.log("🎓 Creando niveles de formación...");
    const nivelesFormacion = await Promise.all([
        prisma.nivel_formacion.create({
            data: {
                nombre_nivel: "Pregrado",
                descripcion: "Nivel de pregrado universitario",
            },
        }),
        prisma.nivel_formacion.create({
            data: {
                nombre_nivel: "Especialización",
                descripcion: "Nivel de especialización",
            },
        }),
        prisma.nivel_formacion.create({
            data: {
                nombre_nivel: "Maestría",
                descripcion: "Nivel de maestría",
            },
        }),
        prisma.nivel_formacion.create({
            data: {
                nombre_nivel: "Tecnólogo",
                descripcion: "Nivel tecnológico",
            },
        }),
    ]);

    // 5. PROGRAMAS ACADÉMICOS
    console.log("📚 Creando programas académicos...");
    const programas = await Promise.all([
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Ingeniería de Sistemas",
                id_nivel_formacion: nivelesFormacion[0].id_nivel,
                id_facultad: facultades[0].id_facultad,
                estado: "activo",
            },
        }),
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Administración de Empresas",
                id_nivel_formacion: nivelesFormacion[0].id_nivel,
                id_facultad: facultades[1].id_facultad,
                estado: "activo",
            },
        }),
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Comunicación Social",
                id_nivel_formacion: nivelesFormacion[0].id_nivel,
                id_facultad: facultades[2].id_facultad,
                estado: "activo",
            },
        }),
    ]);

    // 6. OPCIONES DE GRADO
    console.log("📝 Creando opciones de grado...");
    const opcionesGrado = await Promise.all([
        prisma.opcion_grado.create({
            data: {
                nombre_opcion_grado: "Tesis de Grado",
                descripcion: "Trabajo de investigación formal",
                estado: "activo",
                tipo_modalidad: "Investigación",
            },
        }),
        prisma.opcion_grado.create({
            data: {
                nombre_opcion_grado: "Práctica Profesional",
                descripcion: "Práctica en empresa",
                estado: "activo",
                tipo_modalidad: "Práctica",
            },
        }),
        prisma.opcion_grado.create({
            data: {
                nombre_opcion_grado: "Proyecto Integrador",
                descripcion: "Proyecto de aplicación práctica",
                estado: "activo",
                tipo_modalidad: "Proyecto",
            },
        }),
        prisma.opcion_grado.create({
            data: {
                nombre_opcion_grado: "Monografía",
                descripcion: "Trabajo monográfico",
                estado: "activo",
                tipo_modalidad: "Investigación",
            },
        }),
    ]);

    // 7. EMPRESAS
    console.log("🏢 Creando empresas...");
    const empresas = await Promise.all([
        prisma.empresa.create({
            data: {
                nit_empresa: "900123456-7",
                nombre_empresa: "TechSolutions S.A.S",
                direccion: "Calle 100 #15-20",
                email: "contacto@techsolutions.com",
                telefono: "3001234567",
                estado: "activo",
            },
        }),
        prisma.empresa.create({
            data: {
                nit_empresa: "800234567-8",
                nombre_empresa: "Innovación Digital Ltda",
                direccion: "Carrera 7 #32-10",
                email: "info@innovaciondigital.com",
                telefono: "3109876543",
                estado: "activo",
            },
        }),
    ]);

    // 8. ESTADOS DE TRABAJO DE GRADO
    console.log("✅ Creando estados...");
    const estados = await Promise.all([
        prisma.estado_tg.create({
            data: {
                nombre_estado: "En Progreso",
                descripcion: "Trabajo en desarrollo",
                orden: 1,
            },
        }),
        prisma.estado_tg.create({
            data: {
                nombre_estado: "En Revisión",
                descripcion: "En revisión por director",
                orden: 2,
            },
        }),
        prisma.estado_tg.create({
            data: {
                nombre_estado: "Pendiente de Aprobación",
                descripcion: "Esperando aprobación",
                orden: 3,
            },
        }),
        prisma.estado_tg.create({
            data: {
                nombre_estado: "Aprobado",
                descripcion: "Trabajo aprobado",
                orden: 4,
            },
        }),
        prisma.estado_tg.create({
            data: {
                nombre_estado: "Rechazado",
                descripcion: "Trabajo rechazado",
                orden: 5,
            },
        }),
        prisma.estado_tg.create({
            data: {
                nombre_estado: "Finalizado",
                descripcion: "Trabajo finalizado",
                orden: 6,
            },
        }),
    ]);

    // 9. ACCIONES DE SEGUIMIENTO
    console.log("⚡ Creando acciones de seguimiento...");
    const acciones = await Promise.all([
        prisma.accion_seg.create({
            data: {
                tipo_accion: "Registro",
                descripcion: "Registro inicial del trabajo",
            },
        }),
        prisma.accion_seg.create({
            data: {
                tipo_accion: "Revisión",
                descripcion: "Revisión del director",
            },
        }),
        prisma.accion_seg.create({
            data: {
                tipo_accion: "Asignación jurado",
                descripcion: "Asignación de jurados",
            },
        }),
        prisma.accion_seg.create({
            data: {
                tipo_accion: "Sustentación",
                descripcion: "Sustentación oral",
            },
        }),
        prisma.accion_seg.create({
            data: {
                tipo_accion: "Aprobación",
                descripcion: "Aprobación final",
            },
        }),
        prisma.accion_seg.create({
            data: {
                tipo_accion: "Entrega versión final",
                descripcion: "Entrega documento final",
            },
        }),
    ]);

    // 10. DISTINCIONES
    console.log("🏆 Creando distinciones...");
    const distinciones = await Promise.all([
        prisma.distinciones.create({ data: { nombre: "Mención honorífica" } }),
        prisma.distinciones.create({ data: { nombre: "Laureado" } }),
    ]);

    // 11. PERSONAS CON AUTENTICACIÓN
    console.log("👤 Creando personas con credenciales de acceso...");

    // Contraseña por defecto para todos: "Password123!"
    const defaultPassword = await hashPassword("Password123!");

    const personas = await Promise.all([
        // === ESTUDIANTES (CON ACCESO AL SISTEMA) ===
        prisma.persona.create({
            data: {
                nombres: "Juan Carlos",
                apellidos: "Pérez García",
                id_tipo_doc_identidad: tiposDocumento[0].id_tipo_documento,
                num_doc_identidad: "1020304050",
                numero_celular: "3101234567",
                correo_electronico: "juan.perez@estudiante.edu.co",
                password: defaultPassword,
                confirmed: true,
                ultimo_acceso: new Date(),
                intentos_fallidos: 0,
            },
        }),
        prisma.persona.create({
            data: {
                nombres: "María Fernanda",
                apellidos: "López Martínez",
                id_tipo_doc_identidad: tiposDocumento[0].id_tipo_documento,
                num_doc_identidad: "1030405060",
                numero_celular: "3209876543",
                correo_electronico: "maria.lopez@estudiante.edu.co",
                password: defaultPassword,
                confirmed: false,
                token: generateToken(),
                intentos_fallidos: 0,
            },
        }),
        prisma.persona.create({
            data: {
                nombres: "Carlos Andrés",
                apellidos: "Ramírez Silva",
                id_tipo_doc_identidad: tiposDocumento[0].id_tipo_documento,
                num_doc_identidad: "1040506070",
                numero_celular: "3158765432",
                correo_electronico: "carlos.ramirez@estudiante.edu.co",
                password: defaultPassword,
                confirmed: true,
                ultimo_acceso: new Date("2024-10-15"),
                intentos_fallidos: 0,
            },
        }),

        // === PROFESORES/DIRECTORES (CON ACCESO AL SISTEMA) ===
        prisma.persona.create({
            data: {
                nombres: "Roberto",
                apellidos: "González Sánchez",
                id_tipo_doc_identidad: tiposDocumento[0].id_tipo_documento,
                num_doc_identidad: "80123456",
                numero_celular: "3151234567",
                correo_electronico: "roberto.gonzalez@universidad.edu.co",
                password: defaultPassword,
                confirmed: true,
                ultimo_acceso: new Date(),
                intentos_fallidos: 0,
            },
        }),
        prisma.persona.create({
            data: {
                nombres: "Ana Patricia",
                apellidos: "Rodríguez Torres",
                id_tipo_doc_identidad: tiposDocumento[0].id_tipo_documento,
                num_doc_identidad: "52345678",
                numero_celular: "3009876543",
                correo_electronico: "ana.rodriguez@universidad.edu.co",
                password: defaultPassword,
                confirmed: true,
                ultimo_acceso: new Date("2024-10-28"),
                intentos_fallidos: 0,
            },
        }),
        prisma.persona.create({
            data: {
                nombres: "Carlos Alberto",
                apellidos: "Ramírez Díaz",
                id_tipo_doc_identidad: tiposDocumento[0].id_tipo_documento,
                num_doc_identidad: "79234567",
                numero_celular: "3118765432",
                correo_electronico: "carlos.ramirez.prof@universidad.edu.co",
                password: defaultPassword,
                confirmed: true,
                ultimo_acceso: new Date("2024-10-30"),
                intentos_fallidos: 2,
            },
        }),

        // === COORDINADOR (CON ACCESO ADMINISTRATIVO) ===
        prisma.persona.create({
            data: {
                nombres: "Lucía",
                apellidos: "Mendoza Castro",
                id_tipo_doc_identidad: tiposDocumento[0].id_tipo_documento,
                num_doc_identidad: "41567890",
                numero_celular: "3176543210",
                correo_electronico: "lucia.mendoza@universidad.edu.co",
                password: defaultPassword,
                confirmed: true,
                ultimo_acceso: new Date(),
                intentos_fallidos: 0,
            },
        }),

        // === JURADO EXTERNO (SIN ACCESO AL SISTEMA - PASSWORD NULL) ===
        prisma.persona.create({
            data: {
                nombres: "Miguel Ángel",
                apellidos: "Vargas Ortiz",
                id_tipo_doc_identidad: tiposDocumento[0].id_tipo_documento,
                num_doc_identidad: "85678901",
                numero_celular: "3145678901",
                correo_electronico: "miguel.vargas@externo.com",
                password: null,
                confirmed: false,
                intentos_fallidos: 0,
            },
        }),
    ]);

    console.log("\n🔐 CREDENCIALES DE ACCESO CREADAS:");
    console.log("================================");
    console.log("Contraseña para todos: Password123!");
    console.log("\nUsuarios confirmados (pueden acceder):");
    console.log("- juan.perez@estudiante.edu.co");
    console.log("- carlos.ramirez@estudiante.edu.co");
    console.log("- roberto.gonzalez@universidad.edu.co");
    console.log("- ana.rodriguez@universidad.edu.co");
    console.log("- carlos.ramirez.prof@universidad.edu.co");
    console.log("- lucia.mendoza@universidad.edu.co");
    console.log("\nUsuario pendiente de confirmación:");
    console.log(
        `- maria.lopez@estudiante.edu.co (Token: ${personas[1].token})`,
    );
    console.log("\nUsuario sin acceso (jurado externo):");
    console.log("- miguel.vargas@externo.com\n");

    // 12. TRABAJOS DE GRADO
    console.log("📖 Creando trabajos de grado...");
    const trabajos = await Promise.all([
        prisma.trabajo_grado.create({
            data: {
                titulo_trabajo:
                    "Sistema de información para gestión académica universitaria",
                fecha_inicio: new Date("2024-02-01"),
                fecha_fin_estima: new Date("2024-11-30"),
                resumen:
                    "Desarrollo de un sistema web para automatizar procesos académicos",
                id_opcion_grado: opcionesGrado[0].id_opcion_grado,
                id_estado_actual: estados[0].id_estado_tg,
                id_programa_academico: programas[0].id_programa,
            },
        }),
        prisma.trabajo_grado.create({
            data: {
                titulo_trabajo:
                    "Análisis del impacto de redes sociales en marketing digital",
                fecha_inicio: new Date("2024-03-01"),
                fecha_fin_estima: new Date("2024-12-15"),
                resumen:
                    "Investigación sobre estrategias de marketing en redes sociales",
                id_opcion_grado: opcionesGrado[3].id_opcion_grado,
                id_estado_actual: estados[1].id_estado_tg,
                id_programa_academico: programas[1].id_programa,
            },
        }),
        prisma.trabajo_grado.create({
            data: {
                titulo_trabajo:
                    "Desarrollo de aplicación móvil para gestión empresarial",
                fecha_inicio: new Date("2024-01-15"),
                fecha_fin_estima: new Date("2024-10-15"),
                resumen: "Aplicación móvil multiplataforma para PYMES",
                id_opcion_grado: opcionesGrado[1].id_opcion_grado,
                id_estado_actual: estados[2].id_estado_tg,
                id_empresa_practica: empresas[0].id_empresa,
                id_programa_academico: programas[0].id_programa,
            },
        }),
    ]);

    // 13. ACTORES (Asignaciones)
    console.log("🎭 Creando asignaciones de actores...");
    const actores = await Promise.all([
        // Trabajo 1 - Sistema de información
        prisma.actores.create({
            data: {
                id_persona: personas[0].id_persona,
                id_trabajo_grado: trabajos[0].id_trabajo_grado,
                id_tipo_rol: tiposRol[0].id_rol,
                fecha_asignacion: new Date("2024-02-01"),
                estado: "activo",
                observaciones: "Estudiante principal del proyecto",
            },
        }),
        prisma.actores.create({
            data: {
                id_persona: personas[3].id_persona,
                id_trabajo_grado: trabajos[0].id_trabajo_grado,
                id_tipo_rol: tiposRol[1].id_rol,
                fecha_asignacion: new Date("2024-02-01"),
                estado: "activo",
                observaciones: "Director del trabajo de grado",
            },
        }),
        prisma.actores.create({
            data: {
                id_persona: personas[7].id_persona,
                id_trabajo_grado: trabajos[0].id_trabajo_grado,
                id_tipo_rol: tiposRol[2].id_rol,
                fecha_asignacion: new Date("2024-02-15"),
                estado: "activo",
                observaciones: "Jurado externo evaluador",
            },
        }),

        // Trabajo 2 - Marketing digital
        prisma.actores.create({
            data: {
                id_persona: personas[1].id_persona,
                id_trabajo_grado: trabajos[1].id_trabajo_grado,
                id_tipo_rol: tiposRol[0].id_rol,
                fecha_asignacion: new Date("2024-03-01"),
                estado: "activo",
                observaciones: "Estudiante responsable",
            },
        }),
        prisma.actores.create({
            data: {
                id_persona: personas[4].id_persona,
                id_trabajo_grado: trabajos[1].id_trabajo_grado,
                id_tipo_rol: tiposRol[1].id_rol,
                fecha_asignacion: new Date("2024-03-01"),
                estado: "activo",
                observaciones: "Directora del proyecto",
            },
        }),

        // Trabajo 3 - App móvil
        prisma.actores.create({
            data: {
                id_persona: personas[2].id_persona,
                id_trabajo_grado: trabajos[2].id_trabajo_grado,
                id_tipo_rol: tiposRol[0].id_rol,
                fecha_asignacion: new Date("2024-01-15"),
                estado: "activo",
                observaciones: "Estudiante en práctica profesional",
            },
        }),
        prisma.actores.create({
            data: {
                id_persona: personas[5].id_persona,
                id_trabajo_grado: trabajos[2].id_trabajo_grado,
                id_tipo_rol: tiposRol[1].id_rol,
                fecha_asignacion: new Date("2024-01-15"),
                estado: "activo",
                observaciones: "Director académico",
            },
        }),

        // Coordinador asignado a supervisión general
        prisma.actores.create({
            data: {
                id_persona: personas[6].id_persona,
                id_trabajo_grado: trabajos[0].id_trabajo_grado,
                id_tipo_rol: tiposRol[3].id_rol,
                fecha_asignacion: new Date("2024-02-10"),
                estado: "activo",
                observaciones: "Supervisión del programa",
            },
        }),
    ]);

    // 14. SEGUIMIENTOS
    console.log("📋 Creando seguimientos...");
    await Promise.all([
        prisma.seguimiento_tg.create({
            data: {
                id_trabajo_grado: trabajos[0].id_trabajo_grado,
                id_actor: actores[1].id_actor,
                id_accion: acciones[0].id_accion,
                resumen:
                    "Registro inicial del proyecto de sistema de información",
                id_estado_nuevo: estados[0].id_estado_tg,
                numero_oficio: "OF-2024-001",
                fecha_oficio: new Date("2024-02-01"),
            },
        }),
        prisma.seguimiento_tg.create({
            data: {
                id_trabajo_grado: trabajos[0].id_trabajo_grado,
                id_actor: actores[1].id_actor,
                id_accion: acciones[1].id_accion,
                resumen: "Primera revisión del avance del proyecto",
                fecha_registro: new Date("2024-04-15"),
                calificacion: 4.2,
            },
        }),
        prisma.seguimiento_tg.create({
            data: {
                id_trabajo_grado: trabajos[1].id_trabajo_grado,
                id_actor: actores[4].id_actor,
                id_accion: acciones[0].id_accion,
                resumen: "Registro de monografía sobre marketing digital",
                id_estado_nuevo: estados[0].id_estado_tg,
                numero_oficio: "OF-2024-002",
                fecha_oficio: new Date("2024-03-01"),
            },
        }),
        prisma.seguimiento_tg.create({
            data: {
                id_trabajo_grado: trabajos[1].id_trabajo_grado,
                id_actor: actores[4].id_actor,
                id_accion: acciones[1].id_accion,
                resumen: "Revisión de marco teórico y metodología",
                id_estado_anterior: estados[0].id_estado_tg,
                id_estado_nuevo: estados[1].id_estado_tg,
                fecha_registro: new Date("2024-05-20"),
            },
        }),
        prisma.seguimiento_tg.create({
            data: {
                id_trabajo_grado: trabajos[2].id_trabajo_grado,
                id_actor: actores[6].id_actor,
                id_accion: acciones[0].id_accion,
                resumen: "Inicio de práctica profesional en TechSolutions",
                id_estado_nuevo: estados[0].id_estado_tg,
                numero_oficio: "OF-2024-003",
                fecha_oficio: new Date("2024-01-15"),
            },
        }),
    ]);

    console.log("✅ Seed completado exitosamente!");
    console.log(`
📊 Resumen de datos creados:
================================
- ${tiposDocumento.length} tipos de documento
- ${tiposRol.length} tipos de rol
- ${facultades.length} facultades
- ${nivelesFormacion.length} niveles de formación
- ${programas.length} programas académicos
- ${opcionesGrado.length} opciones de grado
- ${empresas.length} empresas
- ${estados.length} estados
- ${acciones.length} acciones de seguimiento
- ${distinciones.length} tipos de distinciones
- ${personas.length} personas (${personas.filter((p) => p.password).length} con acceso al sistema)
- ${trabajos.length} trabajos de grado
- ${actores.length} asignaciones de actores
- 5 seguimientos registrados

🔐 AUTENTICACIÓN:
- 7 usuarios con acceso (password: Password123!)
- 1 usuario pendiente de confirmación
- 1 usuario sin acceso (jurado externo)
  `);
}

main()
    .catch((e) => {
        console.error("❌ Error en el seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
