import { z } from 'zod';

const positiveAmountFromString = z
  .string({ error: 'El monto es requerido' })
  .trim()
  .min(1, { error: 'El monto es requerido' })
  .transform((value, ctx) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'El monto debe ser un número estrictamente mayor a cero.',
      });
      return z.NEVER;
    }
    return parsed;
  });

/**
 * Espejo de DepositFundsSchema / WithdrawalFundsSchema / TransferMoneySchema.
 * amount llega como string desde inputs HTML y se convierte a number.
 */
export const depositFormSchema = z.object({
  accountId: z.uuid({ error: 'ID de cuenta debe ser un UUID válido' }),
  amount: positiveAmountFromString,
});

export const withdrawalFormSchema = z.object({
  accountId: z.uuid({ error: 'ID de cuenta debe ser un UUID válido' }),
  amount: positiveAmountFromString,
});

export const transferFormSchema = z
  .object({
    sourceAccountId: z.uuid({
      error: 'ID de cuenta de origen debe ser un UUID válido',
    }),
    destinationAccountId: z.uuid({
      error: 'ID de cuenta de destino debe ser un UUID válido',
    }),
    amount: positiveAmountFromString,
    description: z
      .string()
      .max(100, { error: 'La descripción no puede exceder los 100 caracteres' })
      .optional()
      .transform((value) => {
        if (value === undefined) {
          return undefined;
        }
        const trimmed = value.trim();
        return trimmed.length === 0 ? undefined : trimmed;
      }),
  })
  .refine((data) => data.sourceAccountId !== data.destinationAccountId, {
    message: 'La cuenta de origen y destino no pueden ser idénticas.',
    path: ['destinationAccountId'],
  });

export type DepositFormValues = z.infer<typeof depositFormSchema>;
export type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;
export type TransferFormValues = z.infer<typeof transferFormSchema>;
