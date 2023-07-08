'use client';

import { useUserStore } from '@/contexts/user.store';
import { useRouter } from 'next/navigation';

export default function InitState() {
  const router = useRouter();

  //? Initialize the user store
  useUserStore((state) => state.loadProfile)(router);

  return <></>;
}
