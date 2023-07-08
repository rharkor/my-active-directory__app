import Navbar from '@/app/(app)/components/navbar';
import InitState from './components/init-state';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InitState />
      <Navbar />
      {children}
    </>
  );
}
