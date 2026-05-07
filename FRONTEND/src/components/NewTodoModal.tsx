import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import { NewTodoModalProps, CreateTaskPayload, Priority, TodoStatus } from '../types';

type FormValues = {
  title: string;
  description: string;
  priority: Priority;
  status: TodoStatus;
};

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
];

const STATUS_OPTIONS: { value: TodoStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'doing', label: 'Fazendo' },
  { value: 'done', label: 'Concluido' },
];

const inputBase =
  'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500';
const inputNormal =
  'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-900/50';
const inputError =
  'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-500';

export const NewTodoModal: React.FC<NewTodoModalProps> = ({
  isOpen,
  initialStatus = 'pending',
  editingTask,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { title: '', description: '', priority: 'medium', status: initialStatus },
  });

  // Sync form values when modal opens or editing target changes
  useEffect(() => {
    if (!isOpen) return;
    reset(
      editingTask
        ? {
            title: editingTask.title,
            description: editingTask.description || '',
            priority: editingTask.priority,
            status: editingTask.status,
          }
        : { title: '', description: '', priority: 'medium', status: initialStatus }
    );
  }, [isOpen, editingTask, initialStatus, reset]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleFormSubmit = (data: FormValues) => {
    onSubmit(data as CreateTaskPayload);
    onClose();
  };

  if (!isOpen) return null;

  const isEditing = !!editingTask;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md animate-slide-up rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-6">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titulo <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title', {
                required: 'O titulo e obrigatorio',
                minLength: { value: 3, message: 'Minimo 3 caracteres' },
                maxLength: { value: 100, message: 'Maximo 100 caracteres' },
              })}
              type="text"
              placeholder="Titulo da tarefa..."
              className={clsx(inputBase, errors.title ? inputError : inputNormal)}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descricao
            </label>
            <textarea
              {...register('description', {
                maxLength: { value: 500, message: 'Maximo 500 caracteres' },
              })}
              rows={3}
              placeholder="Descreva a tarefa..."
              className={clsx(
                inputBase,
                'resize-none',
                errors.description ? inputError : inputNormal
              )}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Prioridade
              </label>
              <select
                {...register('priority')}
                className={clsx(inputBase, inputNormal)}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                {...register('status')}
                className={clsx(inputBase, inputNormal)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isEditing ? 'Salvar Alteracoes' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
