'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import moreImage from "@/public/more.png";

export default function UserCard({ type, value = 0, href, bgColor }: { type: string, value?: number, href?: string, bgColor?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CO').format(num);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`rounded-2xl ${bgColor || "odd:bg-secondary even:bg-principal"} p-4 flex-1`}>
      <div className="flex justify-between items-center relative">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">2024/25</span>

        {href ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="hover:opacity-75 transition-opacity cursor-pointer border-none bg-transparent flex items-center justify-center p-1 rounded-full hover:bg-black/5"
            >
              <Image src={moreImage} alt="more image" width={20} height={20} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-xl py-2 z-20 border border-gray-100 overflow-hidden">
                <Link
                  href={href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-principal transition-colors w-full text-left"
                  onClick={() => setMenuOpen(false)}
                >
                  Ver listado
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Image src={moreImage} alt="more image" width={20} height={20} />
        )}

      </div>
      <h1 className="text-2xl font-semibold my-4">{formatNumber(value)}</h1>
      <h2 className="capitalize text-sm font-semibold text-gray-800">{type}</h2>
    </div>
  );
}
