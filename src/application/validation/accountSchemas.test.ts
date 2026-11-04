import { describe, expect, it } from 'vitest';
import { createAccountFormSchema } from './accountSchemas';

describe('createAccountFormSchema', () => {
  it('omite saldo vacío', () => {
    const result = createAccountFormSchema.safeParse({ initialBalance: '' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.initialBalance).toBeUndefined();
    }
  });

  it('acepta saldo >= 0', () => {
    const result = createAccountFormSchema.safeParse({ initialBalance: '25.5' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.initialBalance).toBe(25.5);
    }
  });

  it('rechaza saldo negativo', () => {
    const result = createAccountFormSchema.safeParse({ initialBalance: '-1' });
    expect(result.success).toBe(false);
  });
});
