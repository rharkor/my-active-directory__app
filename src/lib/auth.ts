import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { apiBackendInitialized } from './auth-calls';
import Cookies from 'universal-cookie';

/**
 * Get the user session from the request cookies
 * @returns The user session or null
 */
export function getUserSession(cookies: RequestCookies | Cookies) {
  //? Get the session from the request
  const session = cookies.get('mad-session');
  //? If there is no session, return null
  if (!session) return null;
  //? Otherwise, return the session
  return session;
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
