import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WorkEntry } from '../types';
import { formatDate } from '../utils/date';
import { ThumbsUp, Clock, Scale, Filter, Users, Loader2, Building2 } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  nip: string;
  department: string;
  position: string;
}

interface WorkEntryWithProfile extends WorkEntry {
  profile: Profile | null;
}

const AllEmployeesRecap: React.FC = () => {
  const [entries, setEntries] = useState<WorkEntryWithProfile[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchApprovedEntries();
  }, [selectedMonth, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      // First, get all work entries to find active users
      const { data: workEntries, error: workEntriesError } = await supabase
        .from('work_entries')
        .select('user_id')
        .eq('approved', true);

      if (workEntriesError) throw workEntriesError;

      // Get unique user IDs from work entries
      const activeUserIds = [...new Set(workEntries?.map(entry => entry.user_id) || [])];

      if (activeUserIds.length === 0) {
        setEmployees([]);
        return;
      }

      // Then fetch profiles only for users who have work entries
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, nip, department, position')
        .eq('role', 'pegawai')
        .in('id', activeUserIds)
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchApprovedEntries = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      let query = supabase
        .from('work_entries')
        .select(`
          *,
          profile:profiles(
            id,
            full_name,
            nip,
            department,
            position
          )
        `)
        .eq('approved', true)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (selectedEmployee) {
        query = query.eq('user_id', selectedEmployee);
      }

      const { data, error } = await query;

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

  // Group entries by employee
  const entriesByEmployee = entries.reduce((acc, entry) => {
    if (!entry.profile) return acc; // Skip entries without profile data
    const employeeId = entry.user_id;
    if (!acc[employeeId]) {
      acc[employeeId] = [];
    }
    acc[employeeId].push(entry);
    return acc;
  }, {} as Record<string, WorkEntryWithProfile[]>);

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Rekap Seluruh Pegawai</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Semua Pegawai</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </option>
                  ))}
                </select>
              </div>
              
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
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {selectedEmployee
                  ? 'Tidak ada pekerjaan yang disetujui untuk pegawai ini pada bulan yang dipilih'
                  : 'Tidak ada pekerjaan yang disetujui untuk bulan ini'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(entriesByEmployee).map(([employeeId, employeeEntries]) => {
                const employee = employeeEntries[0].profile;
                if (!employee) return null; // Skip rendering if profile is null

                return (
                  <div key={employeeId} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{employee.full_name}</h3>
                          <p className="text-sm text-gray-500">{employee.nip || 'NIP tidak tersedia'}</p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center gap-2 text-sm text-gray-500">
                          <Building2 className="h-4 w-4" />
                          <span>{employee.department || 'Departemen tidak tersedia'}</span>
                          <span>•</span>
                          <span>{employee.position || 'Posisi tidak tersedia'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {employeeEntries.map(entry => (
                        <div key={entry.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{formatDate(entry.date)}</h4>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllEmployeesRecap;