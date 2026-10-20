import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { User } from '../types';
import { getCurrentUser } from '../services/userService';
import { TOKEN } from '../utils/localStorage';

const UserContext = createContext<User | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data } = useQuery<User>({
    queryKey: ['me'],
    queryFn: getCurrentUser,
    enabled: !!localStorage.getItem(TOKEN),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return (
    <UserContext.Provider value={data ?? null}>
        {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
