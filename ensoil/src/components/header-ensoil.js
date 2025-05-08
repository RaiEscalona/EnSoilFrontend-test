import Image from "next/image";

export default function HeaderEnsoil() {
  return (
    <header className="bg-quaternary h-30 dark:bg-tertiary">
        <div className="flex justify-center items-center h-full p-4">
            <Image
                src="/Logo-EnSoil-Horizontal.png"
                alt="Ensoil logo"
                width={150}
                height={0}
                className="h-auto w-50"
            />
        </div>
    </header>
  );
}