import { useState, useEffect } from "react";
import { loginWithGoogle, logout, onAuthStateChangedListener } from "../firebase/auth";
import { User } from "firebase/auth"; 

const Auth = () => {
  const [user, setUser] = useState<User | null>(null); 

  useEffect(() => {
    onAuthStateChangedListener((user) => {
      setUser(user);
    });
  }, []);

  const handleLogin = async () => {
    const user = await loginWithGoogle();
    if (user) {
      setUser(user);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
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
