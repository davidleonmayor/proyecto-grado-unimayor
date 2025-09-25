import Link from "next/link";

export default function SignIn() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-blue-50 to-blue-100 px-4">

      <h1 className="text-center text-5xl font-extrabold text-blue-700 drop-shadow-lg">
        ¡Bienvenido!
      </h1>

      <p className="text-center text-gray-600 max-w-md">
        Accede a tu dashboard para Gestionar tus proyectos.
      </p>

      <Link
        href="/admin"
        className="bg-gradient-to-r from-amber-400 to-amber-600 text-white font-semibold px-8 py-4 rounded-3xl shadow-lg hover:scale-105 transition-transform duration-300"
      >
        Ir al dashboard
      </Link>

    

    </div>
  )
}
