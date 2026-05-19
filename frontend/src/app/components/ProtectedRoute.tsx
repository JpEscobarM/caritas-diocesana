import { Navigate } from 'react-router-dom';
import { getAuthSession } from '../lib/auth';
import type { Profile } from '../types/auth';

type ProtectedRouteProps = {
  profile: Profile;
  children: React.ReactNode;
};

export function ProtectedRoute({ profile, children }: ProtectedRouteProps) {
  const session = getAuthSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.profile !== profile) {
    return <Navigate to={`/${session.profile}`} replace />;
  }

  return <>{children}</>;
}
