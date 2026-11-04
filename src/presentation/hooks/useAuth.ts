import { useContext } from 'react';
import { AuthContext } from '../context/authContextInstance';
import type { AuthContextValue } from '../context/authTypes';

/**
 * Acceso a sesión y operaciones Auth (register, login, logout, restore).
 * No expone Axios, JWT parsing ni localStorage.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }
  return ctx;
}
