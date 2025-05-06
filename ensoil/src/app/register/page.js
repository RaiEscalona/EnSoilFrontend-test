import HeaderEnsoil from "@/components/header-ensoil";
import RegisterForm from "@/components/register-form";

export default function Home() {
  return (
    <div>
        <HeaderEnsoil></HeaderEnsoil>
        <div className="flex justify-center items-center h-100 p-4">
            <div className="border-2 border-tertiary rounded-md h-auto w-80 p-3">
                <RegisterForm></RegisterForm>
            </div>
        </div>
    </div>
  );
}