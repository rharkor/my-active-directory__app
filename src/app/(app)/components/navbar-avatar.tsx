'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserStore } from '@/contexts/user.store';

export function NavbarAvatar() {
  const profile = useUserStore((state) => state.profile);

  const avatarFallback =
    (profile?.email
      ? profile.email.slice(0, 2).toUpperCase()
      : profile?.username?.slice(0, 2).toUpperCase()) || '??';

  return (
    <Avatar>
      <AvatarImage />
      <AvatarFallback>{avatarFallback}</AvatarFallback>
    </Avatar>
  );
}
