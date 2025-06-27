'use client'
import { useContext, createContext, useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase.js";
import { useRouter } from 'next/navigation';

const context = createContext();

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);

  const logout = () => {
    signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <context.Provider value={{ user, logout }}>
      {children}
    </context.Provider>
  );
}

const UserAuth = () => {
  return useContext(context);
};

export { AuthContext, UserAuth };