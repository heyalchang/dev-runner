import React from 'react';

export interface DirectoryPickerProps {
  onPick(path: string): void;
}

export function DirectoryPicker({ onPick }: DirectoryPickerProps) {
  return (
    <input
      type="file"
      webkitdirectory=""
      onChange={(e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          const dir = files[0].webkitRelativePath.split('/')[0];
          onPick('/' + dir);
        }
      }}
    />
  );
}
