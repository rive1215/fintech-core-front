import { describe, expect, it } from 'vitest';
import {
  depositFormSchema,
  transferFormSchema,
  withdrawalFormSchema,
} from './transactionSchemas';

const accountA = '550e8400-e29b-41d4-a716-446655440000';
const accountB = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

describe('transactionSchemas', () => {
  it('deposit exige monto positivo', () => {
    expect(
      depositFormSchema.safeParse({ accountId: accountA, amount: '0' }).success,
    ).toBe(false);
    expect(
      depositFormSchema.safeParse({ accountId: accountA, amount: '12.5' }).success,
    ).toBe(true);
  });

  it('withdrawal exige UUID y monto > 0', () => {
    expect(
      withdrawalFormSchema.safeParse({ accountId: 'no-uuid', amount: '1' }).success,
    ).toBe(false);
  });

  it('transfer rechaza origen = destino', () => {
    const result = transferFormSchema.safeParse({
      sourceAccountId: accountA,
      destinationAccountId: accountA,
      amount: '10',
    });
    expect(result.success).toBe(false);
  });

  it('transfer acepta descripción opcional', () => {
    const result = transferFormSchema.safeParse({
      sourceAccountId: accountA,
      destinationAccountId: accountB,
      amount: '10',
      description: 'nota',
    });
    expect(result.success).toBe(true);
  });
});
