import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WorkEntry } from '../types';
import { formatDate } from '../utils/date';
import { ThumbsUp, Clock, Scale, Filter, Loader2 } from 'lucide-react';

const ApprovedEntries: React.FC = () => {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchApprovedEntries();
  }, [selectedMonth]);

  const fetchApprovedEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      const { data, error } = await supabase
        .from('work_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('approved', true)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching approved entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Generate options for the last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }

    return options;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Rekap Pekerjaan</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {getMonthOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada pekerjaan yang disetujui untuk bulan ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{formatDate(entry.date)}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{entry.duration} jam</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Scale className="h-4 w-4" />
                          <span>{entry.volume} {entry.unit}</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Disetujui
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{entry.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovedEntries;