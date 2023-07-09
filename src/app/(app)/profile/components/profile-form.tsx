'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import ProfileAvatar from '../../../../components/profile-avatar';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/ui/form';
import FormField from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useUserStore } from '@/contexts/user.store';
import { logger } from '@/lib/logger';
import { apiUpdateProfile } from '@/lib/auth-calls';
import { ApiSchemas } from '@/types/api';

export const profileNameFormSchema = z.object({
  id: z.string(),
  firstName: z
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  lastName: z
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  profilePicture: z
    .string()
    .optional()
    .nullable()
    .transform((value) => (value === '' ? undefined : value)),
});

export default function ProfileForm() {
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  //? Define the form state
  const form = useForm<z.infer<typeof profileNameFormSchema>>({
    resolver: zodResolver(profileNameFormSchema),
    defaultValues: {
      id: profile?.id.toString() ?? '',
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      profilePicture: profile?.metadata?.avatar ?? '',
    },
  });

  //? Update the form values when the profile changes
  useEffect(() => {
    if (profile) {
      form.setValue('id', profile.id.toString());
      form.setValue('firstName', profile.firstName ?? '');
      form.setValue('lastName', profile.lastName ?? '');
      form.setValue('profilePicture', profile.metadata?.avatar ?? '');
    }
  }, [profile, form]);

  //? Handle form submission
  const onSubmit = async (values: z.infer<typeof profileNameFormSchema>) => {
    try {
      //? Submit the form
      setIsSubmitting(true);
      //? Transform the form values
      const newValues: z.infer<typeof ApiSchemas.updateProfile.body> =
        ApiSchemas.updateProfile.body.parse(values);
      if (values.profilePicture !== undefined) {
        if (!newValues.metadata) newValues.metadata = {};
        newValues.metadata.avatar = values.profilePicture;
      }
      await apiUpdateProfile(values.id, newValues, router);
      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
        duration: 5000,
      });
      //? Refresh the profile (do not await this)
      useUserStore.getState().loadProfile(router);
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
          description: 'An unknown error occurred.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 flex flex-col"
      >
        <Card>
          <CardContent className="flex flex-col md:flex-row gap-4 justify-between pt-6">
            <div className="flex-[0.7] flex justify-center items-center">
              <ProfileAvatar
                xl
                editable
                onChange={(value) => form.setValue('profilePicture', value)}
              />
            </div>
            <div className="flex flex-col flex-[1.2]">
              <FormField
                form={form}
                name="firstName"
                label="First Name"
                placeholder="First Name"
                description="Your first name."
                autoComplete="given-name"
              />
              <FormField
                form={form}
                name="lastName"
                label="Last Name"
                placeholder="Last Name"
                description="Your last name."
                autoComplete="family-name"
              />
            </div>
          </CardContent>
          <CardFooter className="w-full flex justify-end">
            <Button type="submit">
              {isSubmitting && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
