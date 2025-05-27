'use client'

import Link from "next/link";
import { Home, FolderPlus, ArrowLeftToLine } from "lucide-react";
import { UserAuth } from "./Authentication/AuthContext";

export default function Sidebar() {
  const { logout } = UserAuth();

  return (
    <aside className="bg-quaternary w-21 min-h-screen text-white flex flex-col items-center pt-6 dark:bg-base dark:text-black">
      <div className="bg-primary text-white w-12 h-12 rounded-full text-white flex flex-col items-center justify-center text-h4"
        >ES</div>
        <span className="text-black text-h5 pt-2 dark:text-white">ENSOIL</span>
      <nav className="flex flex-col gap-6 p-4 items-center flex-grow">
        <Link href="/excels" className="text-black flex flex-col items-center gap-1 hover:text-primary pt-4 dark:text-white"> 
          <Home 
            size={35} 
            strokeWidth={1}/>
          <span className="text-black text-h5 dark:text-white">Inicio</span>
        </Link>
        <Link href="/projects" className="text-black flex flex-col items-center gap-1 hover:text-primary pt-4 dark:text-white">
          <FolderPlus 
            size={35} 
            strokeWidth={1}/>
          <span className="text-black text-h5 dark:text-white">Proyectos</span>
        </Link>
      </nav>
      <div>
        <button onClick={logout} className="text-black flex flex-col items-center gap-1 hover:text-primary pb-4 dark:text-white">
          <ArrowLeftToLine 
            size={35} 
            strokeWidth={1}/>
        </button>
      </div>
    </aside>
  );
}