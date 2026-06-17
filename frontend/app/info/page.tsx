import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Información del Proyecto | UniMayor",
  description:
    "Aplicación Web Para La Gestión Del Proceso De Proyección Social — Facultad de Ingeniería, Institución Universitaria Colegio Mayor del Cauca.",
};

const students = [
  { name: "Jesus David Leon Chito", role: "Desarrollador de Software" },
  { name: "Gabriela Orozco Vasquez", role: "Desarrollador de Software" },
  { name: "Santiago Torres Morocho", role: "Desarrollador de Software" },
  {
    name: "Juan Sebastían Astudillo Ordoñes",
    role: "Estudiante de T.D.Software",
  },
];

const advisors = [
  { name: "Manuel Arturo Melo Legarda", role: "Docente Asesor" },
  { name: "Gustavo Eduardo Gil Prado", role: "Docente Asesor" },
];

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter((_, i) => i === 0 || i === 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="w-14 h-14 rounded-full bg-[#0ea5e9] flex items-center justify-center flex-shrink-0">
      <span className="text-white font-semibold text-lg">{initials}</span>
    </div>
  );
}

function PersonCard({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100">
      <Avatar name={name} />
      <div>
        <p className="font-semibold text-gray-800 text-sm">{name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{role}</p>
      </div>
    </div>
  );
}

export default function InfoPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#EEF9FD" }}>
      <div className="max-w-2xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 mb-5">
            <Image
              src="/logo.svg"
              alt="Logo UniMayor"
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0ea5e9] mb-3">
            Proyecto de Grado
          </p>
          <h1 className="text-xl font-bold text-gray-900 leading-snug">
            Aplicación Web Para La Gestión Del Proceso De Proyección Social Para
            la Facultad De Ingeniería De La Institución Universitaria Colegio
            Mayor Del Cauca
          </h1>
          <p className="text-sm text-gray-500 mt-3">
            Facultad de Ingeniería · Institución Universitaria Colegio Mayor del
            Cauca
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-10" />

        {/* Students */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Desarrollado por
          </h2>
          <div className="flex flex-col gap-3">
            {students.map((s) => (
              <PersonCard key={s.name} name={s.name} role={s.role} />
            ))}
          </div>
        </section>

        {/* Advisors */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Docentes Asesores
          </h2>
          <div className="flex flex-col gap-3">
            {advisors.map((a) => (
              <PersonCard key={a.name} name={a.name} role={a.role} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-[#0ea5e9] hover:text-[#0284c7] transition-colors"
          >
            ← Volver al inicio de sesión
          </Link>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Institución Universitaria Colegio Mayor
            del Cauca
          </p>
        </div>
      </div>
    </div>
  );
}
