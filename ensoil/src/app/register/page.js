import HeaderEnsoil from "@/components/header-ensoil";
import RegisterForm from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="flex flex-col h-full">
      <HeaderEnsoil />
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="border-2 border-tertiary rounded-md h-auto w-80 p-4 dark:border-0 dark:bg-quaternary">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}