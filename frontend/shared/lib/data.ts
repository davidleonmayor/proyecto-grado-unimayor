// data.ts

export let role = "admin";

export interface CareerData {
    id:number;
    nombre: "Ingeniería Multimedia" | "Tecnología en Desarrollo de Software" | "Ingeniería Informática";
    codigo:string;
}



export const careersData:CareerData[] = [
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

  {
    title: "Reunión de inicio de semana",
    allDay: false,
    start: new Date(2025, 8, 22, 8, 0),
    end: new Date(2025, 8, 22, 9, 0),
  },
  {
    title: "Sesión de seguimiento con estudiantes",
    allDay: false,
    start: new Date(2025, 8, 22, 10, 0),
    end: new Date(2025, 8, 22, 11, 30),
  },
  {
    title: "Espacio libre / preparación documentos",
    allDay: false,
    start: new Date(2025, 8, 22, 12, 30),
    end: new Date(2025, 8, 22, 13, 30),
  },
  {
    title: "Charla motivacional invitados externos",
    allDay: false,
    start: new Date(2025, 8, 22, 15, 0),
    end: new Date(2025, 8, 22, 16, 0),
  },

  {
    title: "Entrega de documentos administrativos",
    allDay: false,
    start: new Date(2025, 8, 23, 8, 0),
    end: new Date(2025, 8, 23, 9, 0),
  },
  {
    title: "Revisión de proyectos atrasados",
    allDay: false,
    start: new Date(2025, 8, 23, 11, 0),
    end: new Date(2025, 8, 23, 12, 0),
  },
  {
    title: "Almuerzo de integración",
    allDay: false,
    start: new Date(2025, 8, 23, 12, 30),
    end: new Date(2025, 8, 23, 13, 30),
  },
  {
    title: "Sesión práctica de presentación oral",
    allDay: false,
    start: new Date(2025, 8, 23, 15, 0),
    end: new Date(2025, 8, 23, 16, 30),
  },

  {
    title: "Taller intensivo de metodología",
    allDay: false,
    start: new Date(2025, 8, 24, 9, 0),
    end: new Date(2025, 8, 24, 11, 0),
  },
  {
    title: "Espacio libre",
    allDay: false,
    start: new Date(2025, 8, 24, 11, 0),
    end: new Date(2025, 8, 24, 12, 0),
  },
  {
    title: "Reunión de coordinación general",
    allDay: false,
    start: new Date(2025, 8, 24, 14, 0),
    end: new Date(2025, 8, 24, 15, 30),
  },

  {
    title: "Entrega final de capítulos",
    allDay: false,
    start: new Date(2025, 8, 25, 8, 30),
    end: new Date(2025, 8, 25, 10, 0),
  },
  {
    title: "Retroalimentación con docentes",
    allDay: false,
    start: new Date(2025, 8, 25, 11, 0),
    end: new Date(2025, 8, 25, 12, 30),
  },
  {
    title: "Espacio de trabajo independiente",
    allDay: false,
    start: new Date(2025, 8, 25, 14, 0),
    end: new Date(2025, 8, 25, 15, 0),
  },

  {
    title: "Simulación de sustentación",
    allDay: false,
    start: new Date(2025, 8, 26, 9, 0),
    end: new Date(2025, 8, 26, 11, 0),
  },
  {
    title: "Almuerzo libre",
    allDay: false,
    start: new Date(2025, 8, 26, 12, 0),
    end: new Date(2025, 8, 26, 13, 0),
  },
  {
    title: "Cierre de semana - reunión general",
    allDay: false,
    start: new Date(2025, 8, 26, 15, 0),
    end: new Date(2025, 8, 26, 16, 30),
  },
];

