// pages/index.tsx
"use client";
import { useState, useEffect } from "react";
import { addTask, getAllTasks } from "@/firebase/lib/task";
import { auth } from "../firebase/config";
import { Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import Auth from "../components/Auth"; 

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Timestamp; // Adicionando o campo de dueDate
  completed: boolean;
  createdAt: Timestamp; 
}

const Home = () => {

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>(""); // Novo estado para a data de vencimento
  const [tasks, setTasks] = useState<Task[]>([]); 
  const [user, setUser] = useState<User | null>(null); // Tipando como User ou null

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !dueDate) return;

    const userId = auth.currentUser?.uid; 

    if (!userId) {
      console.error("Erro: Usuário não autenticado.");
      return; 
    }

    try {
      // Convertendo o valor de dueDate para Timestamp
      const dueDateTimestamp = Timestamp.fromDate(new Date(dueDate));
      await addTask(title, description, userId, dueDateTimestamp); // Passando a data de vencimento para a função de adicionar
      setTitle("");
      setDescription(""); 
      setDueDate(""); // Resetando a data de vencimento
      fetchTasks(userId); 
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }
  };

  const fetchTasks = async (userId: string) => {
    try {
      const allTasks = await getAllTasks();
      const userTasks = allTasks.filter((task) => task.userId === userId); // Filtrando tarefas do usuário
      setTasks(userTasks);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // Atualiza o estado com o usuário autenticado
      if (user) {
        fetchTasks(user.uid); // Carrega as tarefas do usuário logado
      }
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
          <form onSubmit={handleAddTask} className="mb-4 w-full max-w-md space-y-4">
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            <textarea
              placeholder="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            <button 
              type="submit" 
              className="w-full p-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition-all duration-300"
            >
              Adicionar Tarefa
            </button>
          </form>

          {/* Exibe a lista de tarefas ou uma mensagem de "sem tarefas" */}
          <div className="w-full max-w-md space-y-4">
            {tasks.length === 0 ? (
              <p className="text-center text-gray-400">Você ainda não tem tarefas.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="p-4 bg-gray-700 rounded">
                  <h3 className="text-xl font-semibold">{task.title}</h3>
                  <p>{task.description}</p>
                  <p className="text-sm text-gray-400">
                    Criado em: {task.createdAt?.toDate()?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    Data de Vencimento: {task.dueDate?.toDate()?.toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <p className="text-center text-gray-400">Por favor, faça login para adicionar tarefas.</p>
      )}
    </div>
  );
};

export default Home;
