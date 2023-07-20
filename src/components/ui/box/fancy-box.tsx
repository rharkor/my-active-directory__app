'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { InputProps } from '@/components/ui/input';
import { Cross2Icon } from '@radix-ui/react-icons';
import * as z from 'zod';
import { UseFormReturn } from 'react-hook-form';

export const badgeStyle = (color: string) => ({
  borderColor: `${color}20`,
  backgroundColor: `${color}30`,
  color,
});

export type FancyBoxItem = {
  value: string;
  label: string;
  color?: string;
};

export type FancyBoxProps = {
  inputProps: InputProps;
  items: FancyBoxItem[];
  placeholder?: string;
  commandPlaceholder?: string;
  form: UseFormReturn<z.infer<z.ZodTypeAny>>;
};

export const FancyBox = React.forwardRef<HTMLInputElement, FancyBoxProps>(
  (props: FancyBoxProps, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [openCombobox, setOpenCombobox] = React.useState(false);
    const [inputValue, setInputValue] = React.useState<string>('');
    const [selectedValues, setSelectedValues] = React.useState<FancyBoxItem[]>(
      [],
    );

    const toggleFramework = (item: FancyBoxItem) => {
      const newItems = !selectedValues.includes(item)
        ? [...selectedValues, item]
        : selectedValues.filter((i) => i.value !== item.value);
      setSelectedValues(newItems);
      props.form.setValue(
        props.inputProps.name ?? '',
        newItems.map((i) => i.value),
      );
    };

    const valuesWatched: string[] = props.form.watch(
      props.inputProps.name ?? '',
      [],
    );

    React.useEffect(() => {
      if (valuesWatched.length > 0) {
        setSelectedValues(
          props.items.filter((item) => valuesWatched.includes(item.value)),
        );
      }
    }, [valuesWatched, props.items, props.inputProps.name]);

    const onComboboxOpenChange = (value: boolean) => {
      inputRef.current?.blur();
      setOpenCombobox(value);
    };

    return (
      <div ref={ref}>
        <Popover open={openCombobox} onOpenChange={onComboboxOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCombobox}
              aria-haspopup="listbox"
              aria-owns="listbox"
              aria-controls="listbox"
              className="w-[300px] justify-between text-foreground"
            >
              <span className="truncate">{props.placeholder}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command loop>
              <CommandInput
                ref={inputRef}
                placeholder={props.commandPlaceholder}
                value={inputValue}
                onValueChange={setInputValue}
              />
              <CommandGroup className="max-h-[145px] overflow-auto">
                {props.items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={() => toggleFramework(item)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedValues.includes(item)
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    <div className="flex-1">{item.label}</div>
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="relative mt-3 overflow-y-auto">
          {selectedValues.map((item) => (
            <Badge
              key={item.value}
              variant="outline"
              style={badgeStyle(item.color ?? 'var(--foreground)')}
              className="mr-2 mb-2 group relative hover:pl-6 transition-all overflow-hidden cursor-pointer"
              onClick={() => toggleFramework(item)}
            >
              <Cross2Icon className="mr-1 -translate-x-full cursor-pointer group-hover:translate-x-0 transition-all absolute left-1 h-4 w-4 group-hover:opacity-100 opacity-0" />
              {item.label}
            </Badge>
          ))}
        </div>
      </div>
    );
  },
);
FancyBox.displayName = 'FancyBox';
