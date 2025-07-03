'use client';

import { createUserWithEmailAndPassword, deleteUser, updateProfile } from "firebase/auth";
import Form from "next/form";
import { useState } from 'react';
import ButtonComponent from "../utils/button";
import { auth } from "@/firebase";
import api from '@/utils/axios';
import Alert from "../Alert/Alert";

export default function RegisterForm({ handleShowLogin, setShowAlertLogin, setAlertMessageLogin }) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [form, setForm] = useState({ name: '', lastName: '', email: '', password: ''});

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_-]/.test(password);
    
    if (password.length < minLength) {
      return 'La contraseña debe tener al menos 8 caracteres';
    } if (!hasUpper) {
      return 'Debe contener al menos una letra mayúscula';
    } if (!hasNumber) {
      return 'Debe contener al menos un número';
    } if (!hasSpecial) {
      return 'Debe contener al menos un carácter especial';
    }

    return null;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validatePassword(form.password);
    if (error) {
      setAlertMessage(error);
      setShowAlert(true);
      return;
    }
    handleRegister(form)
  };

  const handleRegister = async ({name, lastName, email, password}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      // const token = await userCredential.user.getIdToken();

      await updateProfile(auth.currentUser, {
        displayName: `${name} ${lastName}`,
      });

      console.log(`🔄 Creando al usuario ${email}`);
      const response = await api.post('/users', {
        name: name,
        lastName: lastName,
        uid: uid,
        email: email
      });

      console.log('✅ Datos del user cargados:', response.data);
      if (response.data.success) {
        // router.push('/login');
        setAlertMessageLogin('Solicitud enviada con éxito');
        setShowAlertLogin(true);
        handleShowLogin();
      }

    } catch (error) {
      console.log('Error al crear un usuario:', error.message)
      setAlertMessage('Usuario ya existente, utilice otro correo');
      setShowAlert(true);
      if (auth.currentUser) {
        try {
          await deleteUser(auth.currentUser);
          console.log('🗑️ Usuario eliminado por error en el registro');
        } catch (deleteErr) {
          console.log('❌ Error al eliminar usuario:', deleteErr);
        }
      }
    }
};

  return (
    <div>
      {showAlert && (
        <Alert 
          message={alertMessage} 
          onClose={() => setShowAlert(false)} 
        />
      )}
      <Form onSubmit={handleSubmit}>
          <div className="pb-3">
          <label htmlFor="name" className="block text-h5 text-black">
              Nombre
          </label>
          <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-quaternary rounded p-2 focus:outline-none focus:ring focus:border-primary text-secondary text-h5
            dark:border-base dark:bg-white"
              placeholder="Ingresa tu nombre"
          />
          </div>

          <div className="pb-3">
          <label htmlFor="lastName" className="block text-h5 text-black">
              Apellidos
          </label>
          <input
              type="text"
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="mt-1 block w-full border border-quaternary rounded p-2 focus:outline-none focus:ring focus:border-primary text-secondary text-h5
            dark:border-base dark:bg-white"
              placeholder="Ingresa tu apellidos"
          />
          </div>

        <div className="pb-3">
          <label htmlFor="email" className="block text-h5 text-black">
            Correo
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
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
            value={form.password}
            onChange={handleChange}
            className="mt-1 block w-full border border-quaternary rounded p-2 focus:outline-none focus:ring focus:border-primary text-secondary text-h5
            dark:border-base dark:bg-white"
            placeholder="Ingresa tu contraseña"
          />
        </div>
      
          <ButtonComponent label={"Solicitar registro"} type="submit" fullWidth={true} />
          <div className="text-h5 text-center text-black pt-3">
            <button className="text-primary text-h5 hover:cursor-pointer" type="button" onClick={handleShowLogin}>Volver al login</button>
          </div>
      </Form>
    </div>

  );
}