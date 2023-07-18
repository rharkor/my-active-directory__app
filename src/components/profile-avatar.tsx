'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserStore } from '@/contexts/user.store';
import { apiUploadFile } from '@/lib/api-calls';
import { cn } from '@/lib/utils';
import { TrashIcon, UploadIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { ChangeEventHandler, useEffect, useRef, useState } from 'react';
import { useToast } from './ui/use-toast';
import { logger } from '@/lib/logger';
import urlJoin from 'url-join';
import { UserSchema } from '@/types/api';
import * as z from 'zod';

export type ProfileAvatarProps = {
  xl?: boolean;
  className?: string;
  user?: z.infer<typeof UserSchema> | null;
  description?: string;
} & (
  | {
      editable?: false;
      onChange?: never;
    }
  | {
      editable: true;
      onChange: (value: string | null | undefined) => void;
    }
);

export default function ProfileAvatar({
  className,
  xl = false,
  editable = false,
  user,
  description,
  onChange,
}: ProfileAvatarProps) {
  const userStoreProfile = useUserStore((state) => state.profile);
  const profile = user ?? userStoreProfile;

  const { toast } = useToast();
  const router = useRouter();

  const inputAvatarRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  //? If profile has avatar, use it
  useEffect(() => {
    if (profile?.metadata?.avatar) setAvatar(profile.metadata.avatar);
  }, [profile]);

  const avatarFallback =
    (profile?.email
      ? profile.email.slice(0, 2).toUpperCase()
      : profile?.username?.slice(0, 2).toUpperCase()) || '';

  let cnExtended = xl ? 'w-32 h-32 text-4xl' : '';

  if (editable) {
    cnExtended = cn(cnExtended, 'cursor-pointer relative');

    //? Change avatar
    const handleAvatarChange: ChangeEventHandler<HTMLInputElement> = async (
      e,
    ) => {
      const file: File | undefined = e.target.files?.[0];
      if (!file) return;

      //? Reset input
      if (inputAvatarRef.current) inputAvatarRef.current.value = '';

      //? Send to server
      try {
        const res = await apiUploadFile(file, router);
        if (!res) return;

        //? Update profile
        setAvatar(res.file.path);
        onChange?.(res.file.path);
      } catch (err) {
        logger.error(err);
        toast({
          title: 'Error',
          description: 'Could not upload avatar.',
        });
        return;
      }
    };

    const handleDeleteAvatar = () => {
      setAvatar(null);
      onChange?.(null);
    };

    return (
      <div className="flex flex-col gap-4 justify-center items-center">
        <div className={cn('relative group flex flex-col gap-4', className)}>
          <Avatar className={cnExtended}>
            <AvatarImage
              src={urlJoin('/api', avatar ?? '')}
              alt="profile picture"
              className="group-hover:opacity-40 transition-all duration-300"
            />
            <AvatarFallback className="group-hover:text-muted-foreground">
              {avatarFallback}
            </AvatarFallback>
            {editable && (
              <label htmlFor="uploadProfilePicture">
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg image/jpg"
                  id="uploadProfilePicture"
                  onChange={handleAvatarChange}
                  ref={inputAvatarRef}
                />
                <div className="cursor-pointer absolute left-0 top-0 h-full w-full flex flex-col justify-center items-center text-white text-opacity-0 group-hover:text-opacity-100 transition-all duration-300">
                  {avatar ? (
                    <span className="text-2xl font-bold">Edit</span>
                  ) : (
                    <UploadIcon className="h-8 w-8" />
                  )}
                </div>
              </label>
            )}
          </Avatar>
          {avatar && (
            <div
              className="absolute top-0 right-0 bg-muted w-7 h-7 rounded-full text-destructive flex justify-center items-center opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-accent hover:text-destructive-foreground transition-all duration-300"
              onClick={handleDeleteAvatar}
            >
              <TrashIcon className="h-5 w-5" />
            </div>
          )}
        </div>
        <p className="text-center text-base text-muted-foreground mt-2">
          {description ?? 'Your profile picture'}
        </p>
      </div>
    );
  }

  return (
    <Avatar className={cnExtended}>
      <AvatarImage src={urlJoin('/api', avatar ?? '')} alt="profile picture" />
      <AvatarFallback>{avatarFallback}</AvatarFallback>
    </Avatar>
  );
}
