import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { recoverPassword } from '../services/api';

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') ?? '';

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const watchPassword = watch('newPassword', '');

  const onSubmit = async ({ newPassword }: FormData) => {
    if (!email) return;
    setIsLoading(true);
    setApiError(null);
    try {
      await recoverPassword(email, newPassword);
      navigate('/login', { state: { passwordReset: true } });
    } catch {
      setApiError('Não foi possível redefinir a senha. Verifique o e-mail e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">Link inválido ou expirado.</p>
          <Link to="/login" className="mt-4 block text-sm text-blue-600 hover:underline dark:text-blue-400">
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800">

        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nova Senha</h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Redefinindo senha para <strong className="text-gray-700 dark:text-gray-300">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>

          {/* Nova senha */}
          <div className="flex flex-col gap-1">
            <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nova Senha
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('newPassword', {
                  required: 'Senha é obrigatória',
                  minLength: { value: 8, message: 'Mínimo de 8 caracteres' },
                  pattern: { value: /[A-Z]/, message: 'Deve conter uma letra maiúscula' },
                })}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showNewPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showNewPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && (
              <span className="text-xs text-red-500">{errors.newPassword.message}</span>
            )}

            {/* Indicadores de força */}
            {watchPassword && (
              <div className="mt-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <ul className="flex flex-col gap-1 text-xs">
                  <li className={`flex items-center gap-2 ${watchPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-blue-800 dark:text-blue-200'}`}>
                    <span>{watchPassword.length >= 8 ? '✓' : '○'}</span> Mínimo 8 caracteres
                  </li>
                  <li className={`flex items-center gap-2 ${/[A-Z]/.test(watchPassword) ? 'text-green-600 dark:text-green-400' : 'text-blue-800 dark:text-blue-200'}`}>
                    <span>{/[A-Z]/.test(watchPassword) ? '✓' : '○'}</span> Uma letra maiúscula
                  </li>
                  <li className={`flex items-center gap-2 ${/[a-z]/.test(watchPassword) ? 'text-green-600 dark:text-green-400' : 'text-blue-800 dark:text-blue-200'}`}>
                    <span>{/[a-z]/.test(watchPassword) ? '✓' : '○'}</span> Uma letra minúscula
                  </li>
                  <li className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(watchPassword) ? 'text-green-600 dark:text-green-400' : 'text-blue-800 dark:text-blue-200'}`}>
                    <span>{/[^A-Za-z0-9]/.test(watchPassword) ? '✓' : '○'}</span> Um caractere especial
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Confirmação é obrigatória',
                  validate: (value) => value === watchPassword || 'As senhas não coincidem',
                })}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showConfirmPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showConfirmPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Erro da API */}
          {apiError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {apiError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Salvando...
              </>
            ) : (
              'Redefinir Senha'
            )}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-4 block text-center text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  );
};
