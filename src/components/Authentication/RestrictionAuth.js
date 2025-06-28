'use client'

import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { auth } from "../../firebase.js";
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import Alert from "../Alert/Alert.js";
import { AuthContext } from "./AuthContext.js";
import ButtonComponent from "../utils/button.js";

const RestrictionAuth = ({ children }) => {
  const router = useRouter();
  const [isAuth, setAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hadSession = useRef(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuth(false);

        if (hadSession.current) {
          console.log('✅ Se ha cerrado la sesión');
          router.push('/');
        }

        setIsLoading(false);
        return;
      }

      hadSession.current = true;

      try {
        const token = await getIdToken(user);
        // console.log('token: ', token)
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const response = await api.get('/users/verify', { headers });
        console.log('❕ Respuesta del backend:', response.data);
        if (response.data.success) {
          setAuth(true);
        }
      } catch (error) {
        console.log('❌ Error en validación del token:', error);
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
        <div className="loading">Cargando...</div>
      </div>
    );
  } else if (!isAuth && !hadSession.current) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Alert message={'No has iniciado sesión'} onClose={false} />
        <ButtonComponent label={'Iniciar sesión'} route={'/login'} size={'h4'}/>
      </div>
    );
  }

  return (
    <AuthContext>
      {children}
    </AuthContext>
  );
}

export { RestrictionAuth };