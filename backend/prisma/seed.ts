import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Facultades
  const facIng = await prisma.fACULTAD.create({
    data: {
      NOMBRE_FACULTAD: "Ingeniería",
      CODIGO_FACULTAD: "FING",
    },
  });

  // 2️⃣ Programas académicos
  const progSistemas = await prisma.pROGRAMA_ACADEMICO.create({
    data: {
      NOMBRE_PROGRAMA: "Ingeniería de Sistemas",
      CODIGO_SNIES: "12345",
      ESTADO: "Activo",
      ID_FACULTAD: facIng.ID_FACULTAD,
    },
  });

  // 3️⃣ Nivel de formación
  const nivelPregrado = await prisma.nIVEL_FORMACION.create({
    data: {
      NOMBRE_NIVEL: "Pregrado",
      DESCRIPCION: "Carrera universitaria de pregrado",
    },
  });

  // 4️⃣ Programa - Nivel
  const progNivel = await prisma.pROGRAMA_NIVEL.create({
    data: {
      ID_PROGRAMA_ACADEMICO: progSistemas.ID_PROGRAMA_ACADEMICO,
      ID_NIVEL_FORMACION: nivelPregrado.ID_NIVEL_FORMACION,
      ESTADO: "Activo",
    },
  });

  // 5️⃣ Opción de grado
  const opcionProyecto = await prisma.oPCION_GRADO.create({
    data: {
      NOMBRE_OPCION_GRADO: "Proyecto de investigación",
      DESCRIPCION_OPCION: "Trabajo de investigación como opción de grado",
      ESTADO: "Activo",
      ID_PROGRAMA_NIVEL: progNivel.ID_PROGRAMA_NIVEL,
    },
  });

  // 6️⃣ Estados de TG
  const estadoEnProceso = await prisma.eSTADO_TG.create({
    data: {
      NOMBRE_ESTADO: "En proceso",
      DESCRIPCION: "En ejecución",
      ORDEN: 1,
    },
  });

  const estadoFinalizado = await prisma.eSTADO_TG.create({
    data: { NOMBRE_ESTADO: "Finalizado", DESCRIPCION: "Concluido", ORDEN: 2 },
  });

  // 7️⃣ Personas
  const estudiante = await prisma.pERSONA.create({
    data: {
      CARNET: "E001",
      NOMBRES: "Juan",
      APELLIDOS: "Pérez",
      TIPO_DOC_IDENTIDAD: "CC",
      NUM_DOC_IDENTIDAD: "100200300",
      EMAIL_INSTITUCIONAL: "juan.perez@uni.edu",
      TELEFONO: "123456789",
      TIPO_VINCULACION: "Estudiante",
      FECHA_REGISTRO: new Date(),
    },
  });

  const docente = await prisma.pERSONA.create({
    data: {
      CARNET: "D001",
      NOMBRES: "Ana",
      APELLIDOS: "Gómez",
      TIPO_DOC_IDENTIDAD: "CC",
      NUM_DOC_IDENTIDAD: "200300400",
      EMAIL_INSTITUCIONAL: "ana.gomez@uni.edu",
      TELEFONO: "987654321",
      TIPO_VINCULACION: "Docente",
      AREA_ESPECIALIZACION: "Inteligencia Artificial",
    },
  });

  // 8️⃣ Matrícula del estudiante en programa
  await prisma.eSTUDIANTE_PROGRAMA.create({
    data: {
      CARNET: estudiante.CARNET,
      ID_PROGRAMA_ACADEMICO: progSistemas.ID_PROGRAMA_ACADEMICO,
      PORC_CREDITOS_APROBADOS: 50,
      ESTADO_ACADEMICO: "Activo",
      FECHA_INGRESO: new Date("2022-01-01"),
    },
  });

  // 9️⃣ Trabajo de grado
  const trabajo = await prisma.tRABAJO_GRADO.create({
    data: {
      TITULO_TRABAJO: "Sistema de recomendación para cursos",
      FECHA_INICIO: new Date(),
      ESTADO: "En proceso",
      ID_OPCION_GRADO: opcionProyecto.ID_OPCION_GRADO,
      ID_ESTADO_ACTUAL: estadoEnProceso.ID_ESTADO_TG,
      RESUMEN:
        "Un sistema de recomendación basado en ML para cursos universitarios.",
    },
  });

  // 🔟 Roles
  const rolEstudiante = await prisma.tIPO_ROL.create({
    data: {
      NOMBRE_ROL: "Estudiante",
      DESCRIPCION: "Participa como autor del TG",
    },
  });

  const rolAsesor = await prisma.tIPO_ROL.create({
    data: { NOMBRE_ROL: "Asesor", DESCRIPCION: "Dirige el TG" },
  });

  await prisma.rOL_PERSONA_TG.createMany({
    data: [
      {
        CARNET: estudiante.CARNET,
        ID_TRABAJO_GRADO: trabajo.ID_TRABAJO_GRADO,
        ID_TIPO_ROL: rolEstudiante.ID_TIPO_ROL,
        FECHA_ASIGNACION: new Date(),
        ESTADO: "Activo",
      },
      {
        CARNET: docente.CARNET,
        ID_TRABAJO_GRADO: trabajo.ID_TRABAJO_GRADO,
        ID_TIPO_ROL: rolAsesor.ID_TIPO_ROL,
        FECHA_ASIGNACION: new Date(),
        ESTADO: "Activo",
      },
    ],
  });

  // 1️⃣1️⃣ Seguimiento
  await prisma.sEGUIMIENTO_TG.create({
    data: {
      ID_TRABAJO_GRADO: trabajo.ID_TRABAJO_GRADO,
      CARNET_ACTOR: docente.CARNET,
      TIPO_ACCION: "Cambio estado",
      DESCRIPCION: "Trabajo registrado",
      DETALLE: "Se inicia el proyecto",
      ID_ESTADO_ANTERIOR: null,
      ID_ESTADO_NUEVO: estadoEnProceso.ID_ESTADO_TG,
    },
  });

  // 1️⃣2️⃣ Empresa y práctica
  const empresa = await prisma.eMPRESA.create({
    data: {
      NIT_EMPRESA: "900123456",
      NOMBRE_EMPRESA: "TechCorp S.A.S",
      DIRECCION: "Calle 123",
      TELEFONO: "321654987",
      EMAIL_CONTACTO: "contacto@techcorp.com",
      ESTADO: "Activa",
    },
  });

  await prisma.pRACTICA_PROFESIONAL.create({
    data: {
      ID_TRABAJO_GRADO: trabajo.ID_TRABAJO_GRADO,
      ID_EMPRESA: empresa.ID_EMPRESA,
      NOMBRE_SUPERVISOR: "Carlos Ruiz",
      CARGO_SUPERVISOR: "Gerente de Tecnología",
      FECHA_INICIO: new Date("2024-02-01"),
      ESTADO_PRACTICA: "Activa",
    },
  });

  // 1️⃣3️⃣ Evaluación
  await prisma.eVALUACION_TG.create({
    data: {
      ID_TRABAJO_GRADO: trabajo.ID_TRABAJO_GRADO,
      CARNET_EVALUADOR: docente.CARNET,
      TIPO_EVALUACION: "Parcial",
      FECHA_EVALUACION: new Date(),
      CALIFICACION: 85,
      CONCEPTO: "Aprobado",
    },
  });

  // 1️⃣4️⃣ Sustentación
  await prisma.sUSTENTACION.create({
    data: {
      ID_TRABAJO_GRADO: trabajo.ID_TRABAJO_GRADO,
      FECHA_SUSTENTACION: new Date("2024-12-01"),
      LUGAR: "Auditorio Principal",
      CALIFICACION_FINAL: 90,
      DISTINCION: "Meritoria",
      NUMERO_RESOLUCION: "RES-2024-001",
      FECHA_RESOLUCION: new Date("2024-12-15"),
    },
  });

  console.log("✅ Seed ejecutado correctamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
