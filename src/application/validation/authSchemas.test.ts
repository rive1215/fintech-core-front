import { describe, expect, it } from 'vitest';
import { loginFormSchema, registerFormSchema } from './authSchemas';

describe('authSchemas', () => {
  it('rechaza registro con password corta', () => {
    const result = registerFormSchema.safeParse({
      name: 'Ana',
      email: 'ana@bank.test',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('acepta registro válido', () => {
    const result = registerFormSchema.safeParse({
      name: 'Ana Pérez',
      email: 'ana@bank.test',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza login con password vacía', () => {
    const result = loginFormSchema.safeParse({
      email: 'ana@bank.test',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});
