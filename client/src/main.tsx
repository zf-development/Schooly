import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import App from './App';
import { theme } from './theme';
import '@mantine/core/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorSchemeScript />
    <MantineProvider theme={theme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </React.StrictMode>
);
