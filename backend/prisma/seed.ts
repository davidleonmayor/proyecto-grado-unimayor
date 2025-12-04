// seed.ts - Script para poblar la base de datos con datos de ejemplo
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Función para generar token de 6 dígitos único
let tokenCounter = 100000;
function generateToken(): string {
    const token = String(tokenCounter).padStart(6, '0');
    tokenCounter++;
    if (tokenCounter > 999999) {
        tokenCounter = 100000; // Reset si llegamos al límite
    }
    return token;
}

// Función para hashear contraseñas
async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Función para generar nombres aleatorios
function getRandomName(): string {
    const nombres = [
        "Juan", "María", "Carlos", "Ana", "Luis", "Laura", "Pedro", "Carmen",
        "José", "Patricia", "Miguel", "Sandra", "Francisco", "Andrea", "Jorge", "Diana",
        "Roberto", "Monica", "Fernando", "Claudia", "Ricardo", "Gloria", "Daniel", "Martha",
        "Alejandro", "Lucia", "Andrés", "Paola", "Sergio", "Natalia", "Diego", "Valeria",
        "Eduardo", "Camila", "Javier", "Sofia", "Manuel", "Isabella", "Raúl", "Mariana",
        "Oscar", "Daniela", "Alberto", "Alejandra", "Hector", "Carolina", "Mario", "Juliana",
        "Rodrigo", "Angela", "Felipe", "Tatiana", "Cristian", "Lorena", "Sebastian", "Adriana"
    ];
    return nombres[Math.floor(Math.random() * nombres.length)];
}

function getRandomLastName(): string {
    const apellidos = [
        "García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez",
        "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Muñoz",
        "Álvarez", "Romero", "Alonso", "Gutiérrez", "Navarro", "Torres", "Domínguez", "Vázquez",
        "Ramos", "Gil", "Ramírez", "Serrano", "Blanco", "Suárez", "Molina", "Morales",
        "Ortega", "Delgado", "Castro", "Ortiz", "Rubio", "Marín", "Sanz", "Iglesias",
        "Nuñez", "Medina", "Garrido", "Cortés", "Castillo", "Santos", "Lozano", "Guerrero"
    ];
    return apellidos[Math.floor(Math.random() * apellidos.length)];
}

// Función para generar documento único
function generateDocument(prefix: string, index: number): string {
    const num = String(10000000 + index).padStart(10, '0');
    return `${prefix}-${num}`;
}

// Función para generar email único
// Función para normalizar texto eliminando tildes y reemplazando ñ
function normalizeText(text: string): string {
    return text
        .normalize('NFD') // Descompone caracteres con acentos
        .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos (tildes)
        .replace(/ñ/g, 'n') // Reemplaza ñ por n
        .replace(/Ñ/g, 'N'); // Reemplaza Ñ por N
}

function generateEmail(firstName: string, lastName: string, index: number, type: 'estudiante' | 'profesor' | 'coordinador'): string {
    const normalizedFirstName = normalizeText(firstName.toLowerCase());
    const normalizedLastName = normalizeText(lastName.toLowerCase());
    const base = `${normalizedFirstName}.${normalizedLastName}`.replace(/\s+/g, '.');
    const domain = type === 'estudiante' ? 'estudiante.edu.co' : 'universidad.edu.co';
    return `${base}.${index}@${domain}`;
}

