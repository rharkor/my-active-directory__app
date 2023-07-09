import urlJoin from 'url-join';
import { redirect } from 'next/navigation';
import Cookies, { CookieSetOptions } from 'universal-cookie';
import { ApiError, ApiSchemas } from '@/types/api';
import * as z from 'zod';
import { NextResponse } from 'next/server';
import { logger } from './logger';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';

const API_URL = process.env.API_URL || '/api';

const _handleRequest = async (
  res: Response,
  isLogin = false,
  router?: AppRouterInstance,
) => {
  //? If the response is not ok, throw the error
  if (!res.ok) {
    //? If the response is a 401, redirect to the login page
    if (res.status === 401 && !isLogin) {
      logger.debug('Unauthorized request, redirecting to login page');
      if (router) {
        router.push('/auth/login');
      } else {
        return redirect('/auth/login');
      }
    }
    //? Otherwise, throw the error
    let jsonError: ApiError;
    try {
      // The error may be a json object
      jsonError = (await res.json()) as ApiError;
    } catch (error) {
      //? The error is not a json object
      throw res.statusText;
    }
    //* Checking the type of the error and return the message
    //? If the error is a string
    if (typeof jsonError.error === 'string') throw jsonError.error;
    //? If the error is an object
    if (typeof jsonError.error.message === 'string')
      throw jsonError.error.message;
    //? If the error is an array
    if (Array.isArray(jsonError.error.message))
      throw jsonError.error.message.join(', ');
    //? Otherwise, throw the error as it is
    throw jsonError.error.error;
  }
  //? If all ok, return the response
  return res.json();
};

type CustomHeadersInit = HeadersInit & {
  Authorization?: string;
  'Content-Type'?: string;
};

const _haveAuthorization = (options?: RequestInit) => {
  if (!options) return false;
  if (!options.headers) return false;
  if ((options.headers as CustomHeadersInit).Authorization === undefined)
    return false;
  return true;
};

const _haveContentType = (options?: RequestInit) => {
  if (!options) return false;
  if (!options.headers) return false;
  if ((options.headers as CustomHeadersInit)['Content-Type'] === undefined)
    return false;
  return true;
};

const api = {
  _accessToken: '',
  _refreshToken: '',
  fetch: async (
    path: string,
    options?: RequestInit,
    router?: AppRouterInstance,
    refreshTokens = true,
    setContentType = true,
  ) => {
    //* Refresh credentials before each request
    if (refreshTokens)
      try {
        //? Refresh the token
        const tokens = await api.refreshToken(
          api.getAccessToken(),
          api.getRefreshToken(),
        );
        //? Store the access token in the cookies
        api.setTokens(tokens);
      } catch (error) {
        logger.error(`Error refreshing the token`, error);
      }
    try {
      const apiUrl = API_URL;

      //* Modify the headers
      //? Include the access token
      const headers: {
        [key: string]: string;
      } = {};
      const accessToken = api.getAccessToken();
      if (accessToken && !_haveAuthorization(options)) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      //? Include the content type
      if (setContentType && !_haveContentType(options)) {
        headers['Content-Type'] = 'application/json';
      }

      //? Include the headers
      options = {
        ...options,
        headers: {
          ...headers,
          ...options?.headers,
        },
      };

      const res = await fetch(urlJoin(apiUrl, path), {
        ...options,
      });
      logger.debug(`[api] ${path} - ${res.status} ${res.statusText}`);
      //? Handle the response (await because of error handling)
      const finalResult = await _handleRequest(
        res,
        path === '/auth/login',
        router,
      );
      return finalResult;
    } catch (error) {
      logger.error(`Error fetching ${path}`, error);
      //? If there is an error, throw it
      throw error;
    }
  },
  refreshToken: async (
    accessToken: string,
    refreshToken: string,
    headers?: HeadersInit,
  ) => {
    try {
      //? Send the request to the API
      const res = (await api.fetch(
        '/auth/refresh',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-refresh': refreshToken,
            ...headers,
          },
        },
        undefined,
        false,
      )) as z.infer<typeof ApiSchemas.refreshToken.response>;
      return res;
    } catch (error) {
      logger.error(`Error refreshing the token`, error);
      //? If there is an error, throw it
      throw error;
    }
  },
  getAccessToken: () => {
    if (api._accessToken) return api._accessToken;
    const cookies = new Cookies();
    const accessToken = cookies.get('mad-session');
    if (accessToken) api._accessToken = accessToken;
    return accessToken;
  },
  getRefreshToken: () => {
    if (api._refreshToken) return api._refreshToken;
    const cookies = new Cookies();
    const refreshToken = cookies.get('mad-refresh');
    if (refreshToken) api._refreshToken = refreshToken;
    return refreshToken;
  },
  setTokens: (
    tokens: z.infer<typeof ApiSchemas.login.response>,
    response?: NextResponse<unknown>,
  ) => {
    const cookiesOptions: CookieSetOptions = {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, //? 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };

    const isClientCookies = !response;
    if (isClientCookies) {
      //* Store the access token in the cookies
      const cookies = new Cookies();

      //? Set the access token
      cookies.set('mad-session', tokens.accessToken, cookiesOptions);
      api._accessToken = tokens.accessToken;

      //? Set the refresh token
      cookies.set('mad-refresh', tokens.refreshToken, cookiesOptions);
      api._refreshToken = tokens.refreshToken;
    } else {
      //* Store the access token in the cookies
      //? Set the access token
      response.cookies.set({
        name: 'mad-session',
        value: tokens.accessToken,
        ...cookiesOptions,
      });
      api._accessToken = tokens.accessToken;

      //? Set the refresh token
      response.cookies.set({
        name: 'mad-refresh',
        value: tokens.refreshToken,
        ...cookiesOptions,
      });
      api._refreshToken = tokens.refreshToken;
    }
  },
  removeTokens: () => {
    //* Remove the access token from the cookies
    const cookies = new Cookies();
    cookies.remove('mad-session', {
      path: '/',
    });
    api._accessToken = '';

    //* Remove the refresh token from the cookies
    cookies.remove('mad-refresh', {
      path: '/',
    });
    api._refreshToken = '';
  },
};

export default api;
