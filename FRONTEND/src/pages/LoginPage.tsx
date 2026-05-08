import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginPayload, RegisterPayload } from '../types';

export const LoginPage: React.FC = () => {
  const { login, register: registerUser, isLoading, error } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const passwordReset = (location.state as { passwordReset?: boolean } | null)?.passwordReset;

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<LoginPayload & RegisterPayload>();
  const watchPassword = watch('password', '');

  const onSubmit = (data: LoginPayload & RegisterPayload) => {
    if (isRegister) {
      registerUser({ name: data.name!, email: data.email, password: data.password });
    } else {
      login({ email: data.email, password: data.password });
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800">

        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Task Board</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isRegister ? 'Crie sua conta' : 'Faça login para continuar'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>

          {isRegister && (
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Seu nome"
                {...register('name', {
                  required: isRegister ? 'Nome é obrigatório' : false,
                })}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              />
              {errors.name && (
                <span className="text-xs text-red-500">{errors.name.message}</span>
              )}
            </div>
          )}

          {/* Email */}
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
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' },
              })}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
            />
            {errors.email && (
              <span className="text-xs text-red-500">{errors.email.message}</span>
            )}
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: { value: 8, message: 'Mínimo de 8 caracteres' },
                  pattern: { value: /[A-Z]/, message: 'Deve conter uma letra maiúscula' },
                })}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showPassword ? (
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
            {errors.password && (
              <span className="text-xs text-red-500">{errors.password.message}</span>
            )}
            
            {/* Dicas de Senha - Apenas em Registro */}
            {isRegister && watchPassword && (
              <div className="mt-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="mb-2 text-xs font-medium text-blue-900 dark:text-blue-300">Requisitos da senha:</p>
                <ul className="flex flex-col gap-1 text-xs text-blue-800 dark:text-blue-200">
                  <li className={`flex items-center gap-2 ${watchPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-blue-800 dark:text-blue-200'}`}>
                    <span>{watchPassword.length >= 8 ? '✓' : '○'}</span>
                    Mínimo 8 caracteres
                  </li>
                  <li className={`flex items-center gap-2 ${/[A-Z]/.test(watchPassword) ? 'text-green-600 dark:text-green-400' : 'text-blue-800 dark:text-blue-200'}`}>
                    <span>{/[A-Z]/.test(watchPassword) ? '✓' : '○'}</span>
                    Uma letra maiúscula
                  </li>
                  <li className={`flex items-center gap-2 ${/[a-z]/.test(watchPassword) ? 'text-green-600 dark:text-green-400' : 'text-blue-800 dark:text-blue-200'}`}>
                    <span>{/[a-z]/.test(watchPassword) ? '✓' : '○'}</span>
                    Uma letra minúscula
                  </li>
                  <li className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(watchPassword) ? 'text-green-600 dark:text-green-400' : 'text-blue-800 dark:text-blue-200'}`}>
                    <span>{/[^A-Za-z0-9]/.test(watchPassword) ? '✓' : '○'}</span>
                    Um caractere especial (!@#$%^&*)
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Sucesso na redefinição de senha */}
          {passwordReset && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
              Senha redefinida com sucesso! Faça login com a nova senha.
            </div>
          )}

          {/* Erro da API */}
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Botão */}
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
                {isRegister ? 'Registrando...' : 'Entrando...'}
              </>
            ) : (
              isRegister ? 'Registrar' : 'Entrar'
            )}
          </button>
        </form>

        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            onClick={toggleMode}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            {isRegister ? 'Já tem conta? Faça login' : 'Não tem conta? Registre-se'}
          </button>
          {!isRegister && (
            <Link
              to="/forgot-password"
              className="text-sm text-gray-500 hover:underline dark:text-gray-400"
            >
              Esqueceu a senha?
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};


