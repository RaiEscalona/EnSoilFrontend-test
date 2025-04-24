// components/Sidebar.tsx
import Link from "next/link";
import { Home, MapPin, History } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-25 h-screen text-white flex flex-col items-center pt-6"
        style={{backgroundColor: "#393737"}}>
      <div className="w-10 h-10 rounded-full text-white flex flex-col items-center justify-center"
        style={{backgroundColor: "#367B5D"}}>ES</div>
        <span className="text-sm pt-2">ENSOIL</span>
      <nav className="flex flex-col gap-6 p-4 items-center">
        <Link href="/" className="flex flex-col items-center gap-1 hover:text-gray-600 pt-6"> 
          <Home size={30} />
          <span className="text-sm">Inicio</span>
        </Link>
        <Link href="/acerca" className="flex flex-col items-center gap-1 hover:text-gray-600 pt-4">
          <MapPin size={30} />
          <span className="text-sm">Mapa</span>
        </Link>
        <Link href="/contacto" className="flex flex-col items-center gap-1 hover:text-gray-600 pt-4">
          <History size={30} />
          <span className="text-sm">Recientes</span>
        </Link>
      </nav>
    </aside>
  );
}
// cambiar color del hover con config tailwind después