import { Navigate } from 'react-router-dom';
import { useUser, useUserLoading } from './UserContext';

const ProtectedPage = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const isUserLoading = useUserLoading();

  if (isUserLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedPage;