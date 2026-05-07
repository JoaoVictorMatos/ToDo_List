import axios, { AxiosError } from 'axios';
import { Task, User, CreateTaskPayload, UpdateTaskPayload, LoginPayload, RegisterPayload, LoginResponse, ReorderPayload } from '../types';

const BASE_URL = 'https://todolist-production-a894.up.railway.app';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as { message?: string })?.message ?? error.message;
    console.error('[API Error]', error.config?.url, message);
    return Promise.reject(error);
  }
);

export const register = async (payload: RegisterPayload): Promise<void> => {
  await apiClient.post('/users', payload);
};

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/login', payload);
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await apiClient.get<User>('/users/me');
  return data;
};

export const getTasks = async (): Promise<Task[]> => {
  const { data } = await apiClient.get<Task[]>('/tasks');
  return data;
};

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const { data } = await apiClient.post<Task>('/tasks', payload);
  return data;
};

export const updateTask = async (
  id: string,
  payload: UpdateTaskPayload
): Promise<Task> => {
  const { data } = await apiClient.patch<Task>(`/tasks/${id}`, payload);
  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};

export const reorderTasks = async (payload: ReorderPayload): Promise<void> => {
  await apiClient.patch('/tasks/reorder', payload);
};

export const updateTheme = async (darkMode: boolean): Promise<void> => {
  await apiClient.patch('/users/theme', { darkMode });
};

export const archieveTask = async (id: string): Promise<void> => {
  await apiClient.patch(`/tasks/${id}/archive`);
};

export const getArchivedTasks = async (): Promise<Task[]> => {
  const { data } = await apiClient.get<Task[]>('/tasks/archived');
  return data;
};

export const unarchiveTask = async (id: string): Promise<Task> => {
  const { data } = await apiClient.patch<Task>(`/tasks/${id}/unarchive`);
  return data;
};
