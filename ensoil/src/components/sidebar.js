// components/Sidebar.tsx
import Link from "next/link";
import { Home, CirclePlus, History, ArrowLeftToLine } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-20 h-screen text-white flex flex-col items-center pt-6"
        style={{backgroundColor: "#CECECE"}}>
      <div className="w-12 h-12 rounded-full text-white flex flex-col items-center justify-center"
        style={{backgroundColor: "#367B5D"}}>ES</div>
        <span className="text-sm pt-2" style={{color:"#242424"}}>ENSOIL</span>
      <nav className="flex flex-col gap-6 p-4 items-center flex-grow">
        <Link href="/acerca" className="flex flex-col items-center gap-1 hover:text-gray-600 pt-4">
          <CirclePlus 
            size={40} 
            strokeWidth={1} 
            style={{color:"#367B5D"}} />
        </Link>
        <Link href="/" className="flex flex-col items-center gap-1 hover:text-gray-600 pt-4"> 
          <Home 
            size={30} 
            strokeWidth={1}
            style={{color:"#242424"}} />
          <span className="text-sm" style={{color:"#242424"}}>Inicio</span>
        </Link>
        <Link href="/contacto" className="flex flex-col items-center gap-1 hover:text-gray-600 pt-4">
          <History 
            size={30} 
            strokeWidth={1}
            style={{color:"#242424"}} />
          <span className="text-sm" style={{color:"#242424"}}>Recientes</span>
        </Link>
      </nav>
      <div>
        <Link href="/" className="flex flex-col items-center gap-1 hover:text-gray-600 pb-4">
          <ArrowLeftToLine 
            size={30} 
            strokeWidth={1}
            style={{color:"#242424"}} />
        </Link>
      </div>
    </aside>
  );
}
// cambiar color del hover con config tailwind después