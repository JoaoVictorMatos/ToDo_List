import { useState, useEffect, useCallback, useRef } from 'react';
import { updateTheme, getMe } from '../services/api';

const THEME_KEY = 'task-board-theme';

export const useTheme = (userDarkMode?: boolean) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored !== null) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Evita chamar updateTheme quando a mudança vem do servidor
  const fromServer = useRef(false);

  // Sincroniza com o banco quando o usuário loga pela primeira vez no dispositivo
  useEffect(() => {
    if (typeof userDarkMode === 'boolean' && localStorage.getItem(THEME_KEY) === null) {
      fromServer.current = true;
      setIsDark(userDarkMode);
    }
  }, [userDarkMode]);

  // Polling: busca dark_mode do banco a cada 10s
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const syncFromServer = async () => {
      try {
        const me = await getMe();
        setIsDark((prev) => {
          if (me.dark_mode !== prev) {
            fromServer.current = true;
            return me.dark_mode;
          }
          return prev;
        });
      } catch {}
    };

    const startPolling = () => { interval = setInterval(syncFromServer, 10000); };
    const stopPolling = () => clearInterval(interval);

    const handleVisibility = () => {
      if (document.hidden) stopPolling();
      else { syncFromServer(); startPolling(); }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Aplica o tema no DOM e persiste; só envia ao banco se a mudança veio do usuário
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    if (!fromServer.current) {
      updateTheme(isDark).catch(() => {});
    }
    fromServer.current = false;
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  return { isDark, toggleTheme };
};
