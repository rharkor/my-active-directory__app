'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useUsersStore } from '@/contexts/users.store';
import { apiUpdateUser } from '@/lib/auth-calls';
import { UnknowError } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { UserSchema } from '@/types/api';
import { Editor } from '@monaco-editor/react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as z from 'zod';

export default function UserMetadata({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const user: z.infer<typeof UserSchema> | undefined = useUsersStore(
    (state) => state.users[userId],
  );
  const loadUser = useUsersStore((state) => state.loadUser);

  const [value, setValue] = useState<string | undefined>(
    JSON.stringify(user.metadata ?? undefined, null, 2),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  //? When the user changes, update the value
  useEffect(() => {
    setValue(JSON.stringify(user.metadata ?? undefined, null, 2));
  }, [user]);

  const refreshCallback = useCallback(async () => {
    await loadUser(userId, router);
  }, [loadUser, router, userId]);

  const onSubmit = useCallback(async () => {
    try {
      //? Submit the form
      setIsSubmitting(true);
      let valueParsed: unknown;
      try {
        valueParsed = value ? JSON.parse(value) : undefined;
      } catch (error) {
        throw 'Invalid JSON';
      }
      await apiUpdateUser(
        user.id.toString(),
        { metadata: valueParsed },
        router,
      );
      refreshCallback();

      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
        duration: 5000,
      });
    } catch (error) {
      logger.error('Error updating profile', error);
      if (typeof error === 'string') {
        toast({
          title: 'Error',
          description: error,
        });
      } else {
        toast({
          title: 'Error',
          description: UnknowError,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [user, value, refreshCallback, router]);

  useEffect(() => {
    if (!editorRef.current) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        onSubmit();
      }
    };

    const ref = editorRef.current;
    ref.addEventListener('keydown', down);
    return () => ref.removeEventListener('keydown', down);
  }, [onSubmit, editorRef]);

  return (
    <section className="space-y-6 mb-8 flex flex-col h-full">
      <header>
        <h3 className="text-lg font-medium">Metadata</h3>
        <p className="text-sm text-muted-foreground">
          This is where you can edit user metadata (all kind of information you
          want).
        </p>
      </header>
      <div className="flex-1 pb-4 max-h-[600px] relative" ref={editorRef}>
        <Editor
          language="json"
          theme="vs-dark"
          value={value}
          onChange={setValue}
          loading={
            <ReloadIcon className="w-6 h-6 animate-spin text-muted-foreground" />
          }
        />
        <Button
          className="absolute bottom-8 right-4"
          onClick={onSubmit}
          isLoading={isSubmitting}
        >
          Save Changes
        </Button>
      </div>
    </section>
  );
}
