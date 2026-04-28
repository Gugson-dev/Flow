import { createContext, useState, type ReactNode, useEffect } from 'react';
import type { Task, Project } from '../types';
import { tasksApi } from "../../api/api";

export interface DataContextType {
  tasks: Task[];
  projects: Project[];
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  importData: (data: { tasks?: Task[]; projects?: Project[] }) => void;
  exportData: () => { tasks: Task[]; projects: Project[] };
  loading: boolean;
  error: string | null;
}

export const DataContext = createContext<DataContextType>({} as DataContextType);

const STORAGE_KEYS = {
  PROJECTS: 'app-projects',
};

export function DataProvider({ children }: { children: ReactNode }) {
  // 🔥 TASKS Z API
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔵 PROJECTS LOCAL (tymczasowo)
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((project: Partial<Project>) => ({
        ...project,
        theme: project.theme || 'dark',
        customColor: project.customColor,
        parentId: project.parentId ?? null,
        sharedWith: project.sharedWith || [],
      }));
    }
    return [
      { id: 'inbox', name: 'Inbox', color: '#6366f1', theme: 'dark', parentId: null, sharedWith: [] },
      { id: 'personal', name: 'Personal', color: '#ec4899', theme: 'dark', parentId: null, sharedWith: [] },
      { id: 'work', name: 'Work', color: '#14b8a6', theme: 'dark', parentId: null, sharedWith: [] },
    ];
  });

  // =========================
  // 🔥 LOAD TASKS
  // =========================

  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);

      const data = await tasksApi.getAll();
      setTasks(data);
    } catch (err: unknown) {
      console.error("loadTasks error:", err);
      setError("Nie udało się pobrać tasków");
    } finally {
      setLoading(false);
    }
  }

useEffect(() => {
  let mounted = true;

  const init = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getAll();

      if (mounted) {
        setTasks(data);
      }
    } catch (err) {
      if (mounted) {
        setError("Błąd" + (err instanceof Error ? err.message : "Nieznany błąd"));
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  init();

  return () => {
    mounted = false;
  };
}, []);

useEffect(() => {
  const init = async () => {
    await loadTasks();
  };
  init();
}, []);


  // =========================
  // ➕ ADD TASK
  // =========================
  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      setError(null);

      const newTask = await tasksApi.create(task);
      setTasks(prev => [...prev, newTask]);
    } catch (err: unknown) {
      console.error("addTask error:", err);
      setError("Błąd dodawania taska");
    }
  };

  // =========================
  // ✏️ UPDATE TASK
  // =========================
  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      setError(null);

      const updated = await tasksApi.update(id, updates);

      setTasks(prev =>
        prev.map(task => task.id === id ? updated : task)
      );
    } catch (err: unknown) {
      console.error("updateTask error:", err);
      setError("Błąd aktualizacji taska");
    }
  };

  // =========================
  // ❌ DELETE TASK
  // =========================
  const deleteTask = async (id: string) => {
    try {
      setError(null);

      await tasksApi.delete(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err: unknown) {
      console.error("deleteTask error:", err);
      setError("Błąd usuwania taska");
    }
  };

  // =========================
  // 🔵 PROJECTS LOCAL
  // =========================
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id ? { ...project, ...updates } : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    setTasks(prev => prev.filter(task => task.projectId !== id));
  };

  // =========================
  // 📦 IMPORT / EXPORT
  // =========================
  const importData = (data: { tasks?: Task[]; projects?: Project[] }) => {
    if (data.tasks) setTasks(data.tasks);
    if (data.projects) setProjects(data.projects);
  };

  const exportData = () => {
    return { tasks, projects };
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        projects,
        addTask,
        updateTask,
        deleteTask,
        addProject,
        updateProject,
        deleteProject,
        importData,
        exportData,
        loading,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}