import { ApiSchemas } from '@/types/api';
import * as z from 'zod';
import api from './api';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';

/**
 * Check if the backend is initialized
 */
export const apiBackendInitialized = async () => {
  //? send the request
  return api.fetch('/auth/initialized', {
    next: {
      revalidate: 120, //? Revalidate the data every 2 minutes
    },
  }) as Promise<z.infer<typeof ApiSchemas.initialized.response>>;
};

/**
 * Register the first user
 */
export const apiRegisterFirstUser = async (
  body: z.infer<typeof ApiSchemas.registerFirstUser.body>,
) => {
  //? validate the body against the schema
  const parsed = ApiSchemas.registerFirstUser.body.parse(body);
  //? send the request
  return api.fetch('/auth/register/init', {
    method: 'POST',
    body: JSON.stringify(parsed),
  }) as Promise<z.infer<typeof ApiSchemas.registerFirstUser.response>>;
};

/**
 * Login the user
 */
export const apiLogin = async (body: z.infer<typeof ApiSchemas.login.body>) => {
  //? validate the body against the schema
  const parsed = ApiSchemas.login.body.parse(body);
  //? send the request
  return api.fetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(parsed),
  }) as Promise<z.infer<typeof ApiSchemas.login.response>>;
};

/**
 * Get the profile of the user
 */
export const apiProfile = async (router: AppRouterInstance) => {
  //? send the request
  return api.fetch(
    '/auth/profile',
    {
      next: {
        revalidate: 60, //? Revalidate the data every minute
      },
    },
    router,
  ) as Promise<z.infer<typeof ApiSchemas.profile.response>>;
};
