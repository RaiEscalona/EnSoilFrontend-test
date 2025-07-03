'use client'

import Link from "next/link";
import { Home, FolderPlus, ArrowLeftToLine, CircleUserRound, ClipboardList, FolderOpen, PlusSquare, Folder } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { UserAuth } from "../Authentication/AuthContext";

export default function Sidebar() {
  const { user, logout } = UserAuth();
  const [displayName, setDisplayName] = useState('');
  const [isIcon, setIcon] = useState(false);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const closeTimeout = useRef();

  useEffect(() => {
    if (user && user.displayName) {
      setDisplayName(user.displayName[0]);
      setIcon(false);
    } else {
      setIcon(true);
    }
  }, [user])

  // Funciones para manejar el hover con timeout
  const handleProjectsEnter = () => {
    clearTimeout(closeTimeout.current);
    setShowProjectsDropdown(true);
  };
  const handleProjectsLeave = () => {
    closeTimeout.current = setTimeout(() => setShowProjectsDropdown(false), 120);
  };

  return (
    <aside className="bg-quaternary w-21 min-h-screen text-white flex flex-col items-center pt-6 dark:bg-base dark:text-black">
      <Link href={'/profile'} className="text-black flex flex-col items-center gap-1 hover:text-primary pt-4 dark:text-white">
        {!isIcon ? (
          <div className="bg-primary w-12 h-12 rounded-full flex flex-col items-center justify-center text-h4 text-black dark:text-white hover:text-white dark:hover:text-black">{displayName}</div>
        ) : (
          <div className="bg-primary w-12 h-12 rounded-full flex flex-col items-center justify-center text-h4 text-black dark:text-white hover:text-white dark:hover:text-black">
            <CircleUserRound
              size={35}
              strokeWidth={1} />
          </div>
        )}
        <span className="text-black text-h5 pt-2 dark:text-white">Perfil</span>
      </Link>
      <nav className="flex flex-col gap-6 p-4 items-center flex-grow">
        <Link href="/excels" className="text-black flex flex-col items-center gap-1 hover:text-primary pt-4 dark:text-white"> 
          <Home 
            size={35} 
            strokeWidth={1}/>
          <span className="text-black text-h5 dark:text-white">Inicio</span>
        </Link>
        <div className="relative" onMouseEnter={handleProjectsEnter} onMouseLeave={handleProjectsLeave}>
          <button
            className="text-black flex flex-col items-center gap-1 pt-4 dark:text-white group focus:outline-none"
            style={{ cursor: 'pointer' }}
          >
            <Folder
              size={35}
              strokeWidth={1}
              className="group-hover:text-primary transition-colors duration-200"
            />
            <span className="text-black text-h5 dark:text-white">Proyectos</span>
          </button>
          {showProjectsDropdown && (
            <div
              className="absolute left-full top-0 ml-3 border rounded-lg border-gray-300 dark:border-black bg-quaternary dark:bg-base shadow-xl flex flex-col z-50 w-[220px] min-w-[180px]"
              onMouseEnter={handleProjectsEnter}
              onMouseLeave={handleProjectsLeave}
            >
              <Link href="/projects" className="flex items-center gap-2 px-4 py-2 text-black dark:text-white rounded-lg hover:text-primary hover:bg-gray-200 dark:hover:bg-neutral-800 cursor-pointer">
                <FolderOpen size={22} className="transition-colors duration-200 group-hover:text-primary" />
                <span>Ver Proyectos</span>
              </Link>
              <Link href="/projects/create" className="flex items-center gap-2 px-4 py-2 text-black dark:text-white rounded-lg hover:text-primary hover:bg-gray-200 dark:hover:bg-neutral-800 cursor-pointer">
                <FolderPlus size={22} className="transition-colors duration-200 group-hover:text-primary" />
                <span>Crear Proyecto Nuevo</span>
              </Link>
            </div>
          )}
        </div>
        <Link href="/metodos-de-analisis" className="text-black flex flex-col items-center gap-1 pt-4 dark:text-white group" style={{ cursor: 'pointer' }}>
          <ClipboardList 
            size={35} 
            strokeWidth={1}
            className="group-hover:text-primary transition-colors duration-200"/>
          <span className="text-black text-h5 dark:text-white">Métodos</span>
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