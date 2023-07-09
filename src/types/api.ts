import { passwordRegex } from '@/lib/utils';
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

export const RoleSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    displayName: z.string(),
    description: z.string().nullable(),
  }),
);

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  username: z.string().min(5).max(50),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  metadata: z
    .object({
      avatar: z.string().nullable(), //? URL to the avatar
    })
    .nullable(),
  roles: RoleSchema,
});

export const TokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

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
      password: z.string().min(8).max(50).regex(passwordRegex),
    }),
    response: TokensSchema,
  },
  login: {
    body: z.object({
      username: z.string().min(5).max(50),
      password: z.string().min(8).max(50),
    }),
    response: TokensSchema,
  },
  refreshToken: {
    response: TokensSchema,
  },
  profile: {
    response: UserSchema,
  },
  uploadFile: {
    response: z.object({
      file: z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        size: z.number(),
        filename: z.string(),
        path: z.string(),
      }),
    }),
  },
  updateProfile: {
    body: z.object({
      email: z.string().email().optional(),
      username: z.string().min(5).max(50).optional(),
      firstName: z.string().min(2).max(50).optional(),
      lastName: z.string().min(2).max(50).optional(),
      metadata: z
        .object({
          avatar: z.string().nullable().optional(), //? URL to the avatar
        })
        .nullable()
        .optional(),
    }),
    response: UserSchema.extend({
      tokens: TokensSchema,
    }),
  },
  updatePassword: {
    body: z.object({
      oldPassword: z.string().min(8).max(50).regex(passwordRegex),
      password: z.string().min(8).max(50).regex(passwordRegex),
    }),
    response: UserSchema.extend({
      tokens: TokensSchema,
    }),
  },
};
