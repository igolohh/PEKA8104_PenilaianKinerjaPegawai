import React from 'react';
import { Edit2, Trash2, Clock, CheckCircle, Clock3, Scale, ThumbsUp } from 'lucide-react';
import { WorkEntry } from '../types';
import { formatDate } from '../utils/date';

interface EntryItemProps {
  entry: WorkEntry;
  onEdit: (entry: WorkEntry) => void;
  onDelete: (id: string) => void;
}

const EntryItem: React.FC<EntryItemProps> = ({ entry, onEdit, onDelete }) => {
  const getStatusBadge = () => {
    if (entry.approved === true) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <ThumbsUp className="h-3 w-3 mr-1" />
          Disetujui
        </span>
      );
    }
    
    switch (entry.status) {
      case 'selesai':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Selesai
          </span>
        );
      case 'proses':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock3 className="h-3 w-3 mr-1" />
            Dalam Proses
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-5 mb-4 transition-all duration-200 hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900 mb-1">{formatDate(entry.date)}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{entry.duration} jam</span>
            </div>
            <div className="flex items-center">
              <Scale className="h-4 w-4 mr-1" />
              <span>{entry.volume} {entry.unit}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {getStatusBadge()}
        </div>
      </div>
      
      <p className="text-gray-700 my-3 whitespace-pre-line">{entry.description}</p>
      
      <div className="flex justify-end space-x-2 mt-3">
        <button 
          onClick={() => onEdit(entry)}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-150"
          aria-label="Edit entry"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onDelete(entry.id)}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-150"
          aria-label="Delete entry"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default EntryItem;