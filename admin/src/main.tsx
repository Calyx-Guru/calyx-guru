import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { registerAllModules } from 'handsontable/registry';

import './index.css';

import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-horizon.css';
import 'handsontable/styles/ht-theme-main.css';

import App from './App.tsx';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext.tsx';

registerAllModules();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupabaseAuthProvider>
      <App />
    </SupabaseAuthProvider>
  </StrictMode>,
);
