
import type { Project, Task } from '../app/types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface AuthResponse {
  access_token: string;
}

export interface RegisteredUser {
  id: string;
  email: string;
  createdAt: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('flow_token');

  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (
      response.status === 401 &&
      !endpoint.startsWith('/auth/')
    ) {
      localStorage.removeItem('flow_token');
      window.dispatchEvent(new Event('flow:unauthorized'));
    }

    const errorText = await response.text();

    throw new Error(
      errorText || `Błąd API: ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  return text ? JSON.parse(text) as T : undefined as T;
}

export const authApi = {
  register: (email: string, password: string) =>
    request<RegisteredUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const tasksApi = {
  getAll: (): Promise<Task[]> =>
    request<Task[]>('/tasks'),

  create: (data: Omit<Task, 'id'>): Promise<Task> =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Task>): Promise<Task> =>
    request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};

export const projectsApi = {
  getAll: (): Promise<Project[]> =>
    request<Project[]>('/projects'),

  create: (data: Omit<Project, 'id'>): Promise<Project> =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Project>): Promise<Project> =>
    request<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    request<void>(`/projects/${id}`, {
      method: 'DELETE',
    }),
};
