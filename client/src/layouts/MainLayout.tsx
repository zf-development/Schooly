// TODO: Layout principal avec Header / Footer
// - Header avec navigation et AuthButton
// - Footer avec informations
// - Wrapper pour le contenu principal

import React from 'react';

const containerStyle: React.CSSProperties = {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
};

const mainStyle: React.CSSProperties = {
    flex: 1,
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    // TODO: Implémenter le layout
    return (
        <div style={containerStyle}>
            <header style={{ padding: 16 }}> {/* TODO: Remplacer par Header Mantine */}
                <strong>StudBud</strong>
            </header>
            <main style={mainStyle}>
                {children}
            </main>
            <footer style={{ padding: 16, fontSize: 12, color: '#666' }}> {/* TODO: Remplacer par Footer Mantine */}
                © {new Date().getFullYear()} StudBud
            </footer>
        </div>
    );
};

export default MainLayout;
