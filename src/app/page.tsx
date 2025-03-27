// pages/index.tsx
"use client";
import { useState, useEffect } from "react";
import { addTask, getAllTasks, deleteTask, updateTask } from "@/firebase/lib/task"; 
import { auth } from "../firebase/config";
import { Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import Auth from "../components/Auth"; 

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Timestamp;
  completed: boolean;
  createdAt: Timestamp;
}

const Home = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);

  const fetchTasks = async (userId: string) => {
    try {
      const allTasks = await getAllTasks();
      const userTasks = allTasks.filter((task) => task.userId === userId);
      setTasks(userTasks);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchTasks(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !dueDate) return;

    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("Erro: Usuário não autenticado.");
      return;
    }

    try {
      const dueDateTimestamp = Timestamp.fromDate(new Date(dueDate));

      if (editTaskId) {
        await updateTask(editTaskId, { title, description, dueDate: dueDateTimestamp });
        setEditTaskId(null);
      } else {
        await addTask(title, description, userId, dueDateTimestamp);
      }

      setTitle("");
      setDescription("");
      setDueDate("");
      fetchTasks(userId);
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
    }
  };

  const handleEditTask = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate.toDate().toISOString().split("T")[0]);
    setEditTaskId(task.id);
  };

  const handleCancelEdit = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setEditTaskId(null);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Task Manager</h1>
      <Auth />

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
            <div className="flex space-x-2">
              <button 
                type="submit" 
                className="w-full p-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition-all duration-300"
              >
                {editTaskId ? "Atualizar Tarefa" : "Adicionar Tarefa"}
              </button>
              {editTaskId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full p-2 bg-gray-500 text-white rounded cursor-pointer hover:bg-gray-600 transition-all duration-300"
                >
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>

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
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleEditTask(task)}
                      className={`px-3 py-1 rounded transition duration-300 cursor-pointer ${
                        editTaskId ? "bg-yellow-500 text-gray-400 cursor-not-allowed" : "bg-yellow-500 text-white hover:bg-yellow-600"
                      }`}
                      disabled={!!editTaskId}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className={`px-3 py-1 rounded transition duration-300 cursor-pointer ${
                        editTaskId ? "bg-red-500 text-gray-400 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                      disabled={!!editTaskId}
                    >
                      Excluir
                    </button>
                  </div>
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
