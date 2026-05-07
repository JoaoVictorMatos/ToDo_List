import React, { useState, useMemo, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import clsx from 'clsx';
import { Column } from './components/Column';
import { NewTodoModal } from './components/NewTodoModal';
import { ArchivedTasksModal } from './components/ArchivedTasksModal';
import { ThemeToggle } from './components/ThemeToggle';
import { SyncStatus } from './components/SyncStatus';
import { useTheme } from './hooks/useTheme';
import { useTodos } from './hooks/useTodos';
import { useAuth } from './hooks/useAuth';
import { ColumnConfig, Task, TodoStatus, CreateTaskPayload } from './types';

const COLUMNS: ColumnConfig[] = [
  {
    id: 'pending',
    title: 'Pendente',
    colorClass: 'bg-slate-50 dark:bg-slate-800/50',
    headerClass: 'bg-slate-100 dark:bg-slate-800',
    badgeClass: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  },
  {
    id: 'doing',
    title: 'Fazendo',
    colorClass: 'bg-amber-50 dark:bg-amber-900/10',
    headerClass: 'bg-amber-100 dark:bg-amber-900/30',
    badgeClass: 'bg-amber-200 text-amber-700 dark:bg-amber-800 dark:text-amber-300',
  },
  {
    id: 'done',
    title: 'Concluido',
    colorClass: 'bg-emerald-50 dark:bg-emerald-900/10',
    headerClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    badgeClass: 'bg-emerald-200 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300',
  },
];

export const App: React.FC = () => {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme(user?.dark_mode);
  const { tasks, syncState, isLoading, createTask, updateTask, deleteTask, reorderTasksOptimistic, archiveTask, archivedTasks, isLoadingArchived, fetchArchivedTasks, unarchiveTask } =
    useTodos();

  const [modalOpen, setModalOpen] = useState(false);
  const [archivedModalOpen, setArchivedModalOpen] = useState(false);
  const [initialStatus, setInitialStatus] = useState<TodoStatus>('pending');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tasksByColumn = useMemo(
    () =>
      COLUMNS.reduce<Record<TodoStatus, Task[]>>(
        (acc, col) => {
          acc[col.id] = tasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => a.position - b.position);
          return acc;
        },
        { pending: [], doing: [], done: [] }
      ),
    [tasks]
  );

  const handleAddTask = useCallback((status: TodoStatus) => {
    setEditingTask(null);
    setInitialStatus(status);
    setModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setInitialStatus(task.status);
    setModalOpen(true);
  }, []);

  const handleArchiveTask = useCallback((id: string) => {
    archiveTask(id);
  }, [archiveTask]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setEditingTask(null);
  }, []);

  const handleModalSubmit = useCallback(
    (payload: CreateTaskPayload) => {
      if (editingTask) {
        updateTask(editingTask.id, payload);
      } else {
        createTask(payload);
      }
    },
    [editingTask, createTask, updateTask]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source } = result;

      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;

      const sourceStatus = source.droppableId as TodoStatus;
      const destStatus = destination.droppableId as TodoStatus;

      const sourceTasks = tasksByColumn[sourceStatus];
      const destTasks = tasksByColumn[destStatus];

      const draggedTask = sourceTasks[source.index];

      let newTasks = [...tasks];

      // Remove from source
      newTasks = newTasks.filter(t => t.id !== draggedTask.id);

      // Insert into destination
      const updatedTask = { ...draggedTask, status: destStatus };

      // Calculate new positions
      let insertIndex = destination.index;
      if (sourceStatus === destStatus) {
        // Same column, adjust positions
        const otherTasks = destTasks.filter(t => t.id !== draggedTask.id);
        otherTasks.splice(insertIndex, 0, updatedTask);
        newTasks = newTasks.filter(t => t.status !== destStatus).concat(otherTasks.map((t, idx) => ({ ...t, position: idx })));
      } else {
        // Different column
        destTasks.splice(insertIndex, 0, updatedTask);
        newTasks = newTasks.filter(t => t.status !== destStatus).concat(destTasks.map((t, idx) => ({ ...t, position: idx })));
        // Also update source column positions
        const sourceRemaining = sourceTasks.filter(t => t.id !== draggedTask.id);
        newTasks = newTasks.filter(t => t.status !== sourceStatus).concat(sourceRemaining.map((t, idx) => ({ ...t, position: idx })));
      }

      reorderTasksOptimistic(newTasks);
    },
    [tasksByColumn, reorderTasksOptimistic]
  );

  const completionPct =
    tasks.length === 0
      ? 0
      : Math.round((tasksByColumn.done.length / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-gray-100 transition-colors dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none text-gray-900 dark:text-gray-100">
                Task Board
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gerenciamento de Tarefas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SyncStatus state={syncState} />
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <button
              onClick={() => setArchivedModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span className="hidden sm:inline">Arquivadas</span>
            </button>
            <button
              onClick={() => handleAddTask('pending')}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">Nova Tarefa</span>
            </button>
            <button
              onClick={logout}
              title={user?.name ?? 'Sair'}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </header>

      {/* Board */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <svg className="h-8 w-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Carregando tarefas...</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {COLUMNS.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  tasks={tasksByColumn[column.id]}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={deleteTask}
                  onArchiveTask={handleArchiveTask}
                />
              ))}
            </div>
          </DragDropContext>
        )}
      </main>

      {/* Footer stats */}
      <footer className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
        <div
          className={clsx(
            'flex flex-wrap gap-x-5 gap-y-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm',
            'dark:border-gray-700 dark:bg-gray-800'
          )}
        >
          <span className="text-gray-500 dark:text-gray-400">
            Total:{' '}
            <strong className="text-gray-800 dark:text-gray-200">{tasks.length}</strong>
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Pendentes:{' '}
            <strong className="text-slate-600 dark:text-slate-400">
              {tasksByColumn.pending.length}
            </strong>
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Em progresso:{' '}
            <strong className="text-amber-600 dark:text-amber-400">
              {tasksByColumn.doing.length}
            </strong>
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Concluidas:{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">
              {tasksByColumn.done.length}
            </strong>
          </span>
          <span className="ml-auto text-gray-500 dark:text-gray-400">
            Progresso:{' '}
            <strong className="text-blue-600 dark:text-blue-400">{completionPct}%</strong>
          </span>
        </div>
      </footer>

      {/* Modal nova tarefa */}
      <NewTodoModal
        isOpen={modalOpen}
        initialStatus={initialStatus}
        editingTask={editingTask}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />

      {/* Modal tarefas arquivadas */}
      <ArchivedTasksModal
        isOpen={archivedModalOpen}
        archivedTasks={archivedTasks}
        isLoadingArchived={isLoadingArchived}
        onClose={() => setArchivedModalOpen(false)}
        onUnarchive={unarchiveTask}
        onFetch={fetchArchivedTasks}
      />
    </div>
  );
};
