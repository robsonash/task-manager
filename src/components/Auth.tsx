import { useState, useEffect } from "react";
import { loginWithGoogle, logout, onAuthStateChangedListener } from "../firebase/auth"; // Importando as funções de auth
import { User } from "firebase/auth"; // Importando o tipo User do Firebase

const Auth = () => {
  const [user, setUser] = useState<User | null>(null); // Tipando o estado como User ou null

  // Monitorando o estado de autenticação do usuário
  useEffect(() => {
    onAuthStateChangedListener((user) => {
      setUser(user); // Atualiza o estado quando o usuário faz login ou logout
    });
  }, []);

  const handleLogin = async () => {
    const user = await loginWithGoogle();
    if (user) {
      setUser(user); // Atualiza o estado com o usuário autenticado
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null); // Limpa o estado do usuário após o logout
  };

  return (
    <div  className="text-center">
    {!user ? (
  <button
  onClick={handleLogin}
  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 cursor-pointer"
>
  Login com Google
</button>
    ) : (
      <>
     <button
  onClick={handleLogout}
  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 cursor-pointer"
>
  Logout
</button>
        <p className="text-white mt-4">Usuário logado: {user.displayName}</p>
      </>
    )}
  </div>
  );
};

export default Auth;
