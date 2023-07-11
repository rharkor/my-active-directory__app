import { ApiSchemas } from '@/types/api';
import * as z from 'zod';
import api from './api';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { filtersToQuery, sortingToQuery } from './utils';

/**
 * Check if the backend is initialized
 */
export const apiBackendInitialized = async () => {
  //? send the request
  return api.fetch(
    '/auth/initialized',
    {
      next: {
        revalidate: 120, //? Revalidate the data every 2 minutes
      },
    },
    undefined,
    false,
  ) as Promise<z.infer<typeof ApiSchemas.initialized.response>>;
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
  return api.fetch(
    '/auth/register/init',
    {
      method: 'POST',
      body: JSON.stringify(parsed),
    },
    undefined,
    false,
  ) as Promise<z.infer<typeof ApiSchemas.registerFirstUser.response>>;
};

/**
 * Login the user
 */
export const apiLogin = async (body: z.infer<typeof ApiSchemas.login.body>) => {
  //? validate the body against the schema
  const parsed = ApiSchemas.login.body.parse(body);
  //? send the request
  return api.fetch(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(parsed),
    },
    undefined,
    false,
  ) as Promise<z.infer<typeof ApiSchemas.login.response>>;
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

/**
 * Get all tokens
 */
export const apiGetAllTokens = async (
  router: AppRouterInstance,
  page?: string,
  itemsPerPage?: string,
) => {
  //? send the request
  return api.fetch(
    `/auth/tokens${page ? `?page=${page}` : '?page=1'}${
      itemsPerPage ? `&limit=${itemsPerPage}` : ''
    }`,
    {
      next: {
        revalidate: 60, //? Revalidate the data every minute
      },
    },
    router,
  ) as Promise<z.infer<typeof ApiSchemas.getAllTokens.response>>;
};

/**
 * Revoke a token
 */
export const apiRevokeToken = async (id: string, router: AppRouterInstance) => {
  //? send the request
  return api.fetch(
    `/auth/tokens/${id}`,
    {
      method: 'DELETE',
    },
    router,
    false, //? Do not refresh the token because it will recreate it
  ) as Promise<z.infer<typeof ApiSchemas.revokeToken.response>>;
};

/**
 * Get all roles
 */
export const apiGetAllRoles = async (
  router: AppRouterInstance,
  page?: string,
  itemsPerPage?: string,
  filters?: ColumnFiltersState,
  sorting?: SortingState,
) => {
  //? send the request
  return api.fetch(
    `/roles${page ? `?page=${page}` : '?page=1'}${
      itemsPerPage ? `&limit=${itemsPerPage}` : ''
    }${filtersToQuery(filters ?? [])}${sortingToQuery(sorting ?? [])}`,
    {
      next: {
        revalidate: 60, //? Revalidate the data every minute
      },
    },
    router,
  ) as Promise<z.infer<typeof ApiSchemas.getAllRoles.response>>;
};

/**
 * Create a role
 */
export const apiCreateRole = async (
  body: z.infer<typeof ApiSchemas.createRole.body>,
  router: AppRouterInstance,
) => {
  //? validate the body against the schema
  const parsed = ApiSchemas.createRole.body.parse(body);
  //? send the request
  return api.fetch(
    `/roles`,
    {
      method: 'POST',
      body: JSON.stringify(parsed),
    },
    router,
  ) as Promise<z.infer<typeof ApiSchemas.createRole.response>>;
};

/**
 * Update a role
 */
export const apiUpdateRole = async (
  id: string,
  body: z.infer<typeof ApiSchemas.updateRole.body>,
  router: AppRouterInstance,
) => {
  //? validate the body against the schema
  const parsed = ApiSchemas.updateRole.body.parse(body);
  //? send the request
  return api.fetch(
    `/roles/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(parsed),
    },
    router,
  ) as Promise<z.infer<typeof ApiSchemas.updateRole.response>>;
};

/**
 * Delete a role
 */
export const apiDeleteRole = async (id: string, router: AppRouterInstance) => {
  //? send the request
  return api.fetch(
    `/roles/${id}`,
    {
      method: 'DELETE',
    },
    router,
  ) as Promise<z.infer<typeof ApiSchemas.deleteRole.response>>;
};
