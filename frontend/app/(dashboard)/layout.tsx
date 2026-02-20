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
      <div className="flex">
        <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 lg:justify-start"
          >

            <Image src={Logo} alt="logo" width={32} height={32} />

            <span className="hidden lg:block font-semibold">Gestion Proyectos Grado</span>

          </Link>

          <Menu />
        </div> {/* LEFT SIDE */}
        <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
          <Navbar />
          {children}
        </div> {/* RIGHT SIDE */}
      </div>
    </ProtectedRoute>
  );
}