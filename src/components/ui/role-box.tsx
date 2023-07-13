import { FancyBox } from './fancy-box';

import { InputProps } from './input';
import React from 'react';

export const RoleBox = React.forwardRef<
  HTMLInputElement,
  InputProps & {
    placeholder?: string;
  }
>(
  (
    field: InputProps & {
      placeholder?: string;
    },
    ref,
  ) => {
    return <FancyBox {...field} ref={ref} />;
  },
);
RoleBox.displayName = 'RoleBox';
