import React from 'react';
import clsx from 'clsx';
import { ColumnProps } from '../types';
import { TodoItem } from './TodoItem';
import { StrictModeDroppable } from './StrictModeDroppable';

export const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onArchiveTask,
}) => (
  <div className={clsx('flex flex-col rounded-xl', column.colorClass)}>
    {/* Header */}
    <div
      className={clsx(
        'flex items-center justify-between rounded-t-xl px-4 py-3',
        column.headerClass
      )}
    >
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">{column.title}</h2>
        <span
          className={clsx(
            'flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-bold',
            column.badgeClass
          )}
        >
          {tasks.length}
        </span>
      </div>
      <button
        onClick={() => onAddTask(column.id)}
        aria-label={`Adicionar tarefa em ${column.title}`}
        className="rounded-md p-1 text-gray-500 transition-colors hover:bg-black/10 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    {/* Droppable area */}
    <StrictModeDroppable droppableId={column.id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={clsx(
            'min-h-[120px] flex-1 space-y-3 overflow-y-auto p-3 transition-colors',
            snapshot.isDraggingOver && 'bg-blue-50/60 dark:bg-blue-900/10'
          )}
        >
          {tasks.length === 0 && !snapshot.isDraggingOver && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <svg
                className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-sm text-gray-400 dark:text-gray-500">Nenhuma tarefa</p>
              <button
                onClick={() => onAddTask(column.id)}
                className="mt-1.5 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Adicionar tarefa
              </button>
            </div>
          )}

          {tasks.map((task, index) => (
            <TodoItem
              key={task.id}
              task={task}
              index={index}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onArchive={onArchiveTask}
            />
          ))}

          {provided.placeholder}
        </div>
      )}
    </StrictModeDroppable>
  </div>
);
