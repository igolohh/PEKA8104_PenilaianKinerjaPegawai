import React from 'react';
import { WorkEntry } from '../types';
import { CheckCircle, Clock3, BarChart, ThumbsUp } from 'lucide-react';

interface SummaryProps {
  entries: WorkEntry[];
}

const Summary: React.FC<SummaryProps> = ({ entries }) => {
  // Count entries by status
  const completed = entries.filter(entry => entry.status === 'selesai').length;
  const inProgress = entries.filter(entry => entry.status === 'proses').length;
  const approved = entries.filter(entry => entry.approved === true).length;
  
  // Get current month entries
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === currentMonth && 
           entryDate.getFullYear() === currentYear;
  }).length;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6">
      <div className="flex items-center mb-4">
        <BarChart className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Ringkasan Kinerja</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900">{monthlyEntries}</p>
            </div>
            <span className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full">
              <BarChart className="h-5 w-5 text-blue-600" />
            </span>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Disetujui</p>
              <p className="text-2xl font-bold text-gray-900">{approved}</p>
            </div>
            <span className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full">
              <ThumbsUp className="h-5 w-5 text-green-600" />
            </span>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Selesai</p>
              <p className="text-2xl font-bold text-gray-900">{completed}</p>
            </div>
            <span className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </span>
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Dalam Proses</p>
              <p className="text-2xl font-bold text-gray-900">{inProgress}</p>
            </div>
            <span className="inline-flex items-center justify-center p-2 bg-yellow-100 rounded-full">
              <Clock3 className="h-5 w-5 text-yellow-600" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;