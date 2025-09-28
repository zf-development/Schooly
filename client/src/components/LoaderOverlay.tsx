import React from "react";
import { Overlay, Skeleton, Center, Stack } from "@mantine/core";

interface LoaderOverlayProps {
    visible: boolean;
}

const LoaderOverlay: React.FC<LoaderOverlayProps> = ({ visible }) => {
    if (!visible) return null;

    return (
        <Overlay color="#000" backgroundOpacity={0.35} blur={3} center>
            <Center>
                <Stack gap="md" align="center">
                    <Skeleton height={60} width={60} circle />
                    <Skeleton height={20} width={120} />
                    <Skeleton height={16} width={80} />
                </Stack>
            </Center>
        </Overlay>
    );
};

export default LoaderOverlay;
