/**
 * ControlledPasswordInput Component
 * React Hook Form controlled PasswordInput component
 */

import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { PasswordInput, PasswordInputProps } from '../ui/PasswordInput';

export interface ControlledPasswordInputProps<T extends FieldValues>
  extends Omit<PasswordInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
}

export const ControlledPasswordInput = <T extends FieldValues>({
  control,
  name,
  ...inputProps
}: ControlledPasswordInputProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <PasswordInput
          {...inputProps}
          value={value?.toString() || ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  );
};
