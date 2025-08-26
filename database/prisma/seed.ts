import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Facultades
  const facultad = await prisma.dL_FACULTAD.create({
    data: {
      nombre_facultad: "Ingeniería",
    },
  });

  // 2. Programas académicos
  const programa = await prisma.dL_PROGRAMA_ACADEMICO.create({
    data: {
      nombre_programa: "Ingeniería de Sistemas",
      nivel_formacion: "Pregrado",
      id_facultad: facultad.id_facultad,
      codigo_snies: "12345",
    },
  });

  // 3. Opciones de grado
  const opcion = await prisma.dL_OPCION_GRADO.create({
    data: {
      nombre_opcion_grado: "Monografía",
      descripcion_opcion: "Investigación individual",
      tipo_programa_academico: "Pregrado",
      id_programa_academico: programa.id_programa_academico,
    },
  });

  // 4. Estados de trabajo de grado
  const estado = await prisma.dL_ESTADO_TG.create({
    data: {
      nombre_estado: "En desarrollo",
    },
  });

  // 5. Estudiantes
  const estudiante = await prisma.dL_ESTUDIANTE.create({
    data: {
      id_estudiante: "EST001",
      id_programa_academico: programa.id_programa_academico,
      nombres: "Juan",
      apellidos: "Pérez",
      tipo_doc_identidad: "CC",
      num_doc_identidad: "100200300",
      email_institucional: "juan.perez@uni.edu",
      telefono: "3001234567",
      porc_creditos_aprob: 70,
      estado_academico: "Activo",
    },
  });

  // 6. Docentes
  const docente = await prisma.dL_DOCENTE.create({
    data: {
      id_docente: "DOC001",
      nombres: "María",
      apellidos: "Gómez",
      email: "maria.gomez@uni.edu",
      tipo_vinculacion: "Tiempo Completo",
      area_especializacion: "Inteligencia Artificial",
      tipo_docente: "Asesor",
    },
  });

  // 7. Trabajo de grado
  const trabajo = await prisma.dL_TRABAJO_GRADO.create({
    data: {
      titulo_trabajo: "Sistema de recomendación con IA",
      id_estudiante_principal: estudiante.id_estudiante,
      id_opcion_grado: opcion.id_opcion_grado,
      id_estado_actual: estado.id_estado_tg,
      observaciones: "Trabajo en etapa inicial",
    },
  });

  // 8. Relación estudiante - trabajo
  await prisma.dL_EST_EST_TG.create({
    data: {
      id_estudiante: estudiante.id_estudiante,
      id_trabajo_grado: trabajo.id_trabajo_grado,
    },
  });

  // 9. Asignación de asesor
  await prisma.dL_ASIGNACION_ASESOR.create({
    data: {
      id_trabajo_grado: trabajo.id_trabajo_grado,
      id_docente_asesor: docente.id_docente,
      fecha_asignacion: new Date("2025-08-01"),
      estado_asesoria: "Activa",
    },
  });

  console.log("✅ Seed ejecutado correctamente");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
