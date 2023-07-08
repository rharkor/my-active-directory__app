'use client';

import React, { useState } from 'react';
import { Input, InputProps } from './input';
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';

const PasswordEyeSlash = React.forwardRef<HTMLInputElement, InputProps>(
  (field: InputProps, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input type={showPassword ? 'text' : 'password'} ref={ref} {...field} />
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500 absolute right-0 top-0 px-3 flex items-center justify-center h-full"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
        </button>
      </div>
    );
  },
);
PasswordEyeSlash.displayName = 'PasswordEyeSlash';

export { PasswordEyeSlash };
