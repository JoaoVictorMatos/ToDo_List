import React, { useEffect } from 'react';
import clsx from 'clsx';
import { ArchivedTasksModalProps, Priority } from '../types';

const PRIORITY_CONFIG: Record<Priority, { label: string; badgeClass: string }> = {
  low: {
    label: 'Baixa',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  },
  medium: {
    label: 'Média',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  },
  high: {
    label: 'Alta',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  },
};

export const ArchivedTasksModal: React.FC<ArchivedTasksModalProps> = ({
  isOpen,
  archivedTasks,
  isLoadingArchived,
  onClose,
  onUnarchive,
  onFetch,
}) => {
  useEffect(() => {
    if (isOpen) onFetch();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-800"
        style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Tarefas Arquivadas
            </h2>
            {!isLoadingArchived && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {archivedTasks.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoadingArchived ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <svg className="h-6 w-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
            </div>
          ) : archivedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <svg
                className="h-10 w-10 text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhuma tarefa arquivada.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {archivedTasks.map((task) => {
                const p = PRIORITY_CONFIG[task.priority];
                return (
                  <li
                    key={task.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug text-gray-900 dark:text-gray-100">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={clsx(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            p.badgeClass
                          )}
                        >
                          {p.label}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(task.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onUnarchive(task.id)}
                      title="Restaurar tarefa"
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Restaurar
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
