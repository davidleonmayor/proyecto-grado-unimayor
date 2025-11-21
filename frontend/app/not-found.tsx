import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.webp";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-8">
          <Image src={Logo} alt="logo" width={64} height={64} />
        </div>
        <h1 className="text-9xl font-bold text-principal mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-principal hover:bg-principalDark text-gray-800 font-semibold px-6 py-3 rounded-lg transition-all duration-300"
          >
            Volver al inicio
          </Link>
          <Link
            href="/list/students"
            className="bg-secondary hover:bg-hoverColor text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300"
          >
            Ver estudiantes
          </Link>
        </div>
      </div>
    </div>
  );
}

