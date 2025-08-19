import React from 'react';
import { Select } from '@mantine/core';
import type { InstitutionOption } from '../types';

export interface InstitutionSelectorProps {
    institutions: InstitutionOption[];
    selectedId: string;
    onChange: (id: string) => void;
}

const InstitutionSelector: React.FC<InstitutionSelectorProps> = ({ institutions, selectedId, onChange }) => {
    return (
        <Select
            data={institutions.map((i) => ({ value: i.id, label: i.name }))}
            value={selectedId}
            onChange={(v) => v && onChange(v)}
            placeholder="Choisir une école"
            aria-label="Sélection d'institution"
            w={260}
        />
    );
};

export default InstitutionSelector;
