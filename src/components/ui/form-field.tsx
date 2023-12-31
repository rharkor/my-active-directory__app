import { ControllerRenderProps, Path, UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField as FormFieldComponent,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { PasswordEyeSlash } from '@/components/ui/password-eye-slash';
import { RoleBox } from './role-box';
import { cn } from '@/lib/utils';
import { HTMLInputTypeAttribute } from 'react';

export type FormFieldProps<T extends z.ZodTypeAny> = {
  form: UseFormReturn<z.infer<T>>;
  name: Path<z.TypeOf<T>>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: HTMLInputTypeAttribute | 'role-box' | 'password';
  autoComplete?: string;
  className?: string;
};

function getInner<T extends z.ZodTypeAny>({
  field,
  autoComplete,
  placeholder,
  type,
  form,
}: FormFieldProps<T> & { field: ControllerRenderProps<z.TypeOf<T>> }) {
  if (type === 'role-box') {
    return <RoleBox placeholder={placeholder} form={form} inputProps={field} />;
  } else if (type === 'password') {
    return (
      <PasswordEyeSlash
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...field}
      />
    );
  } else {
    return (
      <Input
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        {...field}
      />
    );
  }
}

export default function FormField<T extends z.ZodTypeAny>({
  form,
  name,
  label,
  placeholder,
  description,
  type,
  autoComplete,
  className,
}: FormFieldProps<T>) {
  return (
    <FormFieldComponent
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(className)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {getInner({
              field,
              form,
              name,
              label,
              placeholder,
              description,
              type,
              autoComplete,
            })}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
