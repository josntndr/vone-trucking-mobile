/**
 * ControlledInput Component
 * React Hook Form controlled Input component
 */

import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Input, InputProps } from '../ui/Input';

export interface ControlledInputProps<T extends FieldValues> extends Omit<InputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
}

export const ControlledInput = <T extends FieldValues>({
  control,
  name,
  ...inputProps
}: ControlledInputProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
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
