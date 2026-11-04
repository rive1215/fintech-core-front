import { z } from 'zod';

/**
 * Espejo de RegisterUserSchema / LoginSchema del backend
 * (docs/frontend/frontend-validation.md + presentation/dto/AuthDTOs.ts).
 */
export const registerFormSchema = z.object({
  name: z
    .string({ error: 'El nombre completo es requerido' })
    .min(3, { error: 'El nombre completo debe tener al menos 3 caracteres' })
    .max(100, { error: 'El nombre completo no puede exceder 100 caracteres' }),
  email: z.email({ error: 'Formato de correo electrónico inválido' }),
  password: z
    .string({ error: 'La contraseña es requerida' })
    .min(8, { error: 'La contraseña debe tener mínimo 8 caracteres' }),
});

export const loginFormSchema = z.object({
  email: z.email({ error: 'Formato de correo electrónico inválido' }),
  password: z
    .string({ error: 'La contraseña es requerida' })
    .min(1, { error: 'La contraseña no puede estar vacía' }),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export interface FormFieldError {
  readonly field: string;
  readonly message: string;
}

export function formatZodFieldErrors(
  error: z.ZodError,
): ReadonlyArray<FormFieldError> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'form',
    message: issue.message,
  }));
}
