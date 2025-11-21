export const tipoDocumentoData = [
  { ID_TIPO_DOCUMENTO: 1, DOCUMENTO: "CC" },
  { ID_TIPO_DOCUMENTO: 2, DOCUMENTO: "CE" },
  { ID_TIPO_DOCUMENTO: 3, DOCUMENTO: "PAS" },
  { ID_TIPO_DOCUMENTO: 4, DOCUMENTO: "TI" },
];

export const tipoRolData = [
  { ID_ROL: 1, NOMBRE_ROL: "Director de Proyecto", DESCRIPCION: "Director principal del trabajo de grado" },
  { ID_ROL: 2, NOMBRE_ROL: "Tutor", DESCRIPCION: "Tutor académico del estudiante" },
  { ID_ROL: 3, NOMBRE_ROL: "Docente", DESCRIPCION: "Docente evaluador" },
  { ID_ROL: 4, NOMBRE_ROL: "Estudiante", DESCRIPCION: "Estudiante realizando el trabajo de grado" },
  { ID_ROL: 5, NOMBRE_ROL: "Coordinador", DESCRIPCION: "Coordinador de programa" },
];

export const facultadData = [
  { ID_FACULTAD: 1, NOMBRE_FACULTAD: "Facultad de Ingeniería", CODIGO_FACULTAD: "FI" },
  { ID_FACULTAD: 2, NOMBRE_FACULTAD: "Facultad de Ciencias", CODIGO_FACULTAD: "FC" },
  { ID_FACULTAD: 3, NOMBRE_FACULTAD: "Facultad de Humanidades", CODIGO_FACULTAD: "FH" },
];

export const nivelFormacionData = [
  { ID_NIVEL: 1, NOMBRE_NIVEL: "Tecnológica", DESCRIPCION: "Nivel tecnológico" },
  { ID_NIVEL: 2, NOMBRE_NIVEL: "Pregrado", DESCRIPCION: "Nivel de pregrado" },
  { ID_NIVEL: 3, NOMBRE_NIVEL: "Especialización", DESCRIPCION: "Nivel de especialización" },
  { ID_NIVEL: 4, NOMBRE_NIVEL: "Maestría", DESCRIPCION: "Nivel de maestría" },
  { ID_NIVEL: 5, NOMBRE_NIVEL: "Doctorado", DESCRIPCION: "Nivel de doctorado" },
];

export const programaAcademicoData = [
  {
    ID_PROGRAMA: 1,
    NOMBRE_PROGRAMA: "Ingeniería Multimedia",
    ID_NIVEL_FORMACION: 2,
    ESTADO: "Activo",
    ID_FACULTAD: 1,
    CODIGO_SNIES: "IM2025",
  },
  {
    ID_PROGRAMA: 2,
    NOMBRE_PROGRAMA: "Tecnología en Desarrollo de Software",
    ID_NIVEL_FORMACION: 1,
    ESTADO: "Activo",
    ID_FACULTAD: 1,
    CODIGO_SNIES: "TDS2025",
  },
  {
    ID_PROGRAMA: 3,
    NOMBRE_PROGRAMA: "Ingeniería Informática",
    ID_NIVEL_FORMACION: 2,
    ESTADO: "Activo",
    ID_FACULTAD: 1,
    CODIGO_SNIES: "II2025",
  },
];

export const opcionGradoData = [
  {
    ID_OPCION_GRADO: 1,
    NOMBRE_OPCION_GRADO: "Proyecto de Investigación",
    DESCRIPCION: "Desarrollo de un proyecto de investigación aplicado a la carrera.",
    ESTADO: "Activa",
    TIPO_MODALIDAD: "Investigación",
  },
  {
    ID_OPCION_GRADO: 2,
    NOMBRE_OPCION_GRADO: "Pasantía",
    DESCRIPCION: "Trabajo en una empresa aliada con supervisión académica.",
    ESTADO: "Activa",
    TIPO_MODALIDAD: "Práctica",
  },
  {
    ID_OPCION_GRADO: 3,
    NOMBRE_OPCION_GRADO: "Trabajo de Aplicación",
    DESCRIPCION: "Desarrollo de un software, prototipo o solución tecnológica.",
    ESTADO: "Activa",
    TIPO_MODALIDAD: "Aplicación",
  },
];

