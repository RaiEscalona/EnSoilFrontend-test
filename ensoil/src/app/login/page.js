import HeaderEnsoil from "@/components/header-ensoil";
import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col h-full">
      <HeaderEnsoil></HeaderEnsoil>
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="border-2 border-tertiary rounded-md h-auto w-100 p-4 dark:border-0 dark:bg-quaternary">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
