import { createContext, useState, type ReactNode, useEffect } from 'react';
import type { Task, Project } from '../types';

export interface DataContextType {
  tasks: Task[];
  projects: Project[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  importData: (data: { tasks?: Task[]; projects?: Project[] }) => void;
  exportData: () => { tasks: Task[]; projects: Project[] };
}

export const DataContext = createContext<DataContextType>({} as DataContextType);

const STORAGE_KEYS = {
  TASKS: 'app-tasks',
  PROJECTS: 'app-projects',
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old projects to include new fields
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString() + Math.random().toString(36),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString() + Math.random().toString(36),
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, ...updates } : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
    // Remove tasks associated with this project
    setTasks((prev) => prev.filter((task) => task.projectId !== id));
  };

  const importData = (data: { tasks?: Task[]; projects?: Project[] }) => {
    if (data.projects) {
      // Merge imported projects with existing ones, avoiding duplicates
      setProjects((prev) => {
        const existingIds = new Set(prev.map(p => p.id));
        const newProjects = data.projects!.filter(p => !existingIds.has(p.id));
        return [...prev, ...newProjects];
      });
    }

    if (data.tasks) {
      // Merge imported tasks with existing ones, avoiding duplicates
      setTasks((prev) => {
        const existingIds = new Set(prev.map(t => t.id));
        const newTasks = data.tasks!.filter(t => !existingIds.has(t.id));
        return [...prev, ...newTasks];
      });
    }
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

