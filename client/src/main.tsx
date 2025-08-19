// TODO: Entrée de l'application React
// - Configuration de Mantine
// - Providers (User, Institution)
// - Router de l'application

import React from 'react';
import ReactDOM from 'react-dom/client';
// TODO: Importer Mantine
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import theme from './theme';
import App from './App';

// TODO: Importer les providers
// import { UserProvider } from './contexts/UserContext';
// import { InstitutionProvider } from './contexts/InstitutionContext';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <MantineProvider theme={theme} defaultColorScheme="light">
            {/* TODO: UserProvider */}
            {/* TODO: InstitutionProvider */}
            <App />
        </MantineProvider>
    </React.StrictMode>
);
