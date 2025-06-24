// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    console.log("token form srcapp",token)
    if (!token) {
      router.replace('/login');
    } else {
      router.replace('/dashboard');
    }
  }, [router]);

  return <p>Redirecting...</p>;
}
