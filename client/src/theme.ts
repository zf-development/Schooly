import { createTheme, MantineThemeOverride } from '@mantine/core';

// Thème clair (par défaut)
export const lightTheme: MantineThemeOverride = createTheme({
    fontFamily: 'sofia-pro-variable, sans-serif',
    fontFamilyMonospace: 'Monaco, Courier, monospace',
    colors: {
        // Palette "academic" (violet/indigo doux)
        academic: [
            '#eef2ff', // 0
            '#e0e7ff', // 1
            '#c7d2fe', // 2
            '#a5b4fc', // 3
            '#818cf8', // 4
            '#6366f1', // 5
            '#4f46e5', // 6 (primary)
            '#4338ca', // 7
            '#3730a3', // 8
            '#312e81', // 9
        ],
    },
    primaryColor: 'academic',
    defaultRadius: 'md',
});

// Thème sombre
export const darkTheme: MantineThemeOverride = createTheme({
    fontFamily: 'Sofia Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    fontFamilyMonospace: 'Monaco, Courier, monospace',
    headings: {
        fontFamily: 'Sofia Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    },
    colors: {
        // Palette "academic" adaptée pour le mode sombre
        academic: [
            '#1e1b4b', // 0 - très sombre
            '#312e81', // 1
            '#3730a3', // 2
            '#4338ca', // 3
            '#4f46e5', // 4
            '#6366f1', // 5 (primary)
            '#818cf8', // 6
            '#a5b4fc', // 7
            '#c7d2fe', // 8
            '#e0e7ff', // 9 - très clair
        ],
        // Couleurs neutres pour le mode sombre
        dark: [
            '#C1C2C5', // 0
            '#A6A7AB', // 1
            '#909296', // 2
            '#5c5f66', // 3
            '#373A40', // 4
            '#2C2E33', // 5
            '#25262b', // 6
            '#1A1B1E', // 7
            '#141517', // 8
            '#101113', // 9
        ],
    },
    primaryColor: 'academic',
    defaultRadius: 'md',
});

// Thème par défaut (clair)
export const theme = lightTheme;

export default theme;
