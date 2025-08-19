// TODO: Overlay de chargement
// - Affiche un voile de chargement au-dessus d'une section

import React from 'react';
import { LoadingOverlay } from '@mantine/core';

export interface LoaderOverlayProps {
    visible: boolean;
}

const LoaderOverlay: React.FC<LoaderOverlayProps> = ({ visible }) => {
    return <LoadingOverlay visible={visible} />;
};

export default LoaderOverlay;
