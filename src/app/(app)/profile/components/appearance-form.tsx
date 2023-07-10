'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { toast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from 'next-themes';

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    required_error: 'Please select a theme.',
  }),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

function FormPicker({
  label,
  theme,
  value,
}: {
  label: string;
  theme: 'light' | 'dark';
  value: AppearanceFormValues['theme'];
}) {
  if (theme === 'light') {
    return (
      <FormItem>
        <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
          <FormControl>
            <RadioGroupItem value={value} className="sr-only" />
          </FormControl>
          <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent hover:bg-accent">
            <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
              <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
            </div>
          </div>
          <span className="block w-full p-2 text-center font-normal">
            {label}
          </span>
        </FormLabel>
      </FormItem>
    );
  } else if (theme === 'dark') {
    return (
      <FormItem>
        <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
          <FormControl>
            <RadioGroupItem value={value} className="sr-only" />
          </FormControl>
          <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
            <div className="space-y-2 rounded-sm bg-slate-950 p-2">
              <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-slate-400" />
                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-slate-400" />
                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
              </div>
            </div>
          </div>
          <span className="block w-full p-2 text-center font-normal">
            {label}
          </span>
        </FormLabel>
      </FormItem>
    );
  }
}

export default function AppearanceForm() {
  const theme = useTheme();
  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme:
        theme.theme === 'system'
          ? 'system'
          : theme.theme === 'dark'
          ? 'dark'
          : 'light',
    },
  });

  function onSubmit(data: AppearanceFormValues) {
    theme.setTheme(data.theme);
    toast({
      title: 'Theme updated',
      description: `Your theme has been updated to ${data.theme}.`,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Theme</FormLabel>
              <FormDescription>
                Select the theme for the dashboard.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={(value: 'light' | 'dark' | 'system') =>
                  field.onChange(value)
                }
                defaultValue={field.value}
                className="grid max-w-2xl grid-cols-3 gap-8 pt-2"
              >
                <FormPicker label="Light" theme="light" value={'light'} />
                <FormPicker label="Dark" theme="dark" value={'dark'} />
                <FormPicker
                  label="System"
                  theme={theme.systemTheme ?? 'dark'}
                  value={'system'}
                />
              </RadioGroup>
            </FormItem>
          )}
        />

        <Button type="submit">Update preferences</Button>
      </form>
    </Form>
  );
}