async function main() {
    console.log("🌱 Iniciando seed de la base de datos...");

    // LIMPIEZA DE DATOS EXISTENTES (en orden inverso de dependencias)
    console.log("🧹 Limpiando datos existentes...");
    await prisma.distincion_tg.deleteMany({});
    await prisma.seguimiento_tg.deleteMany({});
    await prisma.actores.deleteMany({});
    await prisma.trabajo_grado.deleteMany({});
    await prisma.persona.deleteMany({});
    await prisma.distinciones.deleteMany({});
    await prisma.accion_seg.deleteMany({});
    await prisma.estado_tg.deleteMany({});
    await prisma.empresa.deleteMany({});
    await prisma.opcion_grado_formacion.deleteMany({});
    await prisma.opcion_grado.deleteMany({});
    await prisma.programa_academico.deleteMany({});
    await prisma.nivel_formacion.deleteMany({});
    await prisma.facultad.deleteMany({});
    await prisma.tipo_rol.deleteMany({});
    await prisma.tipo_documento.deleteMany({});
    console.log("✅ Datos existentes eliminados");

    // 1. TIPOS DE DOCUMENTO
    console.log("📄 Creando tipos de documento...");
    const tiposDocumento = await Promise.all([
        prisma.tipo_documento.create({
            data: {
                id_tipo_documento: "clxyz6bvt0000kh0gao8tqvhz",
                documento: "CC"
            }
        }),
        prisma.tipo_documento.create({
            data: {
                id_tipo_documento: "clxyz6bvt0001kh0g3m4n5o6p",
                documento: "CE"
            }
        }),
        prisma.tipo_documento.create({
            data: {
                id_tipo_documento: "clxyz6bvt0002kh0g7q8r9s0t",
                documento: "PAS"
            }
        }),
        prisma.tipo_documento.create({
            data: {
                id_tipo_documento: "clxyz6bvt0003kh0g1u2v3w4x",
                documento: "TI"
            }
        }),
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
                nombre_facultad: "Educación",
                codigo_facultad: "EDU",
            },
        }),
        prisma.facultad.create({
            data: {
                nombre_facultad: "Artes y Diseño",
                codigo_facultad: "AYD",
            },
        }),
        prisma.facultad.create({
            data: {
                nombre_facultad: "Ciencias Sociales y de la Administración",
                codigo_facultad: "CSA",
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
        // Facultad Ingeniería
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Tecnología en Desarrollo de Software",
                id_nivel_formacion: nivelesFormacion[3].id_nivel, // Tecnólogo
                id_facultad: facultades[0].id_facultad, // Ingeniería
                estado: "activo",
            },
        }),
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Ingeniería Informática",
                id_nivel_formacion: nivelesFormacion[0].id_nivel, // Pregrado
                id_facultad: facultades[0].id_facultad, // Ingeniería
                estado: "activo",
            },
        }),
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Ingeniería Multimedia",
                id_nivel_formacion: nivelesFormacion[0].id_nivel, // Pregrado
                id_facultad: facultades[0].id_facultad, // Ingeniería
                estado: "activo",
            },
        }),
        // Facultad Educación
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Música",
                id_nivel_formacion: nivelesFormacion[0].id_nivel, // Pregrado
                id_facultad: facultades[1].id_facultad, // Educación
                estado: "activo",
            },
        }),
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Licenciatura en Inglés y Español",
                id_nivel_formacion: nivelesFormacion[0].id_nivel, // Pregrado
                id_facultad: facultades[1].id_facultad, // Educación
                estado: "activo",
            },
        }),
        // Facultad Artes y Diseño
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Arquitectura",
                id_nivel_formacion: nivelesFormacion[0].id_nivel, // Pregrado
                id_facultad: facultades[2].id_facultad, // Artes y Diseño
                estado: "activo",
            },
        }),
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Diseño Gráfico",
                id_nivel_formacion: nivelesFormacion[0].id_nivel, // Pregrado
                id_facultad: facultades[2].id_facultad, // Artes y Diseño
                estado: "activo",
            },
        }),
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Delineante de Arquitectura",
                id_nivel_formacion: nivelesFormacion[0].id_nivel, // Pregrado
                id_facultad: facultades[2].id_facultad, // Artes y Diseño
                estado: "activo",
            },
        }),
        // Facultad Ciencias Sociales y de la Administración
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Tecnología en Gestión Empresarial",
                id_nivel_formacion: nivelesFormacion[3].id_nivel, // Tecnólogo
                id_facultad: facultades[3].id_facultad, // Ciencias Sociales y de la Administración
                estado: "activo",
            },
        }),
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Administración de Empresas",
                id_nivel_formacion: nivelesFormacion[0].id_nivel, // Pregrado
                id_facultad: facultades[3].id_facultad, // Ciencias Sociales y de la Administración
                estado: "activo",
            },
        }),
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Administración Financiera",
                id_nivel_formacion: nivelesFormacion[0].id_nivel, // Pregrado
                id_facultad: facultades[3].id_facultad, // Ciencias Sociales y de la Administración
                estado: "activo",
            },
        }),
        prisma.programa_academico.create({
            data: {
                nombre_programa: "Tecnología en Gestión de Mercados",
                id_nivel_formacion: nivelesFormacion[3].id_nivel, // Tecnólogo
                id_facultad: facultades[3].id_facultad, // Ciencias Sociales y de la Administración
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

    // 7. EMPRESAS (100+)
    console.log("🏢 Creando empresas (100+)...");
    const empresasBase = await Promise.all([
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

    // Generar 100+ empresas adicionales
    const empresasAdicionales: Promise<Awaited<ReturnType<typeof prisma.empresa.create>>>[] = [];
    const tiposEmpresa = ["S.A.S", "Ltda", "S.A", "E.U", "S.C.A"];
    const sectores = ["Tecnología", "Consultoría", "Servicios", "Comercial", "Industrial", "Educación", "Salud", "Financiero"];
    
    for (let i = 0; i < 100; i++) {
        const sector = sectores[Math.floor(Math.random() * sectores.length)];
        const tipo = tiposEmpresa[Math.floor(Math.random() * tiposEmpresa.length)];
        const nit = `9${String(100000000 + i).padStart(8, '0')}-${Math.floor(Math.random() * 10)}`;
        empresasAdicionales.push(
            prisma.empresa.create({
                data: {
                    nit_empresa: nit,
                    nombre_empresa: `${sector} ${getRandomName()} ${tipo}`,
                    direccion: `Calle ${Math.floor(Math.random() * 200)} #${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 100)}`,
                    email: `contacto${i}@empresa${i}.com`,
                    telefono: `3${Math.floor(Math.random() * 10)}${String(Math.floor(Math.random() * 10000000)).padStart(9, '0')}`,
                    estado: "activo",
                },
            })
        );
    }
    const empresasAdicionalesCreadas = await Promise.all(empresasAdicionales);
    const empresas = [...empresasBase, ...empresasAdicionalesCreadas];

    // 8. ESTADOS DE TRABAJO DE GRADO
    console.log("✅ Creando estados...");
    const estados = await Promise.all([
        prisma.estado_tg.create({
            data: {
                nombre_estado: "En curso",
                descripcion: "Trabajo en curso",
                orden: 1,
            },
        }),
        prisma.estado_tg.create({
            data: {
                nombre_estado: "En Progreso",
                descripcion: "Trabajo en desarrollo",
                orden: 2,
            },
        }),
        prisma.estado_tg.create({
            data: {
                nombre_estado: "En Revisión",
                descripcion: "En revisión por director",
                orden: 3,
            },
        }),
        prisma.estado_tg.create({
            data: {
                nombre_estado: "Pendiente de Aprobación",
                descripcion: "Esperando aprobación",
                orden: 4,
            },
        }),
        prisma.estado_tg.create({
            data: {
                nombre_estado: "Aprobado",
                descripcion: "Trabajo aprobado",
                orden: 5,
            },
        }),
        prisma.estado_tg.create({
            data: {
                nombre_estado: "Rechazado",
                descripcion: "Trabajo rechazado",
                orden: 6,
            },
        }),
        prisma.estado_tg.create({
            data: {
                nombre_estado: "Finalizado",
                descripcion: "Trabajo finalizado",
                orden: 7,
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

    // Crear estudiantes (100 por cada programa académico = 1200+ estudiantes)
    console.log(`👨‍🎓 Creando estudiantes (100 por cada programa = ${programas.length * 100} estudiantes)...`);
    const estudiantesPromises: Promise<Awaited<ReturnType<typeof prisma.persona.create>>>[] = [];
    let estudianteGlobalIndex = 0;
    
    // Generar 100 estudiantes por cada programa académico
    for (const programa of programas) {
        for (let i = 0; i < 100; i++) {
            const nombres = getRandomName();
            const apellidos = `${getRandomLastName()} ${getRandomLastName()}`;
            const doc = generateDocument("EST", estudianteGlobalIndex);
            estudiantesPromises.push(
                prisma.persona.create({
                    data: {
                        nombres: nombres,
                        apellidos: apellidos,
                        id_tipo_doc_identidad: tiposDocumento[0].id_tipo_documento,
                        num_doc_identidad: doc,
                        numero_celular: `3${Math.floor(Math.random() * 10)}${String(Math.floor(Math.random() * 10000000)).padStart(9, '0')}`,
                        correo_electronico: generateEmail(nombres, apellidos, estudianteGlobalIndex, 'estudiante'),
                        password: defaultPassword,
                        confirmed: Math.random() > 0.2, // 80% confirmados
                        token: Math.random() > 0.2 ? null : generateToken(), // Solo generar token si no está confirmado
                        ultimo_acceso: Math.random() > 0.3 ? new Date() : null,
                        intentos_fallidos: Math.floor(Math.random() * 3),
                        id_programa_academico: programa.id_programa, // Asociar estudiante con su programa
                    } as any,
                })
            );
            estudianteGlobalIndex++;
        }
    }
    const estudiantes = await Promise.all(estudiantesPromises);
    
    // Organizar estudiantes por programa (para facilitar asignación a trabajos)
    const estudiantesPorPrograma: { [programaId: string]: typeof estudiantes } = {};
    programas.forEach((programa, programaIndex) => {
        const inicio = programaIndex * 100;
        const fin = inicio + 100;
        estudiantesPorPrograma[programa.id_programa] = estudiantes.slice(inicio, fin);
    });

    // Crear profesores/directores (100+)
    console.log("👨‍🏫 Creando profesores/directores (100+)...");
    const profesoresPromises: Promise<Awaited<ReturnType<typeof prisma.persona.create>>>[] = [];
    for (let i = 0; i < 100; i++) {
        const nombres = getRandomName();
        const apellidos = `${getRandomLastName()} ${getRandomLastName()}`;
        const doc = generateDocument("PROF", i);
        const facultadIndex = Math.floor(Math.random() * facultades.length);
        profesoresPromises.push(
            prisma.persona.create({
                data: {
                    nombres: nombres,
                    apellidos: apellidos,
                    id_tipo_doc_identidad: tiposDocumento[0].id_tipo_documento,
                    num_doc_identidad: doc,
                    numero_celular: `3${Math.floor(Math.random() * 10)}${String(Math.floor(Math.random() * 10000000)).padStart(9, '0')}`,
                    correo_electronico: generateEmail(nombres, apellidos, i, 'profesor'),
                    password: defaultPassword,
                    confirmed: true,
                    ultimo_acceso: new Date(),
                    intentos_fallidos: Math.floor(Math.random() * 3),
                    id_facultad: facultades[facultadIndex].id_facultad,
                } as any,
            })
        );
    }
    const profesores = await Promise.all(profesoresPromises);

    // Crear coordinadores (10)
    console.log("👔 Creando coordinadores (10)...");
    const coordinadoresPromises: Promise<Awaited<ReturnType<typeof prisma.persona.create>>>[] = [];
    for (let i = 0; i < 10; i++) {
        const nombres = getRandomName();
        const apellidos = `${getRandomLastName()} ${getRandomLastName()}`;
        const doc = generateDocument("COORD", i);
        const facultadIndex = Math.floor(Math.random() * facultades.length);
        coordinadoresPromises.push(
            prisma.persona.create({
                data: {
                    nombres: nombres,
                    apellidos: apellidos,
                    id_tipo_doc_identidad: tiposDocumento[0].id_tipo_documento,
                    num_doc_identidad: doc,
                    numero_celular: `3${Math.floor(Math.random() * 10)}${String(Math.floor(Math.random() * 10000000)).padStart(9, '0')}`,
                    correo_electronico: generateEmail(nombres, apellidos, i, 'coordinador'),
                    password: defaultPassword,
                    confirmed: true,
                    ultimo_acceso: new Date(),
                    intentos_fallidos: 0,
                    id_facultad: facultades[facultadIndex].id_facultad,
                } as any,
            })
        );
    }
    const coordinadores = await Promise.all(coordinadoresPromises);

    // Crear jurados externos (20)
    console.log("⚖️ Creando jurados externos (20)...");
    const juradosPromises: Promise<Awaited<ReturnType<typeof prisma.persona.create>>>[] = [];
    for (let i = 0; i < 20; i++) {
        const nombres = getRandomName();
        const apellidos = `${getRandomLastName()} ${getRandomLastName()}`;
        const doc = generateDocument("JUR", i);
        juradosPromises.push(
            prisma.persona.create({
                data: {
                    nombres: nombres,
                    apellidos: apellidos,
                    id_tipo_doc_identidad: tiposDocumento[0].id_tipo_documento,
                    num_doc_identidad: doc,
                    numero_celular: `3${Math.floor(Math.random() * 10)}${String(Math.floor(Math.random() * 10000000)).padStart(9, '0')}`,
                    correo_electronico: `jurado${i}@externo.com`,
                    password: null,
                    confirmed: false,
                    intentos_fallidos: 0,
                },
            })
        );
    }
    const jurados = await Promise.all(juradosPromises);

    const personas = [...estudiantes, ...profesores, ...coordinadores, ...jurados];

    console.log("\n🔐 CREDENCIALES DE ACCESO CREADAS:");
    console.log("================================");
    console.log("Contraseña para todos: Password123!");
    console.log(`\nTotal de usuarios creados: ${personas.length}`);
    console.log(`- Estudiantes: ${estudiantes.length} (${programas.length} programas × 100 estudiantes = ${programas.length * 100} estudiantes)`);
    console.log(`  * Distribución: 100 estudiantes por cada programa académico`);
    console.log(`- Profesores/Directores: ${profesores.length}`);
    console.log(`- Coordinadores: ${coordinadores.length}`);
    console.log(`- Jurados externos: ${jurados.length}`);
    console.log(`\nUsuarios con acceso: ${personas.filter(p => p.password).length}`);
    console.log(`Usuarios pendientes de confirmación: ${personas.filter(p => !p.confirmed && p.password).length}`);
    console.log(`Usuarios sin acceso: ${personas.filter(p => !p.password).length}`);
    
    // Mostrar ejemplos de usuarios para iniciar sesión
    console.log("\n📧 EJEMPLOS DE USUARIOS PARA INICIAR SESIÓN:");
    console.log("===========================================");
    
    // Mostrar 5 estudiantes confirmados
    const estudiantesConfirmados = estudiantes.filter(e => e.confirmed && e.password).slice(0, 5);
    console.log("\n👨‍🎓 Estudiantes (primeros 5):");
    estudiantesConfirmados.forEach((est, idx) => {
        console.log(`   ${idx + 1}. Email: ${est.correo_electronico} | Contraseña: Password123!`);
    });
    
    // Mostrar 5 profesores
    const profesoresConfirmados = profesores.filter(p => p.confirmed && p.password).slice(0, 5);
    console.log("\n👨‍🏫 Profesores/Directores (primeros 5):");
    profesoresConfirmados.forEach((prof, idx) => {
        console.log(`   ${idx + 1}. Email: ${prof.correo_electronico} | Contraseña: Password123!`);
    });
    
    // Mostrar todos los coordinadores
    const coordinadoresConfirmados = coordinadores.filter(c => c.confirmed && c.password);
    console.log("\n👔 Coordinadores:");
    coordinadoresConfirmados.forEach((coord, idx) => {
        console.log(`   ${idx + 1}. Email: ${coord.correo_electronico} | Contraseña: Password123!`);
    });
    
    console.log("\n💡 NOTA: Todos los usuarios con acceso tienen la misma contraseña: Password123!");
    console.log("💡 Los usuarios pendientes de confirmación necesitan confirmar su cuenta primero.\n");

    // 12. TRABAJOS DE GRADO (100+)
    console.log("📖 Creando trabajos de grado (100+)...");
    const temasProyectos = [
        "Sistema de información para gestión", "Análisis del impacto de", "Desarrollo de aplicación",
        "Diseño e implementación de", "Estudio comparativo de", "Propuesta de mejora para",
        "Evaluación de estrategias de", "Modelo predictivo para", "Plataforma web para",
        "Framework de desarrollo para", "Análisis de tendencias en", "Solución tecnológica para"
    ];
    const areas = [
        "académica universitaria", "marketing digital", "gestión empresarial", "educación virtual",
        "salud pública", "comercio electrónico", "inteligencia artificial", "ciber seguridad",
        "big data", "cloud computing", "IoT", "blockchain", "realidad virtual", "automatización"
    ];

    const trabajosPromises: Promise<Awaited<ReturnType<typeof prisma.trabajo_grado.create>>>[] = [];
    for (let i = 0; i < 100; i++) {
        const tema = temasProyectos[Math.floor(Math.random() * temasProyectos.length)];
        const area = areas[Math.floor(Math.random() * areas.length)];
        const titulo = `${tema} ${area}`;
        const programaIndex = Math.floor(Math.random() * programas.length);
        const opcionIndex = Math.floor(Math.random() * opcionesGrado.length);
        const estadoIndex = Math.floor(Math.random() * estados.length);
        const tieneEmpresa = Math.random() > 0.6; // 40% tienen empresa
        
        const fechaInicio = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const fechaFin = new Date(fechaInicio);
        fechaFin.setMonth(fechaFin.getMonth() + Math.floor(Math.random() * 12) + 6);

        trabajosPromises.push(
            prisma.trabajo_grado.create({
                data: {
                    titulo_trabajo: titulo,
                    objetivos: `Objetivo principal: ${tema.toLowerCase()} ${area}. Objetivos específicos: analizar, diseñar e implementar soluciones innovadoras.`,
                    fecha_inicio: fechaInicio,
                    fecha_fin_estima: fechaFin,
                    resumen: `Este proyecto se enfoca en ${tema.toLowerCase()} ${area}, buscando aportar soluciones prácticas y teóricas al campo de estudio.`,
                    id_opcion_grado: opcionesGrado[opcionIndex].id_opcion_grado,
                    id_estado_actual: estados[estadoIndex].id_estado_tg,
                    id_programa_academico: programas[programaIndex].id_programa,
                    id_empresa_practica: tieneEmpresa ? empresas[Math.floor(Math.random() * empresas.length)].id_empresa : null,
                },
            })
        );
    }
    const trabajos = await Promise.all(trabajosPromises);

    // 13. ACTORES (Asignaciones) (100+)
    console.log("🎭 Creando asignaciones de actores (100+)...");
    const estudianteRole = tiposRol.find(r => r.nombre_rol === "Estudiante");
    const directorRole = tiposRol.find(r => r.nombre_rol === "Director");
    const juradoRole = tiposRol.find(r => r.nombre_rol === "Jurado");
    const coordinadorRole = tiposRol.find(r => r.nombre_rol === "Coordinador de Carrera");

    const actoresPromises: Promise<Awaited<ReturnType<typeof prisma.actores.create>>>[] = [];
    let estudianteIndex = 0;
    let profesorIndex = 0;
    let juradoIndex = 0;
    let coordinadorIndex = 0;

    // Organizar contadores de estudiantes por programa
    const estudiantesPorProgramaIndex: { [programaId: string]: number } = {};
    programas.forEach(programa => {
        estudiantesPorProgramaIndex[programa.id_programa] = 0;
    });

    // Asignar actores a cada trabajo de grado
    for (const trabajo of trabajos) {
        // Obtener estudiantes del mismo programa que el trabajo
        const estudiantesDelPrograma = estudiantesPorPrograma[trabajo.id_programa_academico] || [];
        const indicePrograma = estudiantesPorProgramaIndex[trabajo.id_programa_academico] || 0;
        
        // 1-2 estudiantes por trabajo (del mismo programa)
        const numEstudiantes = Math.random() > 0.5 ? 2 : 1;
        for (let i = 0; i < numEstudiantes && indicePrograma + i < estudiantesDelPrograma.length; i++) {
            const estudiante = estudiantesDelPrograma[indicePrograma + i];
            actoresPromises.push(
                prisma.actores.create({
                    data: {
                        id_persona: estudiante.id_persona,
                        id_trabajo_grado: trabajo.id_trabajo_grado,
                        id_tipo_rol: estudianteRole!.id_rol,
                        fecha_asignacion: trabajo.fecha_inicio,
                        estado: "activo",
                        observaciones: i === 0 ? "Estudiante principal" : "Estudiante colaborador",
                    },
                })
            );
        }
        // Actualizar índice para el siguiente trabajo del mismo programa
        estudiantesPorProgramaIndex[trabajo.id_programa_academico] = indicePrograma + numEstudiantes;

        // 1-2 directores por trabajo
        const numDirectores = Math.random() > 0.7 ? 2 : 1;
        for (let i = 0; i < numDirectores && profesorIndex < profesores.length; i++) {
            actoresPromises.push(
                prisma.actores.create({
                    data: {
                        id_persona: profesores[profesorIndex].id_persona,
                        id_trabajo_grado: trabajo.id_trabajo_grado,
                        id_tipo_rol: directorRole!.id_rol,
                        fecha_asignacion: trabajo.fecha_inicio,
                        estado: "activo",
                        observaciones: "Director del trabajo de grado",
                    },
                })
            );
            profesorIndex++;
        }

        // 0-2 jurados por trabajo (30% de probabilidad)
        if (Math.random() > 0.7 && juradoIndex < jurados.length) {
            const numJurados = Math.random() > 0.5 ? 2 : 1;
            for (let i = 0; i < numJurados && juradoIndex < jurados.length; i++) {
                actoresPromises.push(
                    prisma.actores.create({
                        data: {
                            id_persona: jurados[juradoIndex].id_persona,
                            id_trabajo_grado: trabajo.id_trabajo_grado,
                            id_tipo_rol: juradoRole!.id_rol,
                            fecha_asignacion: new Date(trabajo.fecha_inicio.getTime() + 30 * 24 * 60 * 60 * 1000),
                            estado: "activo",
                            observaciones: "Jurado evaluador",
                        },
                    })
                );
                juradoIndex++;
            }
        }
    }

    // Asignar algunos coordinadores a trabajos (20% de los trabajos)
    for (let i = 0; i < trabajos.length && coordinadorIndex < coordinadores.length; i++) {
        if (Math.random() > 0.8) {
            actoresPromises.push(
                prisma.actores.create({
                    data: {
                        id_persona: coordinadores[coordinadorIndex % coordinadores.length].id_persona,
                        id_trabajo_grado: trabajos[i].id_trabajo_grado,
                        id_tipo_rol: coordinadorRole!.id_rol,
                        fecha_asignacion: trabajos[i].fecha_inicio,
                        estado: "activo",
                        observaciones: "Supervisión del programa",
                    },
                })
            );
            coordinadorIndex++;
        }
    }

    const actores = await Promise.all(actoresPromises);

    // 14. SEGUIMIENTOS (100+)
    console.log("📋 Creando seguimientos (100+)...");
    const seguimientosPromises: Promise<Awaited<ReturnType<typeof prisma.seguimiento_tg.create>>>[] = [];
    const tiposAccion = ["Registro", "Revisión", "Asignación jurado", "Sustentación", "Aprobación", "Entrega versión final"];
    
    for (let i = 0; i < 100; i++) {
        const trabajo = trabajos[Math.floor(Math.random() * trabajos.length)];
        const actoresTrabajo = actores.filter(a => a.id_trabajo_grado === trabajo.id_trabajo_grado);
        if (actoresTrabajo.length === 0) continue;
        
        const actor = actoresTrabajo[Math.floor(Math.random() * actoresTrabajo.length)];
        const accionNombre = tiposAccion[Math.floor(Math.random() * tiposAccion.length)];
        const accion = acciones.find(a => a.tipo_accion === accionNombre) || acciones[0];
        
        const estadoAnterior = Math.random() > 0.5 ? estados[Math.floor(Math.random() * estados.length)].id_estado_tg : null;
        const estadoNuevo = estados[Math.floor(Math.random() * estados.length)].id_estado_tg;
        
        const fechaSeguimiento = new Date(trabajo.fecha_inicio);
        fechaSeguimiento.setDate(fechaSeguimiento.getDate() + Math.floor(Math.random() * 180));

        seguimientosPromises.push(
            prisma.seguimiento_tg.create({
                data: {
                    id_trabajo_grado: trabajo.id_trabajo_grado,
                    id_actor: actor.id_actor,
                    id_accion: accion.id_accion,
                    resumen: `Seguimiento ${i + 1}: ${accionNombre.toLowerCase()} del proyecto "${trabajo.titulo_trabajo.substring(0, 50)}..."`,
                    id_estado_anterior: estadoAnterior,
                    id_estado_nuevo: estadoNuevo,
                    numero_oficio: `OF-2024-${String(i + 1).padStart(3, '0')}`,
                    fecha_oficio: fechaSeguimiento,
                    numero_resolucion: Math.random() > 0.5 ? `RES-2024-${String(i + 1).padStart(4, '0')}` : null,
                },
            })
        );
    }
    await Promise.all(seguimientosPromises);

    // 15. EVENTOS PARA CADA PROYECTO DE GRADO
    console.log("📅 Creando eventos para proyectos de grado...");
    const eventosPromises: Promise<any>[] = [];
    
    const tiposEventos = [
        { nombre: "Inicio del proyecto", prioridad: "alta", diasDespues: 0 },
        { nombre: "Primera revisión", prioridad: "media", diasDespues: 30 },
        { nombre: "Segunda revisión", prioridad: "media", diasDespues: 60 },
        { nombre: "Entrega de avances", prioridad: "alta", diasDespues: 90 },
        { nombre: "Revisión final", prioridad: "alta", diasDespues: 120 },
        { nombre: "Sustentación", prioridad: "alta", diasDespues: 150 },
        { nombre: "Entrega de versión final", prioridad: "alta", diasDespues: 180 },
    ];

    for (const trabajo of trabajos) {
        // Crear eventos relacionados con el proyecto (TODOS, incluso pasados)
        for (const tipoEvento of tiposEventos) {
            const fechaEvento = new Date(trabajo.fecha_inicio);
            fechaEvento.setDate(fechaEvento.getDate() + tipoEvento.diasDespues);
            
            const horaInicio = Math.floor(Math.random() * 8) + 8; // Entre 8 AM y 4 PM
            const horaFin = horaInicio + 2; // Duración de 2 horas
            
            eventosPromises.push(
                (prisma as any).evento.create({
                    data: {
                        titulo: `${tipoEvento.nombre}: ${trabajo.titulo_trabajo.substring(0, 50)}${trabajo.titulo_trabajo.length > 50 ? '...' : ''}`,
                        descripcion: `Evento relacionado con el proyecto de grado "${trabajo.titulo_trabajo}"`,
                        fecha_inicio: fechaEvento,
                        fecha_fin: fechaEvento,
                        hora_inicio: `${String(horaInicio).padStart(2, '0')}:00`,
                        hora_fin: `${String(horaFin).padStart(2, '0')}:00`,
                        prioridad: tipoEvento.prioridad,
                        todo_el_dia: false,
                    },
                })
            );
        }
    }

    // Agregar eventos de prueba adicionales con fechas variadas (pasados, presentes y futuros)
    const hoy = new Date();
    const eventosPrueba = [
        { titulo: "Reunión de coordinación - Enero", prioridad: "alta", dias: -60, hora: 9 },
        { titulo: "Entrega de documentación - Febrero", prioridad: "media", dias: -30, hora: 10 },
        { titulo: "Revisión de proyectos - Marzo", prioridad: "alta", dias: -15, hora: 14 },
        { titulo: "Evento de prueba - Hoy", prioridad: "alta", dias: 0, hora: 11 },
        { titulo: "Sustentaciones programadas", prioridad: "alta", dias: 5, hora: 8 },
        { titulo: "Reunión de seguimiento", prioridad: "media", dias: 10, hora: 15 },
        { titulo: "Entrega de calificaciones", prioridad: "baja", dias: 20, hora: 13 },
        { titulo: "Ceremonia de graduación", prioridad: "alta", dias: 45, hora: 10 },
    ];

    for (const eventoPrueba of eventosPrueba) {
        const fechaEvento = new Date(hoy);
        fechaEvento.setDate(fechaEvento.getDate() + eventoPrueba.dias);
        
        eventosPromises.push(
            (prisma as any).evento.create({
                data: {
                    titulo: eventoPrueba.titulo,
                    descripcion: `Evento de prueba para demostración del sistema`,
                    fecha_inicio: fechaEvento,
                    fecha_fin: fechaEvento,
                    hora_inicio: `${String(eventoPrueba.hora).padStart(2, '0')}:00`,
                    hora_fin: `${String(eventoPrueba.hora + 2).padStart(2, '0')}:00`,
                    prioridad: eventoPrueba.prioridad,
                    todo_el_dia: false,
                },
            })
        );
    }

    const eventos = await Promise.all(eventosPromises);

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
- 100+ seguimientos registrados
- ${eventos.length} eventos creados

🔐 AUTENTICACIÓN:
- ${personas.filter((p) => p.password && p.confirmed).length} usuarios con acceso (password: Password123!)
- ${personas.filter((p) => p.password && !p.confirmed).length} usuarios pendientes de confirmación
- ${personas.filter((p) => !p.password).length} usuarios sin acceso (jurados externos)
  `);
}

main()
    .catch((e) => {
        console.error("❌ Unexpected error clearing database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
