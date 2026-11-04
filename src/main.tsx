import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createAppDependencies } from './composition/createAppDependencies';
import { App } from './presentation/App';
import { AuthProvider } from './presentation/context/AuthProvider';
import { DependenciesProvider } from './presentation/context/DependenciesProvider';
import './presentation/styles/global.css';

const dependencies = createAppDependencies();

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('No se encontró el elemento #root.');
}

createRoot(rootElement).render(
  <StrictMode>
    <DependenciesProvider dependencies={dependencies}>
      <AuthProvider dependencies={dependencies}>
        <App />
      </AuthProvider>
    </DependenciesProvider>
  </StrictMode>,
);
