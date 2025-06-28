import Form from "next/form";
import { useEffect, useState } from "react";
import ButtonComponent from "../utils/button";
import api from "@/utils/axios";
import { deleteUser, getIdToken } from "firebase/auth";
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

export default function UserInfoRow({ user, requestedUser, option, setUpdate }) {
    const [deleteUserOption, setDeleteUser] = useState(null);
    const [userRole, setRole] = useState("");
    const [registerAnswer, setAnswer] = useState("");
    const [validSumbit, setValidSubmit] = useState(false);
    
    const handleChangeRequest = (e) => {
        const value = e.target.value;
        if (value === "true") setAnswer(true);
        else if (value === "false") setAnswer(false);
        else setAnswer(null);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        handleRequest()
    };

    const handleRequest = async () => {
        try {
            const token = await getIdToken(user);
            const auth = {
                Authorization: `Bearer ${token}`
            }
            // console.log(token)

            if (option == 'admin') {
                console.log(`🔄 Actualizando permiso del usuario ${requestedUser.email}`);

                const response = await api.delete(`/users/${requestedUser.uid}`, {
                    headers: auth
                })
                
                if (response.data.success) {
                    console.log('✅ Permiso actualizado correctamente:', response.data);
                }
            } else if (option == 'role') {
                if (userRole == 5) {
                    const responseAdmin = await api.post(`/users/create-admin`, { 
                        email: requestedUser.email,
                        password: 'Contras3na_ultr4_s3cr3t4_4dm1n',
                    })

                    if (responseAdmin.data.success) {
                        console.log(responseAdmin.data.message)
                    }
                } else {
                    const response = await api.patch(`/users/${requestedUser.uid}/hierarchy`, 
                        { hierarchy: userRole }, 
                        { headers: auth }
                    )
                    
                    if (response.data.success) {
                        console.log('✅ Rol actualizado correctamente', response.data.success)
                    }
                }
            } else {

                console.log(`🔄 Actualizando permiso del usuario ${requestedUser.email}`);
                if (registerAnswer == true) {
                    const response = await api.patch(`/users/${requestedUser.uid}/permission`,
                        { permission: registerAnswer },
                        { headers: auth }
                    )
                    if (response.data.success) {
                        console.log('✅ Permiso actualizado correctamente:', response.data);
                    }
                } else if (registerAnswer == false) {
                    const response = await api.delete(`/users/${requestedUser.uid}`, {
                        headers: auth
                    })
                    
                    if (response.data.success) {
                        console.log('✅ Permiso actualizado correctamente:', response.data);
                    }
                }
            }

            setUpdate(prev => !prev);
        } catch (error) {
            console.log('Error al enviar la respuesta:', error)
        }
    }

    useEffect(() => {
        if (registerAnswer === false || (registerAnswer === true && userRole)) {
            setValidSubmit(true);
        } else {
            setValidSubmit(false);
        }
    }, [registerAnswer, userRole]);

    return (
        <Form onSubmit={handleSubmit}>
            <div className="grid grid-cols-6 justify-items items-center bg-quaternary dark:bg-base text-h5 text-black dark:text-white rounded-2xl p-3 gap-2">
                <div className="col-start-1">
                    {requestedUser.name} {requestedUser.lastName}
                </div>
                <div className="col-start-2 col-span-2">
                    {requestedUser.email}
                </div>
                {option == 'admin' && (
                    <>
                        <div className="col-start-5 justify-self-center">
                            <input type="checkbox" name="checkbox" className="hover:cursor-pointer" id={requestedUser.uid} onChange={e => setDeleteUser(e.target.checked)}/>
                            <label htmlFor={requestedUser.uid} className="hover:cursor-pointer px-1">Eliminar</label>
                        </div>
                        <div className="col-start-6">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <ButtonComponent label={"Eliminar usuario"} fullWidth={true} disable={!deleteUserOption} isDelete={true} />
                                </DialogTrigger>
                                <DialogContent className="border-2 border-red-500 bg-base text-white">
                                    <DialogHeader>
                                        <DialogTitle className="text-center">¿Seguro que deseas eliminar a {requestedUser.name} {requestedUser.lastName}?</DialogTitle>
                                    </DialogHeader>
                                    <DialogDescription className="text-center">Su cuenta será eliminada de la base de datos para siempre</DialogDescription>
                                    <DialogFooter className="justify-self-center">
                                        <DialogClose asChild>
                                            <ButtonComponent label={'Eliminar'} onClick={handleSubmit} isDelete={true} />
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </>
                )}
                {option == 'role' && (
                    <>
                        <select className="col-start-5 col-span-1 justify-self-center hover:cursor-pointer" 
                            onChange={e => setRole(Number(e.target.value))} 
                            value={userRole}>
                                <option value="">Rol actual {requestedUser.role}</option>
                                <option value={1}>Baja</option>
                                <option value={2}>Media baja</option>
                                <option value={3}>Media alta</option>
                                <option value={4}>Alta</option>
                                <option value={5}>Admin</option>
                        </select>
                        <div className="col-start-6">
                            <ButtonComponent label={"Actualizar rol"} fullWidth={true} type="submit" disable={!userRole} />
                        </div>
                    </>
                )}
                {option == 'access' && (
                    <>
                        <select className="col-start-4 justify-self-center hover:cursor-pointer" 
                            onChange={e => setRole(Number(e.target.value))} 
                            defaultValue={""}>
                                <option value="">Sin seleccionar</option>
                                <option value={1}>Baja</option>
                                <option value={2}>Media baja</option>
                                <option value={3}>Media alta</option>
                                <option value={4}>Alta</option>
                                <option value={5}>Admin</option>
                        </select>
                        <select className="col-start-5 justify-self-center hover:cursor-pointer"
                            onChange={handleChangeRequest}
                            value={registerAnswer ?? ""}>
                                <option value={""}>Solicitud</option>
                                <option value={false}>Rechazar</option>
                                <option value={true}>Aceptar</option>
                        </select>
                        <div className="col-start-6">
                            {registerAnswer === false ? (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <ButtonComponent label={"Rechazar"} fullWidth={true} isDelete/>
                                    </DialogTrigger>
                                    <DialogContent className="border-2 border-red-500 bg-base text-white">
                                        <DialogHeader>
                                            <DialogTitle className="text-center">¿Seguro que deseas rechazar a {requestedUser.name} {requestedUser.lastName}?</DialogTitle>
                                        </DialogHeader>
                                        <DialogDescription className="text-center">Su cuenta será eliminada de la base de datos para siempre</DialogDescription>
                                        <DialogFooter className="justify-self-center">
                                            <DialogClose asChild>
                                                <ButtonComponent label={'Rechazar'} onClick={handleSubmit} isDelete />
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <ButtonComponent label={"Enviar"} fullWidth={true} type="submit" disable={!validSumbit} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </Form>
    );
}