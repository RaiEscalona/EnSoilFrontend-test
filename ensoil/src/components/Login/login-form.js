'use client';
const PATH = "http://localhost:3000";
import Link from "next/link";
import Form from "next/form";
import { useState } from 'react';
import Button from "../button";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(form)
  };

  const handleLogin = async ({email, password}) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;
      const token = await user.getIdToken();
      console.log("token:", token);

      const response = await fetch(`${PATH}/users/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data);
      if (data.success) {
        router.push('/excels');
      }


    } catch (error) {
      console.error("Error en login:", error.message);
    }
};

  return (
    <Form onSubmit={handleSubmit}>
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

      <div className="text-h5 text-black py-2">
        ¿No tienes cuenta en EnSoil?
        <Link href="/register" className="text-primary text-h5">
            <span> Solicitar registro</span>
        </Link>
      </div>
      <Button label={"Acceder"} type="submit" fullWidth={true}></Button>
    </Form>
  );
}