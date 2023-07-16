'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/contexts/user.store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import { Form } from '@/components/ui/form';
import FormField from '@/components/ui/form-field';
import { ReloadIcon } from '@radix-ui/react-icons';
import { ApiSchemas, UserSchema } from '@/types/api';
import { apiUpdateProfile } from '@/lib/auth-calls';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { DialogClose } from '@radix-ui/react-dialog';
import api from '@/lib/api';

export const usernameFormSchema = z.object({
  id: z.string(),
  username: z
    .string()
    .min(5, 'Username must be at least 5 characters long.')
    .max(50, {
      message: 'Username must be at most 50 characters long.',
    }),
});

export default function UsernameForm({
  user,
  skeleton,
  successMessage,
  errorMessage,
}: {
  user?: z.infer<typeof UserSchema>;
  skeleton?: boolean;
  successMessage?: string;
  errorMessage?: string;
}) {
  const userStoreProfile = useUserStore((state) => state.profile);
  const loadProfile = useUserStore((state) => state.loadProfile);
  const profile = user ?? userStoreProfile;

  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //? Define the skeleton values
  const skeletonValues = {
    username: 'Loading...',
  };

  //? Define the form state
  const form = useForm<z.infer<typeof usernameFormSchema>>({
    resolver: zodResolver(usernameFormSchema),
    defaultValues: {
      id: profile?.id.toString() ?? '',
      username: profile?.username ?? '',
      ...(skeleton ? skeletonValues : {}),
    },
  });

  //? Update the form values when the profile changes
  useEffect(() => {
    if (profile) {
      form.setValue('id', profile.id.toString());
      form.setValue('username', profile.username ?? '');
    }
  }, [profile, form]);

  const onSubmit = async (values: z.infer<typeof usernameFormSchema>) => {
    try {
      //? Submit the form
      setIsSubmitting(true);
      //? Transform the form values
      const newValues: z.infer<typeof ApiSchemas.updateProfile.body> =
        ApiSchemas.updateProfile.body.parse(values);
      const res = await apiUpdateProfile(values.id, newValues, router);
      //? Set the token in the api client
      api.setTokens(res.tokens);
      toast({
        title: 'Success',
        description: successMessage ?? 'Username updated successfully.',
        duration: 5000,
      });
      //? Refresh the profile (do not await this)
      loadProfile(router);
      //? Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      logger.error(errorMessage ?? 'Error updating username', error);
      if (typeof error === 'string') {
        toast({
          title: 'Error',
          description: error,
        });
      } else {
        toast({
          title: 'Error',
          description: 'An unknown error occurred.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(isOpen) => setIsDialogOpen(isOpen)}
    >
      <div className="space-y-2 mt-4">
        <h4 className="text-sm font-medium text-muted-foreground">Username</h4>
        <div className="flex flex-row space-x-4">
          <Input disabled value={profile?.username ?? ''} />
          <DialogTrigger asChild>
            <Button variant="secondary">Change</Button>
          </DialogTrigger>
        </div>
        <DialogContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 flex flex-col"
            >
              <DialogHeader>
                <DialogTitle>Change Username</DialogTitle>
                <DialogDescription>
                  Enter your new username below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <FormField
                  form={form}
                  name="username"
                  label="Username"
                  type="username"
                  placeholder="Username"
                  autoComplete="username"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  {isSubmitting && (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </div>
    </Dialog>
  );
}
