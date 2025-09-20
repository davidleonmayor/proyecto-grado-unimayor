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
    photo:
      "https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200",
    telefono: "3157894561",
    rol: "Director de Proyecto",
    carrera: "Ingeniería Multimedia",
  },
  {
    id: 2,
    nombre: "Laura Gómez",
    email: "laura.gomez@unimayor.edu.co",
    photo:
      "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=1200",
    telefono: "3102589634",
    rol: "Tutor",
    carrera: "Tecnología en Desarrollo de Software",
  },
  {
    id: 3,
    nombre: "Andrés Rodríguez",
    email: "andres.rodriguez@unimayor.edu.co",
    photo:
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
    carrera: "Ingeniería Informática",
    opcionGrado: "Trabajo de Aplicación",
    estado: "Aprobado",
  },
  {
    id: 2,
    nombre: "David Castillo",
    email: "david.castillo@unimayor.edu.co",
    carrera: "Tecnología en Desarrollo de Software",
    opcionGrado: "Pasantía",
    estado: "En revisión",
  },
];

export const calendarEvents = [
  {
    title: "Propuesta de grado - Revisión inicial",
    allDay: false,
    start: new Date(2025, 8, 15, 8, 0),
    end: new Date(2025, 8, 15, 9, 0),
  },
  {
    title: "Reunión con tutor asignado",
    allDay: false,
    start: new Date(2025, 8, 16, 9, 0),
    end: new Date(2025, 8, 16, 10, 0),
  },
  {
    title: "Entrega avances parciales",
    allDay: false,
    start: new Date(2025, 8, 15, 10, 0),
    end: new Date(2025, 8, 15, 11, 0),
  },
  {
    title: "Sesión comité académico",
    allDay: false,
    start: new Date(2025, 8, 17, 11, 0),
    end: new Date(2025, 8, 17, 12, 0),
  },
  {
    title: "Almuerzo",
    allDay: false,
    start: new Date(2025, 8, 18, 12, 0),
    end: new Date(2025, 8, 18, 13, 0),
  },
  {
    title: "Taller de redacción académica",
    allDay: false,
    start: new Date(2025, 8, 16, 13, 0),
    end: new Date(2025, 8, 16, 14, 0),
  },
  {
    title: "Revisión de sustentaciones",
    allDay: false,
    start: new Date(2025, 8, 15, 14, 0),
    end: new Date(2025, 8, 15, 15, 0),
  },
  {
    title: "Planificación de sustentaciones finales",
    allDay: false,
    start: new Date(2025, 8, 15, 15, 0),
    end: new Date(2025, 8, 15, 16, 0),
  },
]

