'use client'

import { useState, useEffect } from "react";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { auth } from "../../firebase.js";
import { useRouter } from 'next/navigation';
import { AuthContext } from "./AuthContext.js";
import api from '@/utils/axios';
import Button from "../button.js";

const RestrictionAuth = ({ children }) => {
  const router = useRouter();
  const [isAuth, setAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuth(false);
        router.push('/');
        return;
      };

      try {
        const token = await getIdToken(user);
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const response = await api.get('/authTest/test', { headers });
        console.log('❕ Respuesta del backend:', response.data);
        if (response.data.success) {
          setAuth(true);
        }
      } catch (error) {
        console.error('❌ Error en validación del token:', error);
        setAuth(false);
      } finally {
        setIsLoading(false)
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Button label={'Cargando...'} size={'h4'} loading={true}></Button>
      </div>
    );
  }

  // if (!isAuth) {
  //   router.push('/');
  //   return (
  //     <div className="flex-1 flex justify-center items-center">
  //       <div className="grid grid-rows-2 border-2 border-tertiary rounded-md h-auto w-auto p-4 dark:border-0 dark:bg-quaternary gap-2">
  //         <div className="text-black text-h4">No has ingresado tu cuenta o no estás autorizado</div>
  //         <div className="grid grid-cols-2 justify-items-center gap-2">
  //           <Button label={'Salir'} route={'/'} size={'h4'} fullWidth={true}></Button>
  //           <Button label={'Iniciar sesión'} route={'/login'} size={'h4'} fullWidth={true}></Button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <AuthContext>
      {children}
    </AuthContext>
  );
}

export { RestrictionAuth };