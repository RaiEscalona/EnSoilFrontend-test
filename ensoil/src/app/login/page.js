import HeaderEnsoil from "@/components/header-ensoil";
import LoginForm from "@/components/login-form";

export default function Home() {
  return (
    <div>
        <HeaderEnsoil></HeaderEnsoil>
        <div className="flex justify-center items-center h-100 p-4">
            <div className="border-2 border-tertiary rounded-md h-auto w-100 p-4 dark:border-0 dark:bg-quaternary">
                <LoginForm></LoginForm>
            </div>
        </div>
    </div>
  );
}
