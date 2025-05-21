'use client';
import Link from "next/link";
import { useState } from 'react';
import { CirclePlus, File, FolderPlus, Sheet } from 'lucide-react';

export default function DropdownIcon() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex flex-col items-center pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="text-black flex flex-col items-center gap-1 hover:text-primary dark:text-white">
        <CirclePlus 
            size={35} 
            strokeWidth={1}/>
      </button>

      {open && (
        <div className="absolute left-full bg-white rounded w-50 p-2">
          <ul>
            <li className="flex items-center gap-2 text-black p-1 rounded hover:bg-secondary hover:text-white w-auto">
                <File
                    size={20} 
                    strokeWidth={1}/>
                <Link href="/">
                    <span className="text-black text-h5 hover:text-white w-auto">Subir archivo</span>
                </Link>
            </li>
            <li className="flex items-center gap-2 text-black p-1  rounded hover:bg-secondary hover:text-white w-auto">
                <FolderPlus
                    size={20} 
                    strokeWidth={1}/>
                <Link href="/">
                    <span className="text-black text-h5 hover:text-white">Subir carpeta</span>
                </Link>
            </li>
            <li className="flex items-center gap-2 text-black p-1  rounded hover:bg-secondary hover:text-white w-auto">
                <Sheet
                    size={20} 
                    strokeWidth={1}/>
                <Link href="/projects">
                    <span className="text-black text-h5 hover:text-white">Crear hoja de excel</span>
                </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}