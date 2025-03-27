// pages/index.tsx
"use client";
import { useState, useEffect } from "react";
import { addTask, getAllTasks } from "../firebase/lib/task";
import { auth } from "../firebase/config";
import { Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";  // Importando o tipo User do Firebase
import Auth from "../components/Auth"; 

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Timestamp; 
}

const Home = () => {

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]); 
  const [user, setUser] = useState<User | null>(null); // Tipando como User ou null

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const userId = auth.currentUser?.uid; 

    if (!userId) {
      console.error("Erro: Usuário não autenticado.");
      return; 
    }
    try {
      await addTask(title, description, userId);
      setTitle("");
      setDescription(""); 
      fetchTasks(); 
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const allTasks = await getAllTasks();
      setTasks(allTasks || []);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // Atualiza o estado com o usuário autenticado
    });
    return () => unsubscribe(); // Limpa o listener ao desmontar o componente
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Task Manager</h1>
      <Auth />
      
      {/* Só exibe o formulário e as tarefas se o usuário estiver autenticado */}
      {user ? (
        <>
          <form onSubmit={handleAddTask} className="mb-4">
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-2 p-2 rounded"
            />
            <textarea
              placeholder="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mb-2 p-2 rounded"
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-600 transition-all duration-300"
            >
              Adicionar Tarefa
            </button>
          </form>

          <div className="w-full max-w-md space-y-4">
            {tasks.length === 0 ? (
              <p className="text-gray-400">Nenhuma tarefa encontrada.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="p-4 bg-gray-700 rounded">
                  <h3 className="text-xl font-semibold">{task.title}</h3>
                  <p>{task.description}</p>
                  <p className="text-sm text-gray-400">
                    Criado em: {task.createdAt?.toDate()?.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <p className="text-gray-400">Por favor, faça login para adicionar tarefas.</p>
      )}
    </div>
  );
};

export default Home;
