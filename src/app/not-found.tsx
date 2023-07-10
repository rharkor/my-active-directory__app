import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Page404() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-2xl">Page not found</p>
      <Button asChild variant={'link'}>
        <Link href="/">Go home</Link>
      </Button>
    </main>
  );
}
