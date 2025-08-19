// TODO: Overlay de chargement
// - Affiche un voile de chargement au-dessus d'une section

import React from 'react';
import { Overlay, Loader, Center } from '@mantine/core';

interface LoaderOverlayProps {
  visible: boolean;
}

const LoaderOverlay: React.FC<LoaderOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <Overlay
      color="#000"
      backgroundOpacity={0.35}
      blur={3}
      center
    >
      <Center>
        <Loader size="xl" color="white" />
      </Center>
    </Overlay>
  );
};

export default LoaderOverlay;
