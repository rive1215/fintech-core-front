import { createContext } from 'react';
import type { AppDependencies } from '../../composition/createAppDependencies';

export const DependenciesContext = createContext<AppDependencies | null>(null);
