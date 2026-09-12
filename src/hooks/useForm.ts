'use client';

import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { FormErrors, FormTouched } from '@/types/validation';

export interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validate?: (values: T) => FormErrors<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (validate) {
        const nextErrors = validate(next);
        setErrors(nextErrors);
      }
      return next;
    });
  }, [validate]);

  const setFieldError = useCallback((field: keyof T, error: string | undefined) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      const fieldValue = type === 'checkbox' ? checked : value;

      setFieldValue(name as keyof T, fieldValue);
    },
    [setFieldValue]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validate) {
        const currentErrors = validate(values);
        setErrors(currentErrors);
      }
    },
    [validate, values]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault();

      let validationErrors: FormErrors<T> = {};
      if (validate) {
        validationErrors = validate(values);
        setErrors(validationErrors);
      }

      // Marca todos os campos como tocados ao submeter
      const allTouched: FormTouched<T> = {};
      for (const key in values) {
        allTouched[key] = true;
      }
      setTouched(allTouched);

      // Impede submit se houver algum erro
      const hasErrors = Object.values(validationErrors).some((err) => !!err);
      if (hasErrors) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err) {
        console.error('Erro ao submeter formulário:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    resetForm,
    handleSubmit,
  };
}
