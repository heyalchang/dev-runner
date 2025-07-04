import React, { useState } from 'react';
import { DirectoryPicker } from './DirectoryPicker';

export interface AddProjectWizardProps {
  onAdd(path: string): void;
}

export function AddProjectWizard({ onAdd }: AddProjectWizardProps) {
  const [dir, setDir] = useState('');

  return (
    <div className="add-project-wizard">
      <DirectoryPicker onPick={setDir} />
      <button disabled={!dir} onClick={() => onAdd(dir)}>
        Add
      </button>
    </div>
  );
}
