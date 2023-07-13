import {
  passWordRegexError,
  passwordRegex,
  slugRegex,
  slugRegexError,
} from '@/lib/utils';
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
  deletable: boolean;
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

export const PaginationSchema = z.object({
  meta: z.object({
    itemsPerPage: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
    currentPage: z.number(),
  }),
  links: z.object({
    first: z.string().optional(),
    previous: z.string().optional(),
    next: z.string().optional(),
    last: z.string().optional(),
    current: z.string(),
  }),
  data: z.array(z.any()),
});

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  deletable: z.boolean(),
});

export const RolesSchema = z.array(RoleSchema);

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
  roles: RolesSchema,
  activeRoles: z.number(),
});

export const UsersSchema = z.array(UserSchema);

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
      password: z
        .string()
        .min(8)
        .max(50)
        .regex(passwordRegex, passWordRegexError),
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
    response: z.object({
      accessToken: z.string(),
    }),
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
      oldPassword: z.string(), //? No validation here
      password: z
        .string()
        .min(8)
        .max(50)
        .regex(passwordRegex, passWordRegexError),
    }),
    response: UserSchema.extend({
      tokens: TokensSchema,
    }),
  },
  getAllTokens: {
    response: PaginationSchema.extend({
      data: z.array(
        z.object({
          id: z.number(),
          ua: z.string(),
          browser: z.object({
            name: z.string().optional(),
            version: z.string().optional(),
            major: z.string().optional(),
          }),
          engine: z.object({
            name: z.string().optional(),
            version: z.string().optional(),
          }),
          os: z.object({
            /**
             * Possible 'os.name'
             * AIX, Amiga OS, Android, Arch, Bada, BeOS, BlackBerry, CentOS, Chromium OS, Contiki,
             * Fedora, Firefox OS, FreeBSD, Debian, DragonFly, Gentoo, GNU, Haiku, Hurd, iOS,
             * Joli, Linpus, Linux, Mac OS, Mageia, Mandriva, MeeGo, Minix, Mint, Morph OS, NetBSD,
             * Nintendo, OpenBSD, OpenVMS, OS/2, Palm, PCLinuxOS, Plan9, Playstation, QNX, RedHat,
             * RIM Tablet OS, RISC OS, Sailfish, Series40, Slackware, Solaris, SUSE, Symbian, Tizen,
             * Ubuntu, UNIX, VectorLinux, WebOS, Windows [Phone/Mobile], Zenwalk
             */
            name: z.string().optional(),
            version: z.string().optional(),
          }),
          device: z.object({
            model: z.string().optional(),
            type: z.string().optional(),
            vendor: z.string().optional(),
          }),
          cpu: z.object({
            architecture: z.string().optional(),
          }),
          lastUsed: z.string(),
          createdAt: z.string(),
          expiresAt: z.string(),
          createdByIp: z.string(),
        }),
      ),
    }),
  },
  revokeToken: {
    response: z.object({
      revoked: z.boolean(),
    }),
  },
  getAllRoles: {
    response: PaginationSchema.extend({
      data: RolesSchema,
    }),
  },
  getAllRolesNoPagination: {
    response: z.object({
      data: RolesSchema,
    }),
  },
  createRole: {
    body: z.object({
      name: z.string().nonempty().regex(slugRegex, slugRegexError),
      displayName: z.string().nonempty(),
      description: z.string().optional(),
      color: z.string().optional(),
    }),
    response: RoleSchema,
  },
  updateRole: {
    body: z.object({
      name: z.string().regex(slugRegex, slugRegexError).optional(),
      displayName: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
    }),
    response: RoleSchema,
  },
  deleteRole: {
    response: z.object({
      deleted: z.boolean(),
    }),
  },
  getAllUsers: {
    response: PaginationSchema.extend({
      data: UsersSchema,
    }),
  },
  getOneUser: {
    response: UserSchema,
  },
  getUserRoles: {
    response: PaginationSchema.extend({
      data: RolesSchema,
    }),
  },
  createUser: {
    body: z.object({
      email: z
        .string()
        .email()
        .optional()
        .transform((v) => (v === '' ? undefined : v)),
      username: z
        .string()
        .min(5)
        .max(50)
        .optional()
        .transform((v) => (v === '' ? undefined : v)),
      firstName: z
        .string()
        .min(2)
        .max(50)
        .optional()
        .transform((v) => (v === '' ? undefined : v)),
      lastName: z
        .string()
        .min(2)
        .max(50)
        .optional()
        .transform((v) => (v === '' ? undefined : v)),
      metadata: z.any().optional(),
      roles: z.array(z.string()).optional(),
    }),
    response: UserSchema,
  },
  updateUser: {
    body: z.object({
      email: z
        .string()
        .email()
        .optional()
        .transform((v) => (v === '' ? undefined : v)),
      username: z
        .string()
        .min(5)
        .max(50)
        .optional()
        .transform((v) => (v === '' ? undefined : v)),
      firstName: z
        .string()
        .min(2)
        .max(50)
        .optional()
        .transform((v) => (v === '' ? undefined : v)),
      lastName: z
        .string()
        .min(2)
        .max(50)
        .optional()
        .transform((v) => (v === '' ? undefined : v)),
      metadata: z.any().optional(),
      roles: z.array(z.string()).optional(),
    }),
    response: UserSchema,
  },
  deleteUser: {
    response: z.object({
      deleted: z.boolean(),
    }),
  },
};
