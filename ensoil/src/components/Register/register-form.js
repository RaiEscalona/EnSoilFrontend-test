'use client';
const PATH = "http://localhost:3000";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Form from "next/form";
import { useState } from 'react';
import Button from "../button";
import { auth } from "@/firebase";
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', lastName: '', email: '', password: ''});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("a")
    handleRegister(form)
  };

  const handleRegister = async ({name, lastName, email, password}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const token = await userCredential.user.getIdToken();

      const response = await fetch(`${PATH}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, lastName, uid, email })
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data);
      if (data.success) {
        router.push('/login');
      }

    } catch (error) {
      console.error("Error al registrar:", error.message);
    }
};

  return (
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
            className="mt-1 block w-full border border-quaternary rounded p-2 focus:outline-none focus:ring focus:border-primary text-tertiary text-h5
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
            className="mt-1 block w-full border border-quaternary rounded p-2 focus:outline-none focus:ring focus:border-primary text-tertiary text-h5
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
          className="mt-1 block w-full border border-quaternary rounded p-2 focus:outline-none focus:ring focus:border-primary text-tertiary text-h5
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
          className="mt-1 block w-full border border-quaternary rounded p-2 focus:outline-none focus:ring focus:border-primary text-tertiary text-h5
          dark:border-base dark:bg-white"
          placeholder="Ingresa tu contraseña"
        />
      </div>
    
        <Button label={"Solicitar registro"} type="submit" fullWidth={true}></Button>
    </Form>
  );
}