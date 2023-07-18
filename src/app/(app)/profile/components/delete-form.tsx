'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import FormField from '@/components/ui/form-field';
import { useToast } from '@/components/ui/use-toast';
import { useUserStore } from '@/contexts/user.store';
import { apiDeleteUser } from '@/lib/api-calls';
import { UnknowError } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { ApiSchemas, UserSchema } from '@/types/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

export const deleteFormSchema = z.object({
  id: z.string(),
  username: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  email: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  password: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export default function DeleteForm({
  user,
  buttonMessage,
  confirmMessage,
  skeleton,
  successMessage,
  errorMessage,
  forceDelete,
}: {
  user?: z.infer<typeof UserSchema>;
  buttonMessage?: string;
  confirmMessage?: string | React.ReactNode;
  skeleton?: boolean;
  successMessage?: string;
  errorMessage?: string;
  forceDelete?: boolean;
}) {
  const userStoreProfile = useUserStore((state) => state.profile);
  const profile = user ?? userStoreProfile;

  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  //? Define the skeleton values
  const skeletonValues = {
    id: 'Loading...',
    username: 'Loading...',
    email: 'Loading...',
    password: 'Loading...',
  };

  //? Define the form state
  const form = useForm<z.infer<typeof deleteFormSchema>>({
    resolver: zodResolver(deleteFormSchema),
    defaultValues: {
      id: profile?.id.toString() ?? '',
      username: '',
      email: '',
      password: '',
      ...(skeleton ? skeletonValues : {}),
    },
  });

  //? Update the form values when the profile changes
  useEffect(() => {
    if (profile) {
      form.setValue('id', profile.id.toString());
    }
  }, [profile, form]);

  const onSubmit = async (values: z.infer<typeof deleteFormSchema>) => {
    try {
      //? Submit the form
      setIsSubmitting(true);
      //? Values with force delete added
      const newValues: z.infer<typeof ApiSchemas.deleteUser.body> =
        ApiSchemas.deleteUser.body.parse({
          ...values,
          force: forceDelete ?? false,
        });
      await apiDeleteUser(values.id, newValues, router);
      toast({
        title: 'Success',
        description: successMessage ?? 'Account deleted successfully',
      });
      router.push('/');
    } catch (error) {
      logger.error(
        errorMessage ?? 'Error deleting account, please contact support',
        error,
      );
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
  };

  return (
    <section>
      <header>
        <h3 className="text-lg font-medium">Delete Account</h3>
      </header>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="mt-4">
            {buttonMessage || 'Delete Your Account'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 flex flex-col"
            >
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {confirmMessage ||
                    'This action cannot be undone. This will permanently delete your account and remove your data from our servers.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              {!forceDelete && (
                <div className="space-y-4">
                  {profile?.username ? (
                    <FormField
                      form={form}
                      name="username"
                      label="Username"
                      type="text"
                      placeholder="Username"
                      autoComplete="username"
                      description="Enter your username."
                    />
                  ) : (
                    <FormField
                      form={form}
                      name="email"
                      label="Email"
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      description="Enter your email."
                    />
                  )}
                  <FormField
                    form={form}
                    name="password"
                    label="Your Password"
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    description="Enter your password."
                  />
                </div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    variant="destructive"
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    Delete
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
