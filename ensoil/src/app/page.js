import HeaderEnsoil from "@/components/header-ensoil";
import Carousel from "@/components/carousel";
import Button from "@/components/button";

const slides = [
  {
    image: null,
    title: 'Ingresar a tu cuenta',
    description: '',
  },
  {
    image: null,
    title: 'Crear una plantilla tipo excel',
    description: '',
  },
  {
    image: null,
    title: 'Visualizar un mapa',
    description: '',
  },
];

export default function Home() {
  return (
    <div>
      <HeaderEnsoil></HeaderEnsoil>
      <div className="flex flex-col justify-center items-center gap-10 h-100 p-5">
        <Carousel slides={slides}></Carousel>
        <Button label={"Ingresar a tu cuenta"} route={'/login'} type="link" size={"text-h4"} fullWidth={false}></Button>
      </div>
    </div>
  );
}