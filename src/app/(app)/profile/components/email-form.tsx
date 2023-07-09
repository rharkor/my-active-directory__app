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
import { ApiSchemas } from '@/types/api';
import { apiUpdateProfile } from '@/lib/auth-calls';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { DialogClose } from '@radix-ui/react-dialog';
import api from '@/lib/api';

export const emailFormSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

export default function EmailForm() {
  const profile = useUserStore((state) => state.profile);
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //? Define the form state
  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      id: profile?.id.toString() ?? '',
      email: profile?.email ?? '',
    },
  });

  //? Update the form values when the profile changes
  useEffect(() => {
    if (profile) {
      form.setValue('id', profile.id.toString());
      form.setValue('email', profile.email ?? '');
    }
  }, [profile, form]);

  const onSubmit = async (values: z.infer<typeof emailFormSchema>) => {
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
        description: 'Email updated successfully.',
        duration: 5000,
      });
      //? Refresh the profile (do not await this)
      useUserStore.getState().loadProfile(router);
      //? Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      logger.error('Error updating email', error);
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
        <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
        <div className="flex flex-row space-x-4">
          <Input disabled value={profile?.email ?? ''} />
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
                <DialogTitle>Change Email</DialogTitle>
                <DialogDescription>
                  Enter your new email address below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <FormField
                  form={form}
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
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
