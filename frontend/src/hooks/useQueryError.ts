import { useEffect, useRef } from 'react';
import useError from './useError';

const useQueryError = (
  error: unknown,
  errorUpdatedAt: number,
  isError: boolean,
  message: string,
) => {
  const { reportError } = useError();
  const reportedAt = useRef(0);

  useEffect(() => {
    if (isError && errorUpdatedAt > reportedAt.current) {
      reportedAt.current = errorUpdatedAt;
      reportError(message, error);
    }
  }, [error, errorUpdatedAt, isError, message, reportError]);
};

export default useQueryError;
