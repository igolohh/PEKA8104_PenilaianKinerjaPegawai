import React from 'react';
import { WorkEntry } from '../types';
import EntryItem from './EntryItem';
import { FileX } from 'lucide-react';

interface EntryListProps {
  entries: WorkEntry[];
  onEdit: (entry: WorkEntry) => void;
  onDelete: (id: string) => void;
}

const EntryList: React.FC<EntryListProps> = ({ entries, onEdit, onDelete }) => {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="flex justify-center mb-4">
          <FileX className="h-16 w-16 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada data</h3>
        <p className="text-gray-500">Tambahkan uraian pekerjaan menggunakan form di atas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(entry => (
        <EntryItem
          key={entry.id}
          entry={entry}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default EntryList;