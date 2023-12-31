import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import ProfileAvatar from '../../../components/profile-avatar';
import NavbarLogout from './navbar-logout';

export default function NavbarUserDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="mr-6">
        <ProfileAvatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" passHref>
              Profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="mailto:louis@huort.com" passHref target="_blank">
              Support
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/api/api" passHref target="_blank">
              API
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <NavbarLogout />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
