'use client';
import Form from "next/form";
import { useState } from 'react';
import Button from "./button";

export default function RegisterForm() {
  const [form, setForm] = useState({ name: '', lastName: '', email: ''});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos guardados:', form);
  };

  return (
    <Form onSubmit={handleSubmit}>
        <div className="pb-3">
        <label htmlFor="name" className="block text-h4 text-black">
            Nombre
        </label>
        <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-quaternary rounded p-2 focus:outline-none focus:ring focus:border-primary text-tertiary text-h4
          dark:border-base dark:bg-white"
            placeholder="Ingresa tu nombre"
        />
        </div>

        <div className="pb-3">
        <label htmlFor="lastName" className="block text-h4 text-black">
            Apellidos
        </label>
        <input
            type="text"
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="mt-1 block w-full border border-quaternary rounded p-2 focus:outline-none focus:ring focus:border-primary text-tertiary text-h4
          dark:border-base dark:bg-white"
            placeholder="Ingresa tu apellidos"
        />
        </div>

      <div className="pb-3">
        <label htmlFor="email" className="block text-h4 text-black">
          Correo
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="mt-1 block w-full border border-quaternary rounded p-2 focus:outline-none focus:ring focus:border-primary text-tertiary text-h4
          dark:border-base dark:bg-white"
          placeholder="Ingresa tu correo"
        />
      </div>
    
    <Button label={"Solicitar registro"}></Button>
    </Form>
  );
}