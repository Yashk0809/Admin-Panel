'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function withAuth<P>(Component: React.ComponentType<P>) {
  const WrappedComponent = (props: React.PropsWithChildren<P>) => {
    const router = useRouter();

    useEffect(() => {
      if (!localStorage.getItem('token')) {
        router.replace('/login');
      }
    }, [router]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}
