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

export const registerFormSchema = z.object({
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
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.',
    ),
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
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof registerFormSchema>) => {
    try {
      //? Submit the form
      setIsSubmitting(true);
      const response = await apiLogin(values);
      //? Set the token in the api client
      api.setAccessToken(response.access_token);
      //? Redirect to the home page
      router.push('/');
    } catch (error) {
      if (typeof error === 'string') {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'An unknown error occurred.',
          variant: 'destructive',
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
            />
            <FormField
              form={form}
              name="password"
              label="Password"
              placeholder="Password"
              description="Your password."
              type="password"
            />
          </CardContent>
          <CardFooter className="w-full flex justify-end">
            <Button type="submit">
              {isSubmitting && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
