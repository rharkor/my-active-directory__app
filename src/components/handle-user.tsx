'use client';

import { getUserSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { redirect, usePathname } from 'next/navigation';
import Cookies from 'universal-cookie';

export default function HandleUser() {
  const pathname = usePathname();

  //* Verify the user session
  if (!pathname.startsWith('/auth')) {
    //? Get the sessions
    const cookies = new Cookies();
    const session = getUserSession(cookies);
    //? Determine where to redirect the user if there is no session
    if (!session) {
      //? redirect to the login page
      logger.debug('[HandleUser] redirect to login page');
      return redirect('/auth/login');
    }
  }

  return <></>;
}
