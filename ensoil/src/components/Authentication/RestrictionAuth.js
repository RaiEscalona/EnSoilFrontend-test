'use client'
import { useContext, createContext, useState, useEffect } from "react";
import { signOut, onAuthStateChanged, getIdToken } from "firebase/auth";
import { auth } from "../../firebase.js";
import { useRouter } from 'next/navigation';
import { AuthContext } from "./AuthContext.js";

const context = createContext();

const RestrictionAuth = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      };

      try {
        const token = await getIdToken(user);
        
        const response = await fetch('http://localhost:3000/authTest/test', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!data.success) {
          console.error("Token inválido");
        }

      } catch (error) {
        console.error('Error en validación del token:', error);
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext>
      {children}
    </AuthContext>
  );
}

export { RestrictionAuth };