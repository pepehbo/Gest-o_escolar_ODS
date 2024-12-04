import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedUserTypes?: ('student' | 'teacher')[];
}

export function AuthGuard({ children, allowedUserTypes }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    if (!userType) {
      navigate('/', { replace: true });
      return;
    }

    if (allowedUserTypes && !allowedUserTypes.includes(userType as any)) {
      navigate('/unauthorized', { replace: true });
      return;
    }
  }, [userType, navigate, location.pathname, allowedUserTypes]);

  if (!userType) return null;

  return <>{children}</>;
}