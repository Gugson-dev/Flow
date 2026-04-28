import type { Project, Task } from "../app/types";

const API_URL = "http://localhost:3000";

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API error");
  }

  return res.json();
}

// =======================
// TASKS
// =======================

export const tasksApi = {
  getAll: (): Promise<Task[]> =>
    request<Task[]>("/tasks"),

  create: (data: Omit<Task, "id">): Promise<Task> =>
    request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Task>): Promise<Task> =>
    request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    request<void>(`/tasks/${id}`, {
      method: "DELETE",
    }),
};

// =======================
// PROJECTS (na przyszłość)
// =======================

export const projectsApi = {
  getAll: (): Promise<Project[]> =>
    request<Project[]>("/projects"),

  create: (data: Omit<Project, "id">): Promise<Project> =>
    request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Project>): Promise<Project> =>
    request<Project>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    request<void>(`/projects/${id}`, {
      method: "DELETE",
    }),
};