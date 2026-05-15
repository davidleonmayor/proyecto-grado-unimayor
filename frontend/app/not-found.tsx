'use client';

import { useState } from "react";
import Link from "next/link";
import { useUserRole } from "@/shared/hooks/useUserRole";

interface NavLink {
  href: string;
  label: string;
  category: "grado" | "social" | "general" | "paneles";
  description: string;
}

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Inicio", category: "general", description: "Página de inicio y bienvenida" },
  { href: "/projects", label: "Proyectos de Grado", category: "grado", description: "Búsqueda y gestión de trabajos de grado" },
  { href: "/student", label: "Panel de Estudiante", category: "paneles", description: "Control y seguimiento para estudiantes" },
  { href: "/teacher", label: "Panel de Profesor", category: "paneles", description: "Evaluación y asignaciones para docentes" },
  { href: "/dean", label: "Panel de Decano", category: "paneles", description: "Control y seguimiento para el decano de la facultad" },
  { href: "/admin", label: "Panel de Administración", category: "paneles", description: "Administración global del sistema" },
  { href: "/list/students", label: "Directorio Estudiantes", category: "general", description: "Listado general de estudiantes" },
  { href: "/list/teachers", label: "Directorio Profesores", category: "general", description: "Listado general de docentes de la facultad" },
  { href: "/list/events", label: "Calendario de Eventos", category: "general", description: "Próximas fechas y sustentaciones" },
  {
    href: "/social-outreach/dashboard",
    label: "Métricas Proyección Social",
    category: "social",
    description: "Estadísticas y terminaciones de proyección social",
  },
  {
    href: "/social-outreach/social-projects",
    label: "Proyectos Proyección Social",
    category: "social",
    description: "Listado de proyectos sociales registrados",
  },
];

export default function NotFound() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { role, loading } = useUserRole();

  const filteredLinks = NAV_LINKS.filter((link) => {
    // Search filter
    const matchesSearch =
      link.label.toLowerCase().includes(search.toLowerCase()) ||
      link.description.toLowerCase().includes(search.toLowerCase());
    
    // Category filter
    const matchesCategory = activeCategory === "all" || link.category === activeCategory;

    if (!matchesSearch || !matchesCategory) return false;

    // Security filter: For role panels, only show the one matching the current logged-in role
    if (link.category === "paneles") {
      if (loading || !role) return false; // Hide panels while loading or if guest
      if (link.href === "/student" && role !== "student") return false;
      if (link.href === "/teacher" && role !== "teacher") return false;
      if (link.href === "/dean" && role !== "dean") return false;
      if (link.href === "/admin" && role !== "admin") return false;
    }

    // Security filter: For Proyección Social links, only show for teacher or admin
    if (link.category === "social") {
      if (loading || (role !== "teacher" && role !== "admin")) return false;
    }

    return true;
  });

  // Render Category SVG Icon instead of emoji
  const renderCategoryIcon = (category: "grado" | "social" | "general" | "paneles") => {
    switch (category) {
      case "grado":
        return (
          <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      case "social":
        return (
          <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.005 9.005 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.11 1.157-4.418" />
          </svg>
        );
      case "paneles":
        return (
          <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-13.5 18v-2.25z" />
          </svg>
        );
      case "general":
      default:
        return (
          <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Custom Styles for Keyframe Animations */}
      <style jsx global>{`
        @keyframes custom-pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        .animate-custom-pulse {
          animation: custom-pulse-slow 8s ease-in-out infinite;
        }
      `}</style>

      {/* Decorative Animated Blurred Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-secondary-100/40 blur-3xl animate-custom-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-100/30 blur-3xl animate-custom-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-4xl w-full z-10 flex flex-col items-center">
        
        {/* Animated 404 Header without floating icons */}
        <div className="relative mb-6 flex justify-center w-full max-w-sm">
          {/* Giant 404 with Shadow Accent */}
          <div className="text-[120px] md:text-[140px] font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-700/80 drop-shadow-sm select-none">
            404
          </div>
        </div>

        {/* Brand Label */}
        <div className="mb-3 px-3 py-1 bg-secondary-50 border border-secondary-100 text-secondary-700 rounded-full text-xs font-semibold tracking-wider uppercase">
          Portal de Grados UNIMAYOR
        </div>

        {/* Message and Context */}
        <div className="text-center mb-10 max-w-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 tracking-tight">
            Página No Encontrada
          </h2>
          <p className="text-gray-500 font-light leading-relaxed">
            Parece que te has desviado del camino académico. La página que buscas no existe, ha cambiado de lugar o se encuentra restringida.
          </p>
        </div>

        {/* Search & Navigation Box */}
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-6 md:p-8 mb-8 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Mapa de Navegación</h3>
              <p className="text-xs text-gray-400 font-light mt-0.5">Encuentra la sección que necesitas ingresando palabras clave.</p>
            </div>
            
            {/* Elegant Search Input */}
            <div className="relative max-w-xs w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar sección..."
                className="w-full pl-9 pr-4 py-2 border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 focus:bg-white focus:border-secondary-400 rounded-lg text-xs outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Categories Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: "all", label: "Todos los Enlaces", count: NAV_LINKS.length },
              { id: "paneles", label: "Paneles de Rol", count: NAV_LINKS.filter(l => l.category === 'paneles').length },
              { id: "grado", label: "Proyectos de Grado", count: NAV_LINKS.filter(l => l.category === 'grado').length },
              { id: "social", label: "Proyección Social", count: NAV_LINKS.filter(l => l.category === 'social').length },
              { id: "general", label: "General", count: NAV_LINKS.filter(l => l.category === 'general').length },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  activeCategory === cat.id
                    ? "bg-secondary-500 border-secondary-500 text-white shadow-sm"
                    : "bg-white border-gray-100 text-gray-500 hover:text-gray-700 hover:border-gray-200"
                }`}
              >
                {cat.label} <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === cat.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}>{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Links Grid */}
          {filteredLinks.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs font-light bg-gray-50/30 rounded-xl border border-dashed border-gray-100">
              No se encontraron enlaces para la búsqueda "{search}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group bg-gray-50/20 border border-gray-100 hover:border-primary-100 hover:bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition-all duration-300 flex items-start gap-3.5"
                >
                  <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.01)] group-hover:bg-primary-50 transition-colors">
                    {renderCategoryIcon(link.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-gray-700 group-hover:text-primary-600 transition-colors truncate">
                      {link.label}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-light mt-0.5 line-clamp-2 leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Global Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg font-semibold text-xs tracking-wide transition-all shadow-[0_4px_12px_rgba(14,165,233,0.15)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.25)] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Volver al Portal Principal
          </Link>
        </div>
      </div>
    </div>
  );
}
