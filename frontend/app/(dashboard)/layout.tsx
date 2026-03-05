import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.webp";
import { Menu } from "@/shared/components/layout/Menu";
import { Navbar } from "@/shared/components/layout/Navbar";
import { ProtectedRoute } from "@/shared/components/layout/ProtectedRoute";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full overflow-hidden">
        {/* LEFT SIDE: SIDEBAR */}
        <div className="w-[16%] min-w-[70px] md:w-[8%] lg:w-[16%] xl:w-[14%] p-2 md:p-4 shrink-0 flex flex-col border-r border-gray-100 bg-white z-20">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 lg:justify-start pt-2"
          >
            <div className="shrink-0 p-1.5 md:p-2 rounded-xl">
              <Image src={Logo} alt="logo" width={32} height={32} />
            </div>
            <span className="hidden lg:block font-bold text-gray-800 text-sm xl:text-base leading-tight">Gestor Proyectos<br />Grado</span>
          </Link>
          <Menu />
        </div>

        {/* RIGHT SIDE: MAIN CONTENT */}
        <div className="flex-1 min-w-0 bg-[#F7F8FA] overflow-y-auto overflow-x-hidden flex flex-col relative">
          <Navbar />
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}