// firebase/auth.ts
import {  User, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./config";

const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Usuário logado:", user);
    return user;
  } catch (error) {
    console.error("Erro ao fazer login com Google:", error);
    return null;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    console.log("Usuário deslogado");
  } catch (error) {
    console.error("Erro ao deslogar:", error);
  }
};

// Monitorando o estado de autenticação do usuário
const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  onAuthStateChanged(auth, (user) => {
    callback(user); // Atualiza o estado do usuário autenticado
  });
};

export { loginWithGoogle, logout, onAuthStateChangedListener };
