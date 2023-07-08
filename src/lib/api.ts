import urlJoin from 'url-join';
import { redirect } from 'next/navigation';
import Cookies from 'universal-cookie';
import { ApiError } from '@/types/api';

const API_URL_SERVER = process.env.API_URL || 'http://localhost:3001';
const API_URL_CLIENT = '/api';

const _handleRequest = async (res: Response, isLogin = false) => {
  //? If the response is not ok, throw the error
  if (!res.ok) {
    //? If the response is a 401, redirect to the login page
    if (res.status === 401 && !isLogin) {
      redirect('/auth/login');
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
  if (!(options.headers as CustomHeadersInit).Authorization) return false;
  return true;
};

const _haveContentType = (options?: RequestInit) => {
  if (!options) return false;
  if (!options.headers) return false;
  if (!(options.headers as CustomHeadersInit)['Content-Type']) return false;
  return true;
};

const api = {
  _accessToken: '',
  fetch: async (
    path: string,
    options?: RequestInit,
    fetchFromClient = false,
  ) => {
    try {
      const apiUrl = fetchFromClient ? API_URL_CLIENT : API_URL_SERVER;

      //* Modify the headers
      //? Include the access token
      if (api._accessToken && !_haveAuthorization(options)) {
        options = {
          ...options,
          headers: {
            ...options?.headers,
            Authorization: api._accessToken,
          },
        };
      }
      //? Include the content type
      if (!_haveContentType(options)) {
        options = {
          ...options,
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
          },
        };
      }
      //? Send the request to the API
      const res = await fetch(urlJoin(apiUrl, path), {
        ...options,
      });
      //? Handle the response (await because of error handling)
      const finalResult = await _handleRequest(res, path === '/auth/login');
      return finalResult;
    } catch (error) {
      console.error(`Error fetching ${path}`, error);
      //? If there is an error, throw it
      throw error;
    }
  },
  setAccessToken: (accessToken: string) => {
    //? Store the access token in the cookies
    const cookies = new Cookies();
    cookies.set('mad-session', accessToken, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, //? 30 days
    });
    //? Set the access token
    api._accessToken = accessToken;
  },
};

export default api;