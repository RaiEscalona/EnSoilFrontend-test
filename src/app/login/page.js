'use client';

import HeaderEnsoil from "@/components/utils/header-ensoil";
import LoginForm from "@/components/Login/login-form";
import { useState } from "react";
import RegisterForm from "@/components/Register/register-form";
import Alert from "@/components/Alert/Alert";

export default function LoginPage() {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  }

  const handleShowRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  }

  return (
    <div className="flex flex-col h-full">
      <HeaderEnsoil></HeaderEnsoil>
      <div className="flex-1 flex justify-center items-center p-4">
        {showAlert && (
          <Alert message={alertMessage} onClose={() => setShowAlert(false)} />
        )}
        <div className="border-2 border-tertiary rounded-md h-auto w-100 p-4 dark:border-0 dark:bg-quaternary">
          {showLogin && (
            <LoginForm handleShowRegister={handleShowRegister} />
          )}
          {showRegister && (
            <RegisterForm handleShowLogin={handleShowLogin} setShowAlertLogin={setShowAlert} setAlertMessageLogin={setAlertMessage} />
          )}
        </div>
      </div>
    </div>
  );
}
