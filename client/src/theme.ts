import { createTheme } from '@mantine/core';

// TODO: Ajuster la palette si nécessaire avec l'équipe design
export const theme = createTheme({
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

export default theme;
