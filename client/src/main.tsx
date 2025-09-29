import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import App from './App';
import { theme } from './theme';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorSchemeScript />
    <MantineProvider theme={theme} defaultColorScheme="light">
      <DatesProvider settings={{ firstDayOfWeek: 1 }}>
        <App />
      </DatesProvider>
    </MantineProvider>
  </React.StrictMode>
);
