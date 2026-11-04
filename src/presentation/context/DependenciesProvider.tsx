import type { ReactNode } from 'react';
import type { AppDependencies } from '../../composition/createAppDependencies';
import { DependenciesContext } from './dependenciesContextInstance';

export interface DependenciesProviderProps {
  readonly dependencies: AppDependencies;
  readonly children: ReactNode;
}

/** Solo inyección de dependencias — no guarda estado remoto de cuentas. */
export function DependenciesProvider({
  dependencies,
  children,
}: DependenciesProviderProps) {
  return (
    <DependenciesContext.Provider value={dependencies}>
      {children}
    </DependenciesContext.Provider>
  );
}
