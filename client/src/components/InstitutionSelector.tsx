// TODO: Sélecteur d'institution
// - Liste déroulante d'écoles

import React from 'react';
import { Select } from '@mantine/core';

export interface InstitutionOption { id: string; name: string; logoUrl?: string }

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
