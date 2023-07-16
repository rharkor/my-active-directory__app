'use client';

import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FormField from '../../../../components/ui/form-field';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { apiLogin } from '@/lib/auth-calls';
import api from '@/lib/api';
import { logger } from '@/lib/logger';
import { UnknowError } from '@/lib/constants';

export const loginFormSchema = z.object({
  username: z
    .string()
    .min(5, {
      message: 'Username must be at least 5 characters long.',
    })
    .max(50, {
      message: 'Username must be at most 50 characters long.',
    }),
  password: z.string(),
});

export default function LoginForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  //? Define the form state
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    try {
      //? Submit the form
      setIsSubmitting(true);
      const response = await apiLogin(values);
      //? Set the token in the api client
      api.setTokens(response);
      //? Redirect to the home page
      router.push('/');
    } catch (error) {
      logger.error('Error login', error);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Login to your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <FormField
              form={form}
              name="username"
              label="Username"
              placeholder="Username"
              description="Your username."
              autoComplete="username"
            />
            <FormField
              form={form}
              name="password"
              label="Password"
              placeholder="Password"
              description="Your password."
              type="password"
              autoComplete="current-password"
            />
          </CardContent>
          <CardFooter className="w-full flex justify-end">
            <Button type="submit">
              {isSubmitting && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Login
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
