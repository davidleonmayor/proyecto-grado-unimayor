/**
 * RoleProtectedRoute Component
 * HOC for protecting routes based on user roles
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenManager } from '@/shared/lib/auth/token-manager';
import { useUserRole, UserRole } from '@/shared/hooks/useUserRole';

export interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador / Coordinador",
  dean: "Decano",
  teacher: "Docente / Profesor",
  student: "Estudiante",
};

export const RoleProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = '/',
}: RoleProtectedRouteProps) => {
  const router = useRouter();
  const { role, loading } = useUserRole();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      if (!TokenManager.isAuthenticated()) {
        router.push('/sign-in');
        return;
      }

      if (role === null && !loading) {
        setIsChecking(false);
        return;
      }

      if (role && !allowedRoles.includes(role)) {
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
    };

    checkAccess();
  }, [role, loading, allowedRoles, redirectTo, router]);

  // Handle manual logout/account switch
  const handleSwitchAccount = () => {
    TokenManager.removeToken();
    router.push('/sign-in');
  };

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 relative overflow-hidden font-sans">
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-secondary-100/30 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-primary-100/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

        <div className="text-center z-10">
          <div className="relative flex justify-center items-center mb-6">
            {/* Elegant Loading Ring */}
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-primary-500 border-b-secondary-500 animate-spin"></div>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 tracking-wide">Validando Credenciales Académicas</h3>
          <p className="text-xs text-gray-400 font-light mt-1">Por favor espera un momento mientras verificamos tu acceso...</p>
        </div>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4 relative overflow-hidden font-sans">
        
        {/* Custom Styles for Keyframes */}
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
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-red-100/30 blur-3xl animate-custom-pulse"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-amber-100/20 blur-3xl animate-custom-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-md w-full text-center z-10 px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_35px_rgba(0,0,0,0.03)] p-8 md:p-10 relative overflow-hidden">
            {/* Top Security Line Indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-red-500" />

            {/* Glowing Shield Lock Graphic (Static as requested) */}
            <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-50/50 border border-red-100/50 scale-110"></div>
              <div className="absolute inset-2 rounded-full bg-red-50 border border-red-200/60 scale-100"></div>
              
              <div className="z-10 text-red-500">
                {/* Shield with lock SVG */}
                <svg className="w-11 h-11 filter drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
            </div>

            {/* Restricted Label */}
            <div className="inline-block px-3 py-1 bg-red-50 border border-red-100 text-red-700 rounded-full text-[10px] font-semibold tracking-wider uppercase mb-4">
              Control de Acceso de Roles
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
            <p className="text-gray-500 text-xs font-light leading-relaxed mb-6">
              Tu rol actual no dispone de las credenciales de autorización necesarias para visualizar esta sección del sistema de grados.
            </p>

            {/* Role Verification Information Grid */}
            <div className="bg-slate-50/80 border border-gray-100/50 rounded-xl p-4 text-left space-y-3 mb-8">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-200/40">
                <span className="text-gray-400 font-light">Tu Rol Actual:</span>
                <span className="font-semibold text-gray-800 bg-gray-200/50 px-2 py-0.5 rounded border border-gray-200 text-[10px]">
                  {role ? (ROLE_LABELS[role] || role) : "Sin identificar"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-gray-400 font-light text-[11px]">Roles Autorizados:</span>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {allowedRoles.filter((r): r is NonNullable<typeof r> => r !== null).map((allowedRole) => (
                    <span key={allowedRole} className="text-[10px] font-semibold text-secondary-700 bg-secondary-50/50 border border-secondary-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {ROLE_LABELS[allowedRole] || allowedRole}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => router.push(redirectTo)}
                className="w-full px-5 py-2.5 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg font-semibold text-xs tracking-wide transition-all shadow-[0_4px_12px_rgba(14,165,233,0.12)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.22)] flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Regresar a la Página Anterior
              </button>
              
              <button
                onClick={handleSwitchAccount}
                className="w-full px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-lg font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Cambiar de Cuenta / Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
