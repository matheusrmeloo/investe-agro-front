import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import { GlobalStyle } from './assets/css/global';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <GlobalStyle />
    <AppRoutes />
  </React.StrictMode>,
);
