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
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { apiRegisterFirstUser } from '@/lib/api-calls';
import api from '@/lib/api';
import { passWordRegexError, passwordRegex } from '@/lib/utils';
import { logger } from '@/lib/logger';

export const registerFormSchema = z
  .object({
    email: z.string().email(),
    username: z
      .string()
      .min(5, {
        message: 'Username must be at least 5 characters long.',
      })
      .max(50, {
        message: 'Username must be at most 50 characters long.',
      }),
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

export default function LoginForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  //? Define the form state
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof registerFormSchema>) => {
    try {
      //? Submit the form
      setIsSubmitting(true);
      const response = await apiRegisterFirstUser(values);
      //? Set the token in the api client
      api.setTokens(response);
      //? Redirect to the home page
      router.push('/');
    } catch (error) {
      logger.error('Error registering', error);
      if (typeof error === 'string') {
        toast({
          title: 'Error',
          description: error,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Something went wrong.',
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
            <CardTitle>Register</CardTitle>
            <CardDescription>First user registration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <FormField
              form={form}
              name="email"
              label="Email"
              placeholder="Email"
              description="Your email address."
              autoComplete="email"
            />
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
              autoComplete="new-password"
            />
            <FormField
              form={form}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm Password"
              description="Confirm your password."
              type="password"
              autoComplete="new-password"
            />
          </CardContent>
          <CardFooter className="w-full flex justify-end">
            <Button type="submit" isLoading={isSubmitting}>
              Register
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
