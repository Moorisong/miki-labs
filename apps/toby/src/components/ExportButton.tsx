import React from 'react';

interface ExportButtonProps {
  onExport: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExport }) => {
  return (
    <button onClick={onExport}>
      결과 저장하기
    </button>
  );
};

export default ExportButton;
