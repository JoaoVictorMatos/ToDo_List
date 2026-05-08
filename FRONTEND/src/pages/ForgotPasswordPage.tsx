import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { checkEmail } from '../services/api';

interface FormData {
  email: string;
}

export const ForgotPasswordPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>();

  const onSubmit = async ({ email }: FormData) => {
    setIsChecking(true);
    setApiError(null);
    try {
      await checkEmail(email);
      const link = `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`;
      console.log('[Task Board] Link de recuperação de senha:', link);
      setSent(true);
    } catch {
      setApiError('Nenhuma conta encontrada com este e-mail.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800">

        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recuperar Senha</h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {sent
              ? 'Link gerado! Verifique o console do servidor.'
              : 'Digite seu e-mail para receber o link de redefinição.'}
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
              Um link de redefinição foi gerado para <strong>{getValues('email')}</strong>. Acesse o console para visualizá-lo.
            </div>
            <Link
              to="/login"
              className="mt-1 flex items-center justify-center rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                })}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              />
              {errors.email && (
                <span className="text-xs text-red-500">{errors.email.message}</span>
              )}
              {apiError && (
                <span className="text-xs text-red-500">{apiError}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isChecking}
              className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isChecking ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </>
              ) : (
                'Enviar link'
              )}
            </button>
          </form>
        )}

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
