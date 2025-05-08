import React, { useState } from 'react';
import { Check, Clock, AlignLeft, CalendarDays, Scale } from 'lucide-react';
import { WorkEntryFormData } from '../types';
import { getCurrentDate } from '../utils/date';

interface EntryFormProps {
  onSubmit: (data: WorkEntryFormData) => void;
  initialData?: WorkEntryFormData;
  isEditing?: boolean;
  onCancel?: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEditing = false,
  onCancel 
}) => {
  const [formData, setFormData] = useState<WorkEntryFormData>(initialData || {
    date: getCurrentDate(),
    duration: 1,
    volume: 1,
    unit: 'dokumen',
    description: '',
    status: 'selesai'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'volume' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    
    if (!isEditing) {
      setFormData({
        date: getCurrentDate(),
        duration: 1,
        volume: 1,
        unit: 'dokumen',
        description: '',
        status: 'selesai'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <CalendarDays className="h-4 w-4" /> Tanggal
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Clock className="h-4 w-4" /> Durasi Pekerjaan (Jam)
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="0.5"
            max="24"
            step="0.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Scale className="h-4 w-4" /> Volume
          </label>
          <input
            type="number"
            name="volume"
            value={formData.volume}
            onChange={handleChange}
            min="1"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Scale className="h-4 w-4" /> Satuan
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="dokumen">Dokumen</option>
            <option value="kegiatan">Kegiatan</option>
            <option value="laporan">Laporan</option>
            <option value="paket">Paket</option>
            <option value="file">File</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <AlignLeft className="h-4 w-4" /> Uraian Pekerjaan
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Masukkan uraian pekerjaan yang dilakukan..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <Check className="h-4 w-4" /> Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="selesai">Selesai</option>
          <option value="proses">Dalam Proses</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-2">
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isEditing ? 'Perbarui' : 'Simpan'}
        </button>
      </div>
    </form>
  );
};

export default EntryForm;