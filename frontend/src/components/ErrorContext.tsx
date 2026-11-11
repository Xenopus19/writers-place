import { createContext, useCallback, useEffect, useState } from 'react';

export interface DisplayError {
  message: string;
  cause?: unknown;
}

export interface ErrorContextValue {
  error: DisplayError | null;
  reportError: (message: string, cause?: unknown) => void;
  dismissError: () => void;
}

export const ErrorContext = createContext<ErrorContextValue | null>(null);

export const ErrorProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = useState<DisplayError | null>(null);
  const reportError = useCallback((message: string, cause?: unknown) => {
    setError({ message, cause });
  }, []);
  const dismissError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(dismissError, 5_000);
    return () => clearTimeout(timer);
  }, [error, dismissError]);

  return (
    <ErrorContext.Provider value={{ error, reportError, dismissError }}>
      {children}
    </ErrorContext.Provider>
  );
};
