import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, SyncState, CreateTaskPayload, UpdateTaskPayload } from '../types';
import * as api from '../services/api';
import { mockTodos } from '../data/mockTodos';

const generateTempId = () =>
  `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useTodos = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTodos);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const mutating = useRef(false);

  const finalizeSyncState = useCallback((next: 'success' | 'error') => {
    setSyncState(next);
    setTimeout(() => setSyncState('idle'), next === 'error' ? 5000 : 2000);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const fetchTasks = async () => {
      try {
        const data = await api.getTasks();
        // Não sobrescreve o estado otimista enquanto uma mutação está em andamento
        if (!mutating.current) {
          setTasks(data);
        }
      } catch {
        console.warn('[useTodos] API indisponível.');
      } finally {
        setIsLoading(false);
      }
    };

    const startPolling = () => {
      interval = setInterval(fetchTasks, 5000);
    };

    const stopPolling = () => clearInterval(interval);

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchTasks();
        startPolling();
      }
    };

    setIsLoading(true);
    fetchTasks();
    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const createTask = useCallback(
    async (payload: CreateTaskPayload) => {
      const tempId = generateTempId();
      const position = tasks.filter(t => t.status === payload.status).length;
      const optimistic: Task = {
        id: tempId,
        ...payload,
        position,
        created_at: new Date().toISOString(),
      };

      mutating.current = true;
      setTasks((prev) => [...prev, optimistic]);
      setSyncState('saving');

      try {
        const created = await api.createTask({ ...payload, position });
        setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
        finalizeSyncState('success');
      } catch {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
        finalizeSyncState('error');
      } finally {
        mutating.current = false;
      }
    },
    [tasks, finalizeSyncState]
  );

  const updateTask = useCallback(
    async (id: string, payload: UpdateTaskPayload) => {
      const previous = [...tasks];

      mutating.current = true;
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...payload } : t));
      setSyncState('saving');

      try {
        const updated = await api.updateTask(id, payload);
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        finalizeSyncState('success');
      } catch {
        setTasks(previous);
        finalizeSyncState('error');
      } finally {
        mutating.current = false;
      }
    },
    [tasks, finalizeSyncState]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const previous = [...tasks];

      mutating.current = true;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setSyncState('saving');

      try {
        await api.deleteTask(id);
        finalizeSyncState('success');
      } catch {
        setTasks(previous);
        finalizeSyncState('error');
      } finally {
        mutating.current = false;
      }
    },
    [tasks, finalizeSyncState]
  );

  const archiveTask = useCallback(
    async (id: string) => {
      const previous = [...tasks];

      mutating.current = true;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setSyncState('saving');

      try {
        await api.archieveTask(id);
        finalizeSyncState('success');
      } catch {
        setTasks(previous);
        finalizeSyncState('error');
      } finally {
        mutating.current = false;
      }
    },
    [tasks, finalizeSyncState]
  );

  const fetchArchivedTasks = useCallback(async () => {
    setIsLoadingArchived(true);
    try {
      const data = await api.getArchivedTasks();
      setArchivedTasks(data);
    } catch {
      console.warn('[useTodos] Não foi possível carregar tarefas arquivadas.');
    } finally {
      setIsLoadingArchived(false);
    }
  }, []);

  const unarchiveTask = useCallback(
    async (id: string) => {
      const previous = [...archivedTasks];
      setArchivedTasks((prev) => prev.filter((t) => t.id !== id));
      setSyncState('saving');

      try {
        const task = await api.unarchiveTask(id);
        setTasks((prev) => [...prev, task]);
        finalizeSyncState('success');
      } catch {
        setArchivedTasks(previous);
        finalizeSyncState('error');
      }
    },
    [archivedTasks, finalizeSyncState]
  );

  const reorderTasksOptimistic = useCallback(
    async (reorderedTasks: Task[]) => {
      const previous = [...tasks];

      mutating.current = true;
      setTasks(reorderedTasks);
      setSyncState('saving');

      try {
        const payload = { tasks: reorderedTasks.map(t => ({ id: t.id, position: t.position, status: t.status })) };
        await api.reorderTasks(payload);
        finalizeSyncState('success');
      } catch {
        setTasks(previous);
        finalizeSyncState('error');
      } finally {
        mutating.current = false;
      }
    },
    [tasks, finalizeSyncState]
  );

  return { tasks, syncState, isLoading, createTask, updateTask, deleteTask, reorderTasksOptimistic, archiveTask, archivedTasks, isLoadingArchived, fetchArchivedTasks, unarchiveTask };
};
