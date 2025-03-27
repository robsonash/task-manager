import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { db } from "../config";


export const addTask = async (title, description, userId) => {
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      title,
      description,
      completed: false,
      createdAt: serverTimestamp(),
      userId: userId,
    });
    console.log("Tarefa adicionada com ID: ", docRef.id);
  } catch (e) {
    console.error("Erro ao adicionar tarefa: ", e);
  }
};
export const getAllTasks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return tasks;
  } catch (e) {
    console.error("Erro ao listar todas as tarefas: ", e);
  }
};

export const getTasksByUserId = async (userId) => {
  try {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return tasks;
  } catch (e) {
    console.error("Erro ao buscar tarefas: ", e);
  }
};