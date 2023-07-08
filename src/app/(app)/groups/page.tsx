import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Groups() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-6xl font-bold">Groups</h1>
      <div className={cn('flex mt-12')}>
        <Link href="/">
          <Button variant="default">Home</Button>
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