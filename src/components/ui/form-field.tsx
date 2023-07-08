import { Path, UseFormReturn } from 'react-hook-form';
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

export default function FormField<T extends z.ZodTypeAny>({
  form,
  name,
  label,
  placeholder,
  description,
  type,
}: {
  form: UseFormReturn<z.infer<T>>;
  name: Path<z.TypeOf<T>>;
  label: string;
  placeholder: string;
  description: string;
  type?: string;
}) {
  return (
    <FormFieldComponent
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {type === 'password' ? (
              <PasswordEyeSlash placeholder={placeholder} {...field} />
            ) : (
              <Input placeholder={placeholder} type={type} {...field} />
            )}
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