export const estadoTGData = [
  { ID_ESTADO_TG: 1, NOMBRE_ESTADO: "Propuesta", ORDEN: 1, DESCRIPCION: "Propuesta inicial" },
  { ID_ESTADO_TG: 2, NOMBRE_ESTADO: "En Revisión", ORDEN: 2, DESCRIPCION: "En proceso de revisión" },
  { ID_ESTADO_TG: 3, NOMBRE_ESTADO: "Aprobado", ORDEN: 3, DESCRIPCION: "Propuesta aprobada" },
  { ID_ESTADO_TG: 4, NOMBRE_ESTADO: "En Desarrollo", ORDEN: 4, DESCRIPCION: "Trabajo en desarrollo" },
  { ID_ESTADO_TG: 5, NOMBRE_ESTADO: "Finalizado", ORDEN: 5, DESCRIPCION: "Trabajo finalizado" },
  { ID_ESTADO_TG: 6, NOMBRE_ESTADO: "Rechazado", ORDEN: 0, DESCRIPCION: "Propuesta rechazada" },
];

export const personasData = [
  {
    ID_PERSONA: 1,
    NOMBRES: "María",
    APELLIDOS: "Torres",
    ID_TIPO_DOC_IDENTIDAD: 1,
    NUM_DOC_IDENTIDAD: "1234567890",
    NUMERO_CELULAR: "3157894561",
    CORREO_ELECTRONICO: "maria.torres@unimayor.edu.co",
    CONFIRMED: true,
    img: "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    ID_PERSONA: 2,
    NOMBRES: "David",
    APELLIDOS: "Castillo",
    ID_TIPO_DOC_IDENTIDAD: 1,
    NUM_DOC_IDENTIDAD: "0987654321",
    NUMERO_CELULAR: "3102589634",
    CORREO_ELECTRONICO: "david.castillo@unimayor.edu.co",
    CONFIRMED: true,
    img: "https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    ID_PERSONA: 3,
    NOMBRES: "Carlos",
    APELLIDOS: "Pérez",
    ID_TIPO_DOC_IDENTIDAD: 1,
    NUM_DOC_IDENTIDAD: "1122334455",
    NUMERO_CELULAR: "3157894561",
    CORREO_ELECTRONICO: "carlos.perez@unimayor.edu.co",
    CONFIRMED: true,
    img: "https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    ID_PERSONA: 4,
    NOMBRES: "Laura",
    APELLIDOS: "Gómez",
    ID_TIPO_DOC_IDENTIDAD: 1,
    NUM_DOC_IDENTIDAD: "5566778899",
    NUMERO_CELULAR: "3102589634",
    CORREO_ELECTRONICO: "laura.gomez@unimayor.edu.co",
    CONFIRMED: true,
    img: "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    ID_PERSONA: 5,
    NOMBRES: "Andrés",
    APELLIDOS: "Rodríguez",
    ID_TIPO_DOC_IDENTIDAD: 1,
    NUM_DOC_IDENTIDAD: "6677889900",
    NUMERO_CELULAR: "3114569872",
    CORREO_ELECTRONICO: "andres.rodriguez@unimayor.edu.co",
    CONFIRMED: true,
    img: "https://images.pexels.com/photos/428328/pexels-photo-428328.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

export const trabajoGradoData = [
  {
    ID_TRABAJO_GRADO: 1,
    TITULO_TRABAJO: "Sistema de gestión de proyectos académicos",
    FECHA_INICIO: new Date(2024, 0, 15),
    FECHA_FIN_ESTIMA: new Date(2025, 5, 15),
    RESUMEN: "Sistema web para la gestión integral de proyectos académicos",
    ID_OPCION_GRADO: 3,
    ID_ESTADO_ACTUAL: 4,
    ID_PROGRAMA_ACADEMICO: 3,
    ID_EMPRESA_PRACTICA: null,
  },
  {
    ID_TRABAJO_GRADO: 2,
    TITULO_TRABAJO: "Plataforma de aprendizaje virtual",
    FECHA_INICIO: new Date(2024, 2, 1),
    FECHA_FIN_ESTIMA: new Date(2025, 7, 1),
    RESUMEN: "Plataforma educativa basada en tecnologías web modernas",
    ID_OPCION_GRADO: 1,
    ID_ESTADO_ACTUAL: 2,
    ID_PROGRAMA_ACADEMICO: 2,
    ID_EMPRESA_PRACTICA: null,
  },
  {
    ID_TRABAJO_GRADO: 3,
    TITULO_TRABAJO: "Aplicación móvil para gestión de eventos",
    FECHA_INICIO: new Date(2024, 3, 10),
    FECHA_FIN_ESTIMA: new Date(2025, 8, 10),
    RESUMEN: "Aplicación móvil multiplataforma para gestión de eventos universitarios",
    ID_OPCION_GRADO: 3,
    ID_ESTADO_ACTUAL: 1,
    ID_PROGRAMA_ACADEMICO: 1,
    ID_EMPRESA_PRACTICA: null,
  },
];

export const actoresData = [
  {
    ID_ACTOR: 1,
    ID_PERSONA: 1,
    ID_TRABAJO_GRADO: 1,
    ID_TIPO_ROL: 4,
    ESTADO: "Activo",
    FECHA_ASIGNACION: new Date(2024, 0, 15),
  },
  {
    ID_ACTOR: 2,
    ID_PERSONA: 3,
    ID_TRABAJO_GRADO: 1,
    ID_TIPO_ROL: 1,
    ESTADO: "Activo",
    FECHA_ASIGNACION: new Date(2024, 0, 20),
  },
  {
    ID_ACTOR: 3,
    ID_PERSONA: 2,
    ID_TRABAJO_GRADO: 2,
    ID_TIPO_ROL: 4,
    ESTADO: "Activo",
    FECHA_ASIGNACION: new Date(2024, 2, 1),
  },
  {
    ID_ACTOR: 4,
    ID_PERSONA: 4,
    ID_TRABAJO_GRADO: 2,
    ID_TIPO_ROL: 1,
    ESTADO: "Activo",
    FECHA_ASIGNACION: new Date(2024, 2, 5),
  },
];

export const seguimientoTGData = [
  {
    ID_SEGUIMIENTO: 1,
    ID_TRABAJO_GRADO: 1,
    ID_ACTOR: 2,
    ID_ACCION: 1,
    FECHA_REGISTRO: new Date(2025, 0, 15),
    RESUMEN: "Propuesta aprobada, cumple con todos los requisitos",
    ID_ESTADO_ANTERIOR: 1,
    ID_ESTADO_NUEVO: 3,
    CALIFICACION: null,
  },
  {
    ID_SEGUIMIENTO: 2,
    ID_TRABAJO_GRADO: 2,
    ID_ACTOR: 4,
    ID_ACCION: 2,
    FECHA_REGISTRO: new Date(2025, 0, 20),
    RESUMEN: "Requiere ajustes menores en la metodología",
    ID_ESTADO_ANTERIOR: 1,
    ID_ESTADO_NUEVO: 2,
    CALIFICACION: null,
  },
  {
    ID_SEGUIMIENTO: 3,
    ID_TRABAJO_GRADO: 1,
    ID_ACTOR: 2,
    ID_ACCION: 3,
    FECHA_REGISTRO: new Date(2025, 2, 10),
    RESUMEN: "Avances parciales entregados y revisados",
    ID_ESTADO_ANTERIOR: 3,
    ID_ESTADO_NUEVO: 4,
    CALIFICACION: 4.5,
  },
];

export const accionSegData = [
  { ID_ACCION: 1, TIPO_ACCION: "Aprobar", DESCRIPCION: "Aprobar documento o propuesta" },
  { ID_ACCION: 2, TIPO_ACCION: "Rechazar", DESCRIPCION: "Rechazar documento o propuesta" },
  { ID_ACCION: 3, TIPO_ACCION: "Revisar", DESCRIPCION: "Revisar avances o documentos" },
  { ID_ACCION: 4, TIPO_ACCION: "Solicitar Correcciones", DESCRIPCION: "Solicitar correcciones al estudiante" },
  { ID_ACCION: 5, TIPO_ACCION: "Calificar", DESCRIPCION: "Calificar trabajo o sustentación" },
];

export const empresaData = [
  {
    ID_EMPRESA: 1,
    NIT_EMPRESA: "900123456-1",
    NOMBRE_EMPRESA: "Tech Solutions S.A.S",
    DIRECCION: "Calle 123 #45-67",
    EMAIL: "contacto@techsolutions.com",
    TELEFONO: "6012345678",
    ESTADO: "Activa",
  },
];

export const careersData = programaAcademicoData.map((p) => ({
  id: p.ID_PROGRAMA,
  nombre: p.NOMBRE_PROGRAMA,
  codigo: p.CODIGO_SNIES,
}));

export const teachersData = personasData
  .filter((_, index) => index >= 2)
  .map((p) => ({
    id: p.ID_PERSONA,
    nombre: `${p.NOMBRES} ${p.APELLIDOS}`,
    email: p.CORREO_ELECTRONICO,
    img: p.img,
    telefono: p.NUMERO_CELULAR,
    rol: "Director de Proyecto",
    carrera: programaAcademicoData[0].NOMBRE_PROGRAMA,
  }));

export const degreeOptionsData = opcionGradoData.map((o) => ({
  id: o.ID_OPCION_GRADO,
  nombre: o.NOMBRE_OPCION_GRADO,
  descripcion: o.DESCRIPCION,
  requisitos: ["Documento de propuesta", "Director asignado", "Avances parciales"],
}));

export const studentsData = personasData
  .filter((_, index) => index < 2)
  .map((p, index) => ({
    id: p.ID_PERSONA,
    nombre: `${p.NOMBRES} ${p.APELLIDOS}`,
    email: p.CORREO_ELECTRONICO,
    img: p.img,
    carrera: programaAcademicoData[index % programaAcademicoData.length].NOMBRE_PROGRAMA,
    opcionGrado: opcionGradoData[index % opcionGradoData.length].NOMBRE_OPCION_GRADO,
    estado: estadoTGData[2].NOMBRE_ESTADO,
  }));

export const proposalsData = trabajoGradoData.map((tg, index) => {
  const estudiante = personasData.find((p) => actoresData.some((a) => a.ID_PERSONA === p.ID_PERSONA && a.ID_TRABAJO_GRADO === tg.ID_TRABAJO_GRADO && a.ID_TIPO_ROL === 4));
  const director = personasData.find((p) => actoresData.some((a) => a.ID_PERSONA === p.ID_PERSONA && a.ID_TRABAJO_GRADO === tg.ID_TRABAJO_GRADO && a.ID_TIPO_ROL === 1));
  const programa = programaAcademicoData.find((p) => p.ID_PROGRAMA === tg.ID_PROGRAMA_ACADEMICO);
  const opcion = opcionGradoData.find((o) => o.ID_OPCION_GRADO === tg.ID_OPCION_GRADO);
  const estado = estadoTGData.find((e) => e.ID_ESTADO_TG === tg.ID_ESTADO_ACTUAL);

  return {
    id: tg.ID_TRABAJO_GRADO,
    estudiante: estudiante ? `${estudiante.NOMBRES} ${estudiante.APELLIDOS}` : "Estudiante",
    titulo: tg.TITULO_TRABAJO,
    tipo: opcion?.NOMBRE_OPCION_GRADO || "N/A",
    estado: estado?.NOMBRE_ESTADO || "Pendiente",
    fecha: tg.FECHA_INICIO.toISOString().split("T")[0],
    director: director ? `${director.NOMBRES} ${director.APELLIDOS}` : "Sin asignar",
    carrera: programa?.NOMBRE_PROGRAMA || "N/A",
  };
});

export const documentsData = seguimientoTGData.map((s, index) => ({
  id: s.ID_SEGUIMIENTO,
  nombre: `Documento - Seguimiento ${s.ID_SEGUIMIENTO}`,
  tipo: "Seguimiento",
  estado: s.ID_ESTADO_NUEVO === 3 ? "Aprobado" : s.ID_ESTADO_NUEVO === 2 ? "En revisión" : "Pendiente",
  fecha: s.FECHA_REGISTRO.toISOString().split("T")[0],
  estudiante: "Estudiante",
  tamaño: "2.5 MB",
  formato: "PDF",
}));

export const validationsData = seguimientoTGData.map((s) => {
  const trabajo = trabajoGradoData.find((tg) => tg.ID_TRABAJO_GRADO === s.ID_TRABAJO_GRADO);
  const actor = actoresData.find((a) => a.ID_ACTOR === s.ID_ACTOR);
  const persona = personasData.find((p) => p.ID_PERSONA === actor?.ID_PERSONA);
  const estudianteActor = actoresData.find((a) => a.ID_TRABAJO_GRADO === s.ID_TRABAJO_GRADO && a.ID_TIPO_ROL === 4);
  const estudiante = personasData.find((p) => p.ID_PERSONA === estudianteActor?.ID_PERSONA);

  return {
    id: s.ID_SEGUIMIENTO,
    estudiante: estudiante ? `${estudiante.NOMBRES} ${estudiante.APELLIDOS}` : "Estudiante",
    documento: trabajo?.TITULO_TRABAJO || "Documento",
    validador: persona ? `${persona.NOMBRES} ${persona.APELLIDOS}` : "Validador",
    estado: s.ID_ESTADO_NUEVO === 3 ? "Aprobado" : s.ID_ESTADO_NUEVO === 2 ? "En revisión" : "Rechazado",
    fecha: s.FECHA_REGISTRO.toISOString().split("T")[0],
    observaciones: s.RESUMEN || "Sin observaciones",
  };
});

export const resultsData = seguimientoTGData
  .filter((s) => s.CALIFICACION !== null)
  .map((s) => {
    const trabajo = trabajoGradoData.find((tg) => tg.ID_TRABAJO_GRADO === s.ID_TRABAJO_GRADO);
    const estudianteActor = actoresData.find((a) => a.ID_TRABAJO_GRADO === s.ID_TRABAJO_GRADO && a.ID_TIPO_ROL === 4);
    const estudiante = personasData.find((p) => p.ID_PERSONA === estudianteActor?.ID_PERSONA);

    return {
      id: s.ID_SEGUIMIENTO,
      estudiante: estudiante ? `${estudiante.NOMBRES} ${estudiante.APELLIDOS}` : "Estudiante",
      proyecto: trabajo?.TITULO_TRABAJO || "Proyecto",
      nota: Number(s.CALIFICACION) || 0,
      estado: Number(s.CALIFICACION) >= 3.5 ? "Aprobado" : "Reprobado",
      fecha: s.FECHA_REGISTRO.toISOString().split("T")[0],
      jurado1: "Jurado 1",
      jurado2: "Jurado 2",
    };
  });

export const calendarEvents = [
  {
    id: 1,
    title: "Propuesta de grado - Revisión inicial",
    allDay: false,
    start: new Date(2025, 8, 15, 8, 0),
    end: new Date(2025, 8, 15, 9, 0),
  },
  {
    id: 2,
    title: "Reunión con tutor asignado",
    allDay: false,
    start: new Date(2025, 8, 16, 9, 0),
    end: new Date(2025, 8, 16, 10, 0),
  },
  {
    id: 3,
    title: "Entrega avances parciales",
    allDay: false,
    start: new Date(2025, 8, 15, 10, 0),
    end: new Date(2025, 8, 15, 11, 0),
  },
  {
    id: 4,
    title: "Sesión comité académico",
    allDay: false,
    start: new Date(2025, 8, 17, 11, 0),
    end: new Date(2025, 8, 17, 12, 0),
  },
  {
    id: 5,
    title: "Almuerzo",
    allDay: false,
    start: new Date(2025, 8, 18, 12, 0),
    end: new Date(2025, 8, 18, 13, 0),
  },
  {
    id: 6,
    title: "Taller de redacción académica",
    allDay: false,
    start: new Date(2025, 8, 16, 13, 0),
    end: new Date(2025, 8, 16, 14, 0),
  },
  {
    id: 7,
    title: "Revisión de sustentaciones",
    allDay: false,
    start: new Date(2025, 8, 15, 14, 0),
    end: new Date(2025, 8, 15, 15, 0),
  },
  {
    id: 8,
    title: "Planificación de sustentaciones finales",
    allDay: false,
    start: new Date(2025, 8, 15, 15, 0),
    end: new Date(2025, 8, 15, 16, 0),
  },
  {
    id: 9,
    title: "Reunión de inicio de semana",
    allDay: false,
    start: new Date(2025, 8, 22, 8, 0),
    end: new Date(2025, 8, 22, 9, 0),
  },
  {
    id: 10,
    title: "Sesión de seguimiento con estudiantes",
    allDay: false,
    start: new Date(2025, 8, 22, 10, 0),
    end: new Date(2025, 8, 22, 11, 30),
  },
  {
    id: 11,
    title: "Espacio libre / preparación documentos",
    allDay: false,
    start: new Date(2025, 8, 22, 12, 30),
    end: new Date(2025, 8, 22, 13, 30),
  },
  {
    id: 12,
    title: "Charla motivacional invitados externos",
    allDay: false,
    start: new Date(2025, 8, 22, 15, 0),
    end: new Date(2025, 8, 22, 16, 0),
  },
  {
    id: 13,
    title: "Entrega de documentos administrativos",
    allDay: false,
    start: new Date(2025, 8, 23, 8, 0),
    end: new Date(2025, 8, 23, 9, 0),
  },
  {
    id: 14,
    title: "Revisión de proyectos atrasados",
    allDay: false,
    start: new Date(2025, 8, 23, 11, 0),
    end: new Date(2025, 8, 23, 12, 0),
  },
  {
    id: 15,
    title: "Almuerzo de integración",
    allDay: false,
    start: new Date(2025, 8, 23, 12, 30),
    end: new Date(2025, 8, 23, 13, 30),
  },
  {
    id: 16,
    title: "Sesión práctica de presentación oral",
    allDay: false,
    start: new Date(2025, 8, 23, 15, 0),
    end: new Date(2025, 8, 23, 16, 30),
  },
  {
    id: 17,
    title: "Taller intensivo de metodología",
    allDay: false,
    start: new Date(2025, 8, 24, 9, 0),
    end: new Date(2025, 8, 24, 11, 0),
  },
  {
    id: 18,
    title: "Espacio libre",
    allDay: false,
    start: new Date(2025, 8, 24, 11, 0),
    end: new Date(2025, 8, 24, 12, 0),
  },
  {
    id: 19,
    title: "Reunión de coordinación general",
    allDay: false,
    start: new Date(2025, 8, 24, 14, 0),
    end: new Date(2025, 8, 24, 15, 30),
  },
  {
    id: 20,
    title: "Entrega final de capítulos",
    allDay: false,
    start: new Date(2025, 8, 25, 8, 30),
    end: new Date(2025, 8, 25, 10, 0),
  },
  {
    id: 21,
    title: "Retroalimentación con docentes",
    allDay: false,
    start: new Date(2025, 8, 25, 11, 0),
    end: new Date(2025, 8, 25, 12, 30),
  },
  {
    id: 22,
    title: "Espacio de trabajo independiente",
    allDay: false,
    start: new Date(2025, 8, 25, 14, 0),
    end: new Date(2025, 8, 25, 15, 0),
  },
  {
    id: 23,
    title: "Simulación de sustentación",
    allDay: false,
    start: new Date(2025, 8, 26, 9, 0),
    end: new Date(2025, 8, 26, 11, 0),
  },
  {
    id: 24,
    title: "Almuerzo libre",
    allDay: false,
    start: new Date(2025, 8, 26, 12, 0),
    end: new Date(2025, 8, 26, 13, 0),
  },
  {
    id: 25,
    title: "Cierre de semana - reunión general",
    allDay: false,
    start: new Date(2025, 8, 26, 15, 0),
    end: new Date(2025, 8, 26, 16, 30),
  },
];

export const reportsData = [
  {
    id: 1,
    titulo: "Reporte de proyectos por carrera",
    tipo: "Estadístico",
    fecha: "2025-01-15",
    generadoPor: "Admin",
  },
  {
    id: 2,
    titulo: "Reporte de aprobaciones mensuales",
    tipo: "Análisis",
    fecha: "2025-01-20",
    generadoPor: "Admin",
  },
  {
    id: 3,
    titulo: "Reporte de tiempos de revisión",
    tipo: "Operativo",
    fecha: "2025-01-25",
    generadoPor: "Dean",
  },
];
