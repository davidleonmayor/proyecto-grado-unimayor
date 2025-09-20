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
    telefono: "3157894561",
    rol: "Director de Proyecto",
    carrera: "Ingeniería Multimedia",
  },
  {
    id: 2,
    nombre: "Laura Gómez",
    email: "laura.gomez@unimayor.edu.co",
    telefono: "3102589634",
    rol: "Tutor",
    carrera: "Tecnología en Desarrollo de Software",
  },
  {
    id: 3,
    nombre: "Andrés Rodríguez",
    email: "andres.rodriguez@unimayor.edu.co",
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
