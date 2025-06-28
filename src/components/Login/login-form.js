'use client';

import Form from "next/form";
import { useState } from 'react';
import ButtonComponent from "../utils/button";
import { auth } from "@/firebase";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import Alert from "../Alert/Alert";

export default function LoginForm({ handleShowRegister }) {
  const router = useRouter();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [newPasswordEmail, setNewPasswordEmail] = useState('');
  const [showLogin, setLogin] =useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleChangeLogin = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(loginForm);
  };

  const handleLogin = async ({email, password}) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;
      const token = await user.getIdToken();
      console.log(`🔄 Cargando datos del user ${user}`);

      const body = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const response = await api.get("/users/verify", body);
      console.log('✅ Datos del user cargados:', response.data);
      if (response.data.success) {
        setAlertMessage(`¡Bienvenido ${user.displayName}!, se te está redirigiendo a la página.`)
        setShowAlert(true);
        router.push('/excels');
      } else if (!response.data.success) {
        setAlertMessage('No tienes acceso a la página.')
        setShowAlert(true);
      }
    } catch (error) {
      console.log("Error en login:", error.message);
      setAlertMessage('Error en las credenciales de login.')
      setShowAlert(true);
    }
  };
  
  const handleSubmitNewPasword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, newPasswordEmail);
      setAlertMessage("📩 Revisa tu correo para restablecer la contraseña.");
      setShowAlert(true);
      setLogin(true);
    } catch (error) {
      setAlertMessage('Error en el correo');
      setShowAlert(true);
    }
  }

  return (
    <div>
      {showAlert && (
        <Alert 
          message={alertMessage} 
          onClose={() => setShowAlert(false)}/>
      )}
      {showLogin ? (
        <Form onSubmit={handleSubmit}>
          <div className="pb-3">
            <label htmlFor="email" className="block text-h5 text-black">
              Correo
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={loginForm.email}
              onChange={handleChangeLogin}
              className="mt-1 block w-full border border-quaternary rounded p-2 focus:outline-none focus:ring focus:border-primary text-secondary text-h5
              dark:border-base dark:bg-white"
              placeholder="Ingresa tu correo"
            />
          </div>

          <div className="pb-3">
            <label htmlFor="password" className="block text-h5 text-black">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={loginForm.password}
              onChange={handleChangeLogin}
              className="mt-1 block w-full border border-quaternary rounded p-2 focus:outline-none focus:ring focus:border-primary text-secondary text-h5
              dark:border-base dark:bg-white"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <div className="text-h5 text-black py-2">
            ¿No tienes cuenta en EnSoil?
            <button className="text-primary text-h5 hover:cursor-pointer px-1" type="button" onClick={handleShowRegister}>Solicitar registro</button>
          </div>
          <div className="text-h5 text-black pb-3">
            <button className="text-primary text-h5 hover:cursor-pointer" type="button" onClick={() => setLogin(false)}>¿Olvidaste tu contraseña?</button>
          </div>
          <ButtonComponent label={"Acceder"} type="submit" fullWidth={true}></ButtonComponent>
        </Form>
      ) : (
        <Form onSubmit={handleSubmitNewPasword}>
          <div className="pb-3">
            <label htmlFor="passwordEmail" className="block text-h5 text-black">
              Correo
            </label>
            <input
              type="email"
              id="passwordEmail"
              name="passwordEmail"
              value={newPasswordEmail}
              onChange={(e) => setNewPasswordEmail(e.target.value)}
              className="mt-1 block w-full border border-quaternary rounded p-2 focus:outline-none focus:ring focus:border-primary text-secondary text-h5
              dark:border-base dark:bg-white"
              placeholder="Ingresa tu correo"
            />
          </div>
          <ButtonComponent label={"Enviar correo de recuperación"} type="submit" fullWidth={true} />
          <div className="text-h5 text-center text-black pt-3">
            <button className="text-primary text-h5 hover:cursor-pointer" type="button" onClick={() => setLogin(true)}>Volver al login</button>
          </div>
        </Form>
      )}
    </div>
  );
}