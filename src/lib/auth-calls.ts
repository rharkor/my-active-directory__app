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

/**
 * Upload a file
 */
export const apiUploadFile = async (file: File, router: AppRouterInstance) => {
  //? create a new form data
  const formData = new FormData();
  //? append the file to the form data
  formData.append('file', file);
  //? send the request
  return api.fetch(
    '/uploads/upload',
    {
      method: 'POST',
      body: formData,
    },
    router,
    undefined,
    false,
  ) as Promise<z.infer<typeof ApiSchemas.uploadFile.response>>;
};

/**
 * Update the profile of the user
 */
export const apiUpdateProfile = async (
  id: string,
  body: z.infer<typeof ApiSchemas.updateProfile.body>,
  router: AppRouterInstance,
) => {
  //? validate the body against the schema
  const parsed = ApiSchemas.updateProfile.body.parse(body);
  //? send the request
  return api.fetch(
    `/users/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(parsed),
    },
    router,
  ) as Promise<z.infer<typeof ApiSchemas.updateProfile.response>>;
};

/**
 * Update password
 */
export const apiUpdatePassword = async (
  id: string,
  body: z.infer<typeof ApiSchemas.updatePassword.body>,
  router: AppRouterInstance,
) => {
  //? validate the body against the schema
  const parsed = ApiSchemas.updatePassword.body.parse(body);
  //? send the request
  return api.fetch(
    `/users/${id}/password`,
    {
      method: 'PATCH',
      body: JSON.stringify(parsed),
    },
    router,
  ) as Promise<z.infer<typeof ApiSchemas.updatePassword.response>>;
};
