import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { ReloadIcon } from '@radix-ui/react-icons';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-8 px-2 rounded-md',
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  reloadIcon?: React.ReactNode;
  disabledWhileLoading?: boolean;
}

const Loading = ({
  isLoading,
  reloadIcon,
}: {
  isLoading?: boolean;
  reloadIcon?: React.ReactNode;
}) => {
  return (
    isLoading &&
    (reloadIcon ?? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />)
  );
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
      reloadIcon,
      disabledWhileLoading = true,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    if (asChild) {
      const newChildren = React.cloneElement(
        props.children as React.ReactElement,
        {
          children: (
            <>
              <Loading isLoading={isLoading} reloadIcon={reloadIcon} />
              {props.children}
            </>
          ),
        },
      );
      props.children = newChildren;
    } else {
      props.children = (
        <>
          <Loading isLoading={isLoading} reloadIcon={reloadIcon} />
          {props.children}
        </>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        disabled={disabledWhileLoading && isLoading ? true : props.disabled}
      >
        {props.children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
