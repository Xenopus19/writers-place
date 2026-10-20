import { getCurrentUser, loginUser } from '../services/userService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { TOKEN } from '../utils/localStorage';

type LoginCredentials = {
  username: string;
  password: string;
};

const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const loginMutation = useMutation({
    mutationFn: (data: LoginCredentials) =>
      loginUser(data.username, data.password),
  });

  const login = async (data: LoginCredentials) => {
    const loginResult = await loginMutation.mutateAsync(data);

    if (loginResult?.token) {
      localStorage.setItem(TOKEN, loginResult.token);
      await queryClient.fetchQuery({
        queryKey: ['me'],
        queryFn: getCurrentUser,
        staleTime: 0,
      });
      navigate('/');
    }

    return loginResult;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN);
    queryClient.setQueryData(['me'], null);
    navigate('/');
  };

  return {
    login,
    logout,
    isPending: loginMutation.isPending,
    error: loginMutation.error,
  };
};

export default useLogin;
