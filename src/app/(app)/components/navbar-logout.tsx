import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function NavbarLogout() {
  const router = useRouter();

  return <DropdownMenuItem onClick={logout(router)}>Log out</DropdownMenuItem>;
}
