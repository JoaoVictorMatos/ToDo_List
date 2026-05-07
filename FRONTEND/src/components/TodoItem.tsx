import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import clsx from 'clsx';
import { TaskItemProps, Priority } from '../types';

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badgeClass: string; borderClass: string }
> = {
  low: {
    label: 'Baixa',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    borderClass: 'border-l-emerald-500',
  },
  medium: {
    label: 'Média',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    borderClass: 'border-l-amber-500',
  },
  high: {
    label: 'Alta',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    borderClass: 'border-l-red-500',
  },
};

export const TodoItem: React.FC<TaskItemProps> = ({ task, index, onEdit, onDelete, onArchive }) => {
  const priority = PRIORITY_CONFIG[task.priority];
  const isDone = task.status === 'done';
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={clsx(
            'group relative rounded-lg border-l-4 bg-white p-4 shadow-sm transition-all',
            'dark:bg-gray-800',
            isDone ? 'border-l-gray-300 dark:border-l-gray-600' : priority.borderClass,
            snapshot.isDragging
              ? 'rotate-1 shadow-xl ring-2 ring-blue-400/50'
              : 'hover:shadow-md'
          )}
        >
          {/* Drag handle */}
          <div
            {...provided.dragHandleProps}
            className="absolute right-2 top-2 cursor-grab p-1 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            aria-label="Arrastar tarefa"
          >
            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="9" cy="5" r="1.5" />
              <circle cx="15" cy="5" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="15" cy="19" r="1.5" />
            </svg>
          </div>

          {/* Title */}
          <div className="mb-1.5 flex items-start gap-2 pr-6">
            <h3 className="line-clamp-2 flex-1 font-semibold leading-snug text-gray-900 dark:text-gray-100">
              {task.title}
            </h3>
          </div>

          {/* Description */}
          {task.description && (
            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {task.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                isDone
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  : priority.badgeClass
              )}
            >
              {priority.label}
            </span>

            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(task.created_at).toLocaleDateString('pt-BR')}
            </span>

            {/* Action buttons */}
            <div
              className={clsx(
                'ml-auto flex items-center gap-1 transition-opacity',
                confirmingDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              )}
            >
              {confirmingDelete ? (
                <>
                  <span className="mr-1 text-xs font-medium text-red-600 dark:text-red-400">
                    Excluir tarefa?
                  </span>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="rounded px-2 py-0.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Não
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                  >
                    Sim
                  </button>
                </>
              ) : (
                <>
                  {/* Edit */}
                  <button
                    onClick={() => onEdit(task)}
                    aria-label="Editar tarefa"
                    className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Archive — só aparece se a tarefa estiver concluída */}
                  {isDone && (
                    <button
                      onClick={() => onArchive(task.id)}
                      aria-label="Arquivar tarefa"
                      className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-amber-600 dark:hover:bg-gray-700 dark:hover:text-amber-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    aria-label="Deletar tarefa"
                    className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
