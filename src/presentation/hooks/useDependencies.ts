import { useContext } from 'react';
import type { AppDependencies } from '../../composition/createAppDependencies';
import { DependenciesContext } from '../context/dependenciesContextInstance';

export function useDependencies(): AppDependencies {
  const ctx = useContext(DependenciesContext);
  if (ctx === null) {
    throw new Error('useDependencies debe usarse dentro de DependenciesProvider.');
  }
  return ctx;
}
