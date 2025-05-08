// components/Sidebar.tsx
import Link from "next/link";
import { Home, ArrowLeftToLine, LogIn, UserPlus, FolderGit2 } from "lucide-react";
import Image from "next/image";

export default function Sidebar() {
  return (
    <div className="h-screen w-[125px] bg-[#383636] flex flex-col justify-between items-center fixed left-0 top-0">
      {/* Logo y nombre */}
      <div className="mt-14 mb-4">
        <div className="w-[73px] h-[68px] bg-[#c7058a] rounded-[36.5px/34px] flex items-center justify-center">
          <span className="font-normal text-[32px] text-[#740b5d]">ES</span>
        </div>
        <div className="mt-2 text-white text-base text-center">ENSOIL</div>
      </div>

      {/* Botones principales */}
      <div className="flex flex-col items-center gap-8 flex-1 justify-center">
        {/* Excels */}
        <Link href="/excels" className="flex flex-col items-center">
          <div className="w-[63px] h-[63px] flex items-center justify-center">
            <Home size={30} strokeWidth={1} className="text-white" />
          </div>
          <span className="text-white text-base mt-1">Excels</span>
        </Link>
        {/* Proyectos */}
        <Link href="/projects" className="flex flex-col items-center">
          <div className="w-[63px] h-[63px] flex items-center justify-center">
            <FolderGit2 size={30} strokeWidth={1} className="text-white" />
          </div>
          <span className="text-white text-base mt-1">Proyectos</span>
        </Link>
        {/* Iniciar Sesión */}
        <Link href="/login" className="flex flex-col items-center">
          <div className="w-[55px] h-[55px] flex items-center justify-center">
            <LogIn size={30} strokeWidth={1} className="text-white" />
          </div>
          <span className="text-white text-base mt-1">Iniciar Sesión</span>
        </Link>
        {/* Registrarse */}
        <Link href="/register" className="flex flex-col items-center">
          <div className="w-[55px] h-[55px] flex items-center justify-center">
            <UserPlus size={30} strokeWidth={1} className="text-white" />
          </div>
          <span className="text-white text-base mt-1">Registrarse</span>
        </Link>
      </div>

      {/* Botón de salida */}
      <div className="mb-4">
        <Link href="/" className="flex flex-col items-center">
          <div className="w-[55px] h-[55px] flex items-center justify-center">
            <ArrowLeftToLine size={30} strokeWidth={1} className="text-white" />
          </div>
        </Link>
      </div>
    </div>
  );
}