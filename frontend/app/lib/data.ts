// data.ts

export let role = "admin";

export const careersData = [
  {
    id: 1,
    nombre: "Ingeniería Multimedia",
    codigo: "IM2025",
  },
  {
    id: 2,
    nombre: "Tecnología en Desarrollo de Software",
    codigo: "TDS2025",
  },
  {
    id: 3,
    nombre: "Ingeniería Informática",
    codigo: "II2025",
  },
];

export const teachersData = [
  {
    id: 1,
    nombre: "Carlos Pérez",
    email: "carlos.perez@unimayor.edu.co",
    img:
      "https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200",
    telefono: "3157894561",
    rol: "Director de Proyecto",
    carrera: "Ingeniería Multimedia",
  },
  {
    id: 2,
    nombre: "Laura Gómez",
    email: "laura.gomez@unimayor.edu.co",
    img:
      "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=1200",
    telefono: "3102589634",
    rol: "Tutor",
    carrera: "Tecnología en Desarrollo de Software",
  },
  {
    id: 3,
    nombre: "Andrés Rodríguez",
    email: "andres.rodriguez@unimayor.edu.co",
    img:
      "https://images.pexels.com/photos/428328/pexels-photo-428328.jpeg?auto=compress&cs=tinysrgb&w=1200",
    telefono: "3114569872",
    rol: "Docente",
    carrera: "Ingeniería Informática",
  },
];

export const degreeOptionsData = [
  {
    id: 1,
    nombre: "Proyecto de Investigación",
    descripcion: "Desarrollo de un proyecto de investigación aplicado a la carrera.",
    requisitos: ["Documento de propuesta", "Director asignado", "Avances parciales"],
  },
  {
    id: 2,
    nombre: "Pasantía",
    descripcion: "Trabajo en una empresa aliada con supervisión académica.",
    requisitos: ["Carta de aceptación", "Informe final", "Evaluación del tutor"],
  },
  {
    id: 3,
    nombre: "Trabajo de Aplicación",
    descripcion: "Desarrollo de un software, prototipo o solución tecnológica.",
    requisitos: ["Documento de propuesta", "Producto funcional", "Sustentación"],
  },
];

export const studentsData = [
  {
    id: 1,
    nombre: "María Torres",
    email: "maria.torres@unimayor.edu.co",
    img:
      "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=1200",
    carrera: "Ingeniería Informática",
    opcionGrado: "Trabajo de Aplicación",
    estado: "Aprobado",
  },
  {
    id: 2,
    nombre: "David Castillo",
    email: "david.castillo@unimayor.edu.co",
    img:
      "https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200",
    carrera: "Tecnología en Desarrollo de Software",
    opcionGrado: "Pasantía",
    estado: "En revisión",
  },
];

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

export const proposalsData = [
  {
    id: 1,
    estudiante: "María Torres",
    titulo: "Sistema de gestión de proyectos académicos",
    tipo: "Trabajo de Aplicación",
    estado: "Aprobado",
    fecha: "2025-01-15",
    director: "Carlos Pérez",
    carrera: "Ingeniería Informática",
  },
  {
    id: 2,
    estudiante: "David Castillo",
    titulo: "Plataforma de aprendizaje virtual",
    tipo: "Proyecto de Investigación",
    estado: "En revisión",
    fecha: "2025-01-20",
    director: "Laura Gómez",
    carrera: "Tecnología en Desarrollo de Software",
  },
  {
    id: 3,
    estudiante: "Ana Martínez",
    titulo: "Aplicación móvil para gestión de eventos",
    tipo: "Trabajo de Aplicación",
    estado: "Pendiente",
    fecha: "2025-01-25",
    director: "Andrés Rodríguez",
    carrera: "Ingeniería Multimedia",
  },
  {
    id: 4,
    estudiante: "Juan López",
    titulo: "Análisis de datos en tiempo real",
    tipo: "Proyecto de Investigación",
    estado: "Rechazado",
    fecha: "2025-01-10",
    director: "Carlos Pérez",
    carrera: "Ingeniería Informática",
  },
];

export const documentsData = [
  {
    id: 1,
    nombre: "Propuesta de grado - María Torres",
    tipo: "Propuesta",
    estado: "Aprobado",
    fecha: "2025-01-15",
    estudiante: "María Torres",
    tamaño: "2.5 MB",
    formato: "PDF",
  },
  {
    id: 2,
    nombre: "Avances parciales - David Castillo",
    tipo: "Avance",
    estado: "En revisión",
    fecha: "2025-01-20",
    estudiante: "David Castillo",
    tamaño: "1.8 MB",
    formato: "PDF",
  },
  {
    id: 3,
    nombre: "Informe final - Ana Martínez",
    tipo: "Informe Final",
    estado: "Pendiente",
    fecha: "2025-01-25",
    estudiante: "Ana Martínez",
    tamaño: "3.2 MB",
    formato: "PDF",
  },
  {
    id: 4,
    nombre: "Carta de aceptación - Juan López",
    tipo: "Documento Administrativo",
    estado: "Aprobado",
    fecha: "2025-01-10",
    estudiante: "Juan López",
    tamaño: "0.5 MB",
    formato: "PDF",
  },
];

export const validationsData = [
  {
    id: 1,
    estudiante: "María Torres",
    documento: "Propuesta de grado",
    validador: "Carlos Pérez",
    estado: "Aprobado",
    fecha: "2025-01-15",
    observaciones: "Cumple con todos los requisitos",
  },
  {
    id: 2,
    estudiante: "David Castillo",
    documento: "Avances parciales",
    validador: "Laura Gómez",
    estado: "En revisión",
    fecha: "2025-01-20",
    observaciones: "Requiere ajustes menores",
  },
  {
    id: 3,
    estudiante: "Ana Martínez",
    documento: "Informe final",
    validador: "Andrés Rodríguez",
    estado: "Rechazado",
    fecha: "2025-01-25",
    observaciones: "Faltan referencias bibliográficas",
  },
  {
    id: 4,
    estudiante: "Juan López",
    documento: "Carta de aceptación",
    validador: "Carlos Pérez",
    estado: "Aprobado",
    fecha: "2025-01-10",
    observaciones: "Documento válido",
  },
];

export const resultsData = [
  {
    id: 1,
    estudiante: "María Torres",
    proyecto: "Sistema de gestión de proyectos académicos",
    nota: 4.8,
    estado: "Aprobado",
    fecha: "2025-01-15",
    jurado1: "Carlos Pérez",
    jurado2: "Laura Gómez",
  },
  {
    id: 2,
    estudiante: "David Castillo",
    proyecto: "Plataforma de aprendizaje virtual",
    nota: 4.2,
    estado: "Aprobado",
    fecha: "2025-01-20",
    jurado1: "Andrés Rodríguez",
    jurado2: "Carlos Pérez",
  },
  {
    id: 3,
    estudiante: "Ana Martínez",
    proyecto: "Aplicación móvil para gestión de eventos",
    nota: 3.5,
    estado: "Reprobado",
    fecha: "2025-01-25",
    jurado1: "Laura Gómez",
    jurado2: "Andrés Rodríguez",
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


