import { getIsBackendInitialized } from '@/lib/auth';
import { redirect } from 'next/navigation';

//? This part is not done from the middleware because middlewares do not cache the result
export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //* Check if the backend is initialized
  const isBackendInitialized = await getIsBackendInitialized();
  //? If the backend is not initialized, redirect to the initialization page
  if (!isBackendInitialized) {
    redirect('/auth/initialize');
  }

  return <>{children}</>;
}
