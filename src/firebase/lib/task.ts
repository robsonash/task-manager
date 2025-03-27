import { collection, addDoc, Timestamp, getDocs, query, where, QuerySnapshot, DocumentData,doc,updateDoc, deleteDoc  } from "firebase/firestore";
import { db } from "../config";

// Tipando a tarefa
interface Task {
  id: string; // O id é obrigatório no tipo Task
  title: string;
  description: string;
  completed: boolean;
  createdAt: Timestamp;
  dueDate: Timestamp;
  userId: string;
}

export const addTask = async (
  title: string,
  description: string,
  userId: string,
  dueDate: Timestamp
): Promise<string> => {
  try {
    const tasksRef = collection(db, "tasks");
    const newTask = {
      title,
      description,
      completed: false,
      createdAt: Timestamp.now(),
      dueDate,
      userId,
    };

    const docRef = await addDoc(tasksRef, newTask); // O Firebase cria o ID automaticamente
    return docRef.id; // Retorna o ID da tarefa adicionada
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error);
    throw new Error("Não foi possível adicionar a tarefa");
  }
};

// Tipando a função de pegar todas as tarefas
export const getAllTasks = async (): Promise<Task[]> => {
  try {
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, "tasks"));
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() } as Task); // Aqui estamos adicionando o id
    });
    return tasks;
  } catch (e) {
    console.error("Erro ao listar todas as tarefas: ", e);
    return [];
  }
};

// Tipando a função de pegar tarefas por ID de usuário
export const getTasksByUserId = async (userId: string): Promise<Task[]> => {
  try {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() } as Task); // Aqui estamos adicionando o id
    });
    return tasks;
  } catch (e) {
    console.error("Erro ao buscar tarefas: ", e);
    return [];
  }
};

export const updateTask = async (taskId: string, updatedData: Partial<Task>) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, updatedData);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    throw new Error("Não foi possível atualizar a tarefa");
  }
};

export const deleteTask = async (taskId: string) => {
  await deleteDoc(doc(db, "tasks", taskId));
};