// @ts-nocheck
/**
 * Form Hook
 * Wrapper around React Hook Form with Zod validation
 */

import { useForm as useRHF, UseFormProps, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export interface UseFormOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: z.ZodSchema<T>;
}

/**
 * Custom form hook with Zod validation
 */
export const useForm = <T extends FieldValues>({ schema, ...options }: UseFormOptions<T>) => {
  return useRHF<T>({
    ...options,
    resolver: zodResolver(schema) as any,
    mode: options.mode || 'onBlur',
  });
};

