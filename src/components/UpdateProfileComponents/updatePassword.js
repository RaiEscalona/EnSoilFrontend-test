import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import ButtonComponent from "../utils/button";

export default function UpdatePassword({ handleChangePassword, form, setForm }) {

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <ButtonComponent label={'Actualizar contraseña'} fullWidth={true} />
            </DialogTrigger>
            <DialogContent className='bg-quaternary dark:bg-base'>
                <DialogHeader>
                    <DialogTitle>Actualizar Perfil</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                    <div className="pb-3">
                    <label htmlFor="password" className="block text-h5 text-black dark:text-white">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded p-2 focus:outline-none focus:ring focus:border-primary text-secondary text-h5
                        bg-white"
                        placeholder="Ingresa tu contraseña"
                    />
                    </div>
                    <div className="pb-3">
                    <label htmlFor="newPassword" className="block text-h5 text-black dark:text-white">
                        Nueva contraseña
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded p-2 focus:outline-none focus:ring focus:border-primary text-secondary text-h5
                        bg-white"
                        placeholder="Ingresa tu contraseña"
                    />
                    </div>
                    <DialogFooter className="justify-self-center">
                        <DialogClose asChild>
                            <ButtonComponent label={'Enviar'} onClick={handleChangePassword} disable={!form.password || !form.newPassword } />
                        </DialogClose>
                    </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}