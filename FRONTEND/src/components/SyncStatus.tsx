import React from 'react';
import clsx from 'clsx';
import { SyncStatusProps, SyncState } from '../types';

type ActiveState = Exclude<SyncState, 'idle'>;

const CONFIG: Record<ActiveState, { label: string; className: string; icon: React.ReactNode }> = {
  saving: {
    label: 'Salvando...',
    className: 'text-blue-600 dark:text-blue-400',
    icon: (
      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    ),
  },
  success: {
    label: 'Sincronizado',
    className: 'text-emerald-600 dark:text-emerald-400',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    label: 'Erro ao sincronizar',
    className: 'text-red-600 dark:text-red-400',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
    ),
  },
};

export const SyncStatus: React.FC<SyncStatusProps> = ({ state }) => {
  if (state === 'idle') return null;

  const config = CONFIG[state];

  return (
    <div className={clsx('flex items-center gap-1.5 text-sm font-medium transition-all animate-fade-in', config.className)}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};
