// components/Sidebar.tsx
import Link from "next/link";
import { Home, CirclePlus, History, ArrowLeftToLine } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="bg-quaternary w-21 h-screen text-white flex flex-col items-center pt-6">
      <div className="bg-primary text-white w-12 h-12 rounded-full text-white flex flex-col items-center justify-center text-h3-medium"
        >ES</div>
        <span className="text-black text-h4 pt-2">ENSOIL</span>
      <nav className="flex flex-col gap-6 p-4 items-center flex-grow">
        <Link href="/acerca" className="text-primary flex flex-col items-center gap-1 hover:text-black pt-4">
          <CirclePlus 
            size={40} 
            strokeWidth={1} />
        </Link>
        <Link href="/" className="text-black flex flex-col items-center gap-1 hover:text-primary pt-4"> 
          <Home 
            size={30} 
            strokeWidth={1}/>
          <span className="text-black text-h4">Inicio</span>
        </Link>
        <Link href="/contacto" className="text-black flex flex-col items-center gap-1 hover:text-primary pt-4">
          <History 
            size={30} 
            strokeWidth={1}/>
          <span className="text-black text-h4">Recientes</span>
        </Link>
      </nav>
      <div>
        <Link href="/" className="text-black flex flex-col items-center gap-1 hover:text-primary pb-4">
          <ArrowLeftToLine 
            size={30} 
            strokeWidth={1}/>
        </Link>
      </div>
    </aside>
  );
}