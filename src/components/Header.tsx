import React from 'react';
import { ClipboardList } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <ClipboardList className="h-7 w-7 text-blue-600" />
      <div>
        <h1 className="text-xl font-bold text-gray-900">PEKA</h1>
        <p className="text-xs text-gray-500">Penilaian Kinerja Harian</p>
      </div>
    </div>
  );
};

export default Header;