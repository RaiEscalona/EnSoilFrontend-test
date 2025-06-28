import HeaderEnsoil from "@/components/utils/header-ensoil";
import Carousel from "@/components/utils/carousel";
import ButtonComponent from "@/components/utils/button";
import { Button } from "@/ui/button";
import { Dot, FolderPlus, TestTube } from "lucide-react";
import Link from "next/link";

const slides = [
  {
    title: 'Visualizar los proyectos con el mapa',
    description: 
      <div>
        Presionando <FolderPlus className="inline"/> podrás acceder a todos los proyectos
      </div>
  },
  {
    title: 'Revisar puntos de muestreo',
    description:
      <div>
        Puedes crear y exportar puntos de muestreo desde el mapa, al presionar un punto en particular te llevará a su información detallada
      </div>
  },
  {
    title: 'Revisar análisis del terreno',
    description:
      <div>
        Desde cualquier proyecto se puede acceder a sus tablas de análisis, con datos como la profundidad, metales y laboratorio
      </div>
  },
];

export default function Home() {
  return (
    <div>
      <HeaderEnsoil></HeaderEnsoil>
      <div className="flex flex-col justify-center items-center gap-10 h-100 p-5">
        <Carousel slides={slides}></Carousel>
        <ButtonComponent label={"Ingresar a tu cuenta"} route={'/login'} type="link" size={"text-h4"} fullWidth={false}></ButtonComponent>
      </div>
    </div>
  );
}