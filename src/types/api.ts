import * as z from 'zod';

export type ApiError = {
  statusCode: number;
  timestamp: string;
  path: string;
  error:
    | {
        statusCode: number;
        message?: string | string[];
        error: string;
      }
    | string;
};

export type Role = {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
};

export type TokenDecoded = {
  id: number;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  metadata: string | null;
  roles?: Role[];
  iat: number;
  exp: number;
};

export const ApiSchemas = {
  initialized: {
    response: z.object({
      initialized: z.boolean(),
    }),
  },
  registerFirstUser: {
    body: z.object({
      email: z.string().email(),
      username: z.string().min(5).max(50),
      password: z
        .string()
        .min(8)
        .max(50)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
    }),
    response: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
    }),
  },
  login: {
    body: z.object({
      username: z.string().min(5).max(50),
      password: z.string().min(8).max(50),
    }),
    response: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
    }),
  },
  refreshToken: {
    response: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
    }),
  },
};
