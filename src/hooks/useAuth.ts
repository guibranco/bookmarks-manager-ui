import { useState, useEffect } from 'react';
import { AuthState } from '../types';

export function useAuth(apiKey: string) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    apiKey: '',
  });

  useEffect(() => {
    const isValid = apiKey && apiKey.trim().length >= 8;
    setAuthState({
      isAuthenticated: isValid,
      apiKey,
    });
  }, [apiKey]);

  return authState;
}
