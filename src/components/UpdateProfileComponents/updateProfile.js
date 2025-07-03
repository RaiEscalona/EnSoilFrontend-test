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

export default function UpdateProfile({ handleUpdateProfile, form, setForm }) {
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <ButtonComponent label={'Actualizar datos'} fullWidth={true} />
            </DialogTrigger>
            <DialogContent className='bg-quaternary dark:bg-base'>
                <DialogHeader>
                    <DialogTitle>Actualizar Perfil</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                    <div className="pb-3">
                    <label htmlFor="name" className="block text-h5 text-black dark:text-white">
                        Nombre
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded p-2 focus:outline-none focus:ring focus:border-primary text-secondary text-h5
                        bg-white"
                        placeholder="Ingresa tu nombre"
                    />
                    </div>

                    <div className="pb-3">
                    <label htmlFor="lastName" className="block text-h5 text-black dark:text-white">
                        Apellidos
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded p-2 focus:outline-none focus:ring focus:border-primary text-secondary text-h5
                        bg-white"
                        placeholder="Ingresa tu apellidos"
                    />
                    </div>
                    <DialogFooter className="justify-self-center">
                        <DialogClose asChild>
                            <ButtonComponent label={'Enviar'} onClick={handleUpdateProfile} disable={!form.name || !form.lastName } />
                        </DialogClose>
                    </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}