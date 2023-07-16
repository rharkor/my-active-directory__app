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
import { apiUpdatePassword } from '@/lib/auth-calls';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { DialogClose } from '@radix-ui/react-dialog';
import api from '@/lib/api';
import { passWordRegexError, passwordRegex } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export const passwordFormSchema = z
  .object({
    id: z.string(),
    oldPassword: z.string(),
    password: z
      .string()
      .min(8, {
        message: 'Password must be at least 8 characters long.',
      })
      .max(50, {
        message: 'Password must be at most 50 characters long.',
      })
      .regex(passwordRegex, passWordRegexError),
    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        fatal: true,
        path: ['confirmPassword'],
      });
    }
  });

export default function PasswordForm({
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
    oldPassword: 'Loading...',
    password: 'Loading...',
    confirmPassword: 'Loading...',
  };

  //? Define the form state
  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      id: profile?.id.toString() ?? '',
      oldPassword: '',
      password: '',
      confirmPassword: '',
      ...(skeleton ? skeletonValues : {}),
    },
  });

  //? Update the form values when the profile changes
  useEffect(() => {
    if (profile) {
      form.setValue('id', profile.id.toString());
    }
  }, [profile, form]);

  const onSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      //? Submit the form
      setIsSubmitting(true);
      //? Transform the form values
      const newValues: z.infer<typeof ApiSchemas.updatePassword.body> =
        ApiSchemas.updatePassword.body.parse(values);
      const res = await apiUpdatePassword(values.id, newValues, router);
      //? Set the token in the api client
      api.setTokens(res.tokens);
      toast({
        title: 'Success',
        description: successMessage ?? 'Password updated successfully.',
        duration: 5000,
      });
      //? Refresh the profile (do not await this)
      loadProfile(router);
      //? Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      logger.error(errorMessage ?? 'Error updating password', error);
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
        <h4 className="text-sm font-medium text-muted-foreground">Password</h4>
        <div className="flex flex-row space-x-4">
          <Input disabled value={'******'} type="password" />
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
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your old and new password below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    form={form}
                    name="oldPassword"
                    label="Old Password"
                    type="password"
                    placeholder="Old Password"
                    autoComplete="password"
                    description="Enter your old password."
                  />
                </div>
                <Separator />
                <div className="space-y-4">
                  <FormField
                    form={form}
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="Password"
                    autoComplete="password"
                    description="Enter your new password."
                  />
                  <FormField
                    form={form}
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm Password"
                    autoComplete="password"
                    description="Confirm your new password."
                  />
                </div>
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
