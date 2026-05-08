import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, register as apiRegister } from '../services/api';
import { LoginPayload, RegisterPayload, User } from '../types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const useAuth = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    try {
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { token, user } = await apiLogin(payload);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setUser(user);
      navigate('/');
    } catch {
      setError('Email ou senha inválidos.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiRegister(payload);
      // After register, auto login
      await login({ email: payload.email, password: payload.password });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 'Erro ao registrar. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY);

  return { user, isAuthenticated, isLoading, error, login, register, logout };
};
