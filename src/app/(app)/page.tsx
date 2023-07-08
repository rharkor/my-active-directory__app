import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-6xl font-bold">Welcome to My Active Directory</h1>
      <div className={cn('flex mt-12')}>
        <Link href="/roles">
          <Button variant="default">Roles</Button>
        </Link>
        <Link href="/service-accounts">
          <Button variant="default" className="ml-6">
            Service Accounts
          </Button>
        </Link>
      </div>
    </main>
  );
}
