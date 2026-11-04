import { z } from 'zod';

/**
 * Create account — sin Zod en presentación backend.
 * Reglas FE: initialBalance opcional, number finito ≥ 0; nunca userId.
 */
export const createAccountFormSchema = z.object({
  initialBalance: z
    .string()
    .trim()
    .optional()
    .transform((value, ctx) => {
      if (value === undefined || value.length === 0) {
        return undefined;
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'El saldo inicial debe ser un número mayor o igual a cero.',
        });
        return z.NEVER;
      }
      return parsed;
    }),
});

export type CreateAccountFormValues = z.infer<typeof createAccountFormSchema>;
