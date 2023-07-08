import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { apiBackendInitialized } from './auth-calls';
import Cookies from 'universal-cookie';
import jwt_decode from 'jwt-decode';
import api from './api';
import { TokenDecoded } from '@/types/api';
import { logger } from './logger';

/**
 * Get the user session from the request cookies
 * @returns The user session or null
 */
export function getUserSession(cookies: RequestCookies | Cookies) {
  //? Get the session from the request
  let session: string | undefined;
  if (cookies instanceof Cookies) session = cookies.get('mad-session');
  else session = cookies.get('mad-session')?.value;

  //? If there is no session, return null
  if (!session) return null;

  //* Decode access token, if expired refresh it
  try {
    const accessToken = jwt_decode(session) as TokenDecoded;
    const isExpired = accessToken.exp * 1000 < Date.now();
    if (isExpired) {
      logger.debug('accessToken expired');
    } else {
      logger.debug(
        'accessToken expire in',
        (accessToken.exp * 1000 - Date.now()) / 1000,
        'seconds',
      );
    }

    if (isExpired) {
      //? Get the refresh token from the request
      let refreshToken: string | undefined;
      if (cookies instanceof Cookies) refreshToken = cookies.get('mad-refresh');
      else refreshToken = cookies.get('mad-refresh')?.value;
      //? If there is no refresh token, return null
      if (!refreshToken) return null;
      //? Refresh the token
      api.refreshToken(session, refreshToken);
    }

    //? Return user session
    return accessToken;
  } catch (error) {
    console.error('Error decoding the access token', error);
    return null;
  }
}

/**
 * Check if the backend have already a user registered
 * @returns True if the backend is initialized, false otherwise
 */
export async function getIsBackendInitialized() {
  //? Get the backend initialization status
  const { initialized } = await apiBackendInitialized();
  return initialized;
}
