import {
  createContext,
  useState,
  type ReactNode,
  useEffect,
} from 'react';

import type { Task, Project } from '../types';

import {
  tasksApi,
  projectsApi,
} from '../../api/api';

import { socket } from '../../socket/socket';

export interface DataContextType {
  tasks: Task[];
  projects: Project[];

  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (
    id: string,
    updates: Partial<Task>
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addProject: (
    project: Omit<Project, 'id'>
  ) => Promise<void>;

  updateProject: (
    id: string,
    updates: Partial<Project>
  ) => Promise<void>;

  deleteProject: (id: string) => Promise<void>;

  importData: (data: {
    tasks?: Task[];
    projects?: Project[];
  }) => void;

  exportData: () => {
    tasks: Task[];
    projects: Project[];
  };

  loading: boolean;
  error: string | null;
}

export const DataContext =
  createContext<DataContextType>(
    {} as DataContextType
  );

export function DataProvider({
  children,
}: {
  children: ReactNode;
}) {
  // =========================
  // STATE
  // =========================

  const [tasks, setTasks] = useState<Task[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // =========================
  // LOADERS
  // =========================

  const loadTasks = async () => {
    try {
      const data = await tasksApi.getAll();
      setTasks(data);
    } catch (err: unknown) {
      console.error('loadTasks error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Nie udało się pobrać tasków'
      );
    }
  };

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (err: unknown) {
      console.error('loadProjects error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Nie udało się pobrać projektów'
      );
    }
  };

  // =========================
  // INIT + REALTIME
  // =========================

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const [tasksData, projectsData] =
          await Promise.all([
            tasksApi.getAll(),
            projectsApi.getAll(),
          ]);

        if (!mounted) return;

        setTasks(tasksData);
        setProjects(projectsData);
      } catch (err: unknown) {
        console.error('init error:', err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Błąd ładowania danych'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    socket.on('tasksUpdated', loadTasks);

    socket.on(
      'projectsUpdated',
      loadProjects
    );

    return () => {
      mounted = false;

      socket.off(
        'tasksUpdated',
        loadTasks
      );

      socket.off(
        'projectsUpdated',
        loadProjects
      );
    };
  }, []);

  // =========================
  // TASKS
  // =========================

  const addTask = async (
    task: Omit<Task, 'id'>
  ) => {
    try {
      setError(null);

      const newTask =
        await tasksApi.create(task);

      setTasks((prev) => [
        ...prev,
        newTask,
      ]);
    } catch (err: unknown) {
      console.error(
        'addTask error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Błąd dodawania taska'
      );
    }
  };

  const updateTask = async (
    id: string,
    updates: Partial<Task>
  ) => {
    try {
      setError(null);

      const updatedTask =
        await tasksApi.update(
          id,
          updates
        );

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? updatedTask
            : task
        )
      );
    } catch (err: unknown) {
      console.error(
        'updateTask error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Błąd aktualizacji taska'
      );
    }
  };

  const deleteTask = async (
    id: string
  ) => {
    try {
      setError(null);

      await tasksApi.delete(id);

      setTasks((prev) =>
        prev.filter(
          (task) => task.id !== id
        )
      );
    } catch (err: unknown) {
      console.error(
        'deleteTask error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Błąd usuwania taska'
      );
    }
  };

  // =========================
  // PROJECTS
  // =========================

  const addProject = async (
    project: Omit<Project, 'id'>
  ) => {
    try {
      setError(null);

      const newProject =
        await projectsApi.create(
          project
        );

      setProjects((prev) => [
        ...prev,
        newProject,
      ]);
    } catch (err: unknown) {
      console.error(
        'addProject error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Błąd dodawania projektu'
      );
    }
  };

  const updateProject = async (
    id: string,
    updates: Partial<Project>
  ) => {
    try {
      setError(null);

      const updatedProject =
        await projectsApi.update(
          id,
          updates
        );

      setProjects((prev) =>
        prev.map((project) =>
          project.id === id
            ? updatedProject
            : project
        )
      );
    } catch (err: unknown) {
      console.error(
        'updateProject error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Błąd aktualizacji projektu'
      );
    }
  };

  const deleteProject = async (
    id: string
  ) => {
    try {
      setError(null);

      await projectsApi.delete(id);

      setProjects((prev) =>
        prev.filter(
          (project) =>
            project.id !== id
        )
      );

      setTasks((prev) =>
        prev.filter(
          (task) =>
            task.projectId !== id
        )
      );
    } catch (err: unknown) {
      console.error(
        'deleteProject error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Błąd usuwania projektu'
      );
    }
  };

  // =========================
  // IMPORT / EXPORT
  // =========================

  const importData = (data: {
    tasks?: Task[];
    projects?: Project[];
  }) => {
    if (data.tasks) {
      setTasks(data.tasks);
    }

    if (data.projects) {
      setProjects(data.projects);
    }
  };

  const exportData = () => {
    return {
      tasks,
      projects,
    };
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