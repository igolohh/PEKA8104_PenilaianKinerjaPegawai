import React, { useState, useEffect } from 'react';
import EntryForm from './EntryForm';
import EntryList from './EntryList';
import SearchFilter from './SearchFilter';
import Summary from './Summary';
import { WorkEntry, WorkEntryFormData } from '../types';
import { supabase } from '../lib/supabase';
import { BarChart as BarChartIcon, ThumbsUp, XCircle, Clock, Loader2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  session: any;
}

interface MonthlyData {
  [key: string]: number;
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<WorkEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [monthlyDurations, setMonthlyDurations] = useState<MonthlyData>({});

  useEffect(() => {
    checkUserRole();
  }, []);

  useEffect(() => {
    if (userRole === 'pegawai') {
      fetchEntries();
    } else if (userRole === 'kepala_satker') {
      fetchKepalaStats();
      fetchMonthlyDurations();
    }
  }, [userRole]);

  useEffect(() => {
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('work_entries_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'work_entries',
        },
        (payload) => {
          const updatedEntry = payload.new as WorkEntry;
          if (userRole === 'pegawai') {
            setEntries(currentEntries => 
              currentEntries.map(entry => 
                entry.id === updatedEntry.id ? updatedEntry : entry
              )
            );
          } else if (userRole === 'kepala_satker') {
            fetchKepalaStats();
            fetchMonthlyDurations();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userRole]);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyDurations = async () => {
    try {
      // Get all pegawai IDs
      const { data: pegawaiIds } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'pegawai');

      if (!pegawaiIds) return;

      const userIds = pegawaiIds.map(p => p.id);

      // Get approved entries for the last 12 months
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 11);

      const { data: entries, error } = await supabase
        .from('work_entries')
        .select('date, duration')
        .in('user_id', userIds)
        .eq('approved', true)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      // Group and sum durations by month
      const monthlyData: MonthlyData = {};
      entries?.forEach(entry => {
        const month = entry.date.substring(0, 7); // Get YYYY-MM format
        monthlyData[month] = (monthlyData[month] || 0) + Number(entry.duration);
      });

      setMonthlyDurations(monthlyData);
    } catch (error) {
      console.error('Error fetching monthly durations:', error);
    }
  };

  const fetchKepalaStats = async () => {
    try {
      // Get all entries from pegawai
      const { data: pegawaiIds } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'pegawai');

      if (!pegawaiIds) return;

      const userIds = pegawaiIds.map(p => p.id);

      const { data: entries, error } = await supabase
        .from('work_entries')
        .select('*')
        .in('user_id', userIds);

      if (error) throw error;

      const stats = entries?.reduce((acc, entry) => {
        acc.total++;
        if (entry.approved === null) {
          acc.pending++;
        } else if (entry.approved === true) {
          acc.approved++;
        } else {
          acc.rejected++;
        }
        return acc;
      }, { pending: 0, approved: 0, rejected: 0, total: 0 });

      setStats(stats);
    } catch (error) {
      console.error('Error fetching kepala stats:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('work_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
      setFilteredEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  useEffect(() => {
    if (userRole === 'pegawai') {
      let result = [...entries];

      if (searchTerm) {
        result = result.filter(entry => 
          entry.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter) {
        result = result.filter(entry => entry.status === statusFilter);
      }

      if (dateFilter) {
        result = result.filter(entry => entry.date === dateFilter);
      }

      setFilteredEntries(result);
    }
  }, [entries, searchTerm, statusFilter, dateFilter, userRole]);

  const handleUpdateEntry = async (formData: WorkEntryFormData) => {
    if (!editingEntry) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedEntry = {
        ...editingEntry,
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('work_entries')
        .update(updatedEntry)
        .eq('id', editingEntry.id);

      if (error) throw error;

      setEntries(prev => 
        prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry)
      );
      setEditingEntry(null);
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus uraian pekerjaan ini?')) {
      try {
        const { error } = await supabase
          .from('work_entries')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setEntries(prev => prev.filter(entry => entry.id !== id));
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry');
      }
    }
  };

  const handleEditEntry = (entry: WorkEntry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingEntry(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const KepalaStats = () => {
    const chartData = {
      labels: Object.keys(monthlyDurations).map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      }),
      datasets: [
        {
          label: 'Total Durasi (Jam)',
          data: Object.values(monthlyDurations),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const
        },
        title: {
          display: true,
          text: 'Total Durasi Pekerjaan per Bulan (Disetujui)'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Durasi (Jam)'
          }
        }
      }
    };

    return (
      <>
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <div className="flex items-center mb-4">
            <BarChartIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Ringkasan Uraian Pekerjaan Pegawai</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <span className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full">
                  <BarChartIcon className="h-5 w-5 text-blue-600" />
                </span>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Menunggu</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <span className="inline-flex items-center justify-center p-2 bg-yellow-100 rounded-full">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </span>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Disetujui</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
                <span className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                </span>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Ditolak</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
                <span className="inline-flex items-center justify-center p-2 bg-red-100 rounded-full">
                  <XCircle className="h-5 w-5 text-red-600" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5">
          <div style={{ height: '400px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </>
    );
  };

  const PegawaiDashboard = () => (
    <>
      {editingEntry && (
        <div className="mb-6">
          <EntryForm 
            onSubmit={handleUpdateEntry}
            initialData={editingEntry}
            isEditing={true}
            onCancel={cancelEdit}
          />
        </div>
      )}
      
      <Summary entries={entries} />
      
      <SearchFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />
      
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Daftar Uraian Pekerjaan
        {filteredEntries.length > 0 && 
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({filteredEntries.length} entri)
          </span>
        }
      </h2>
      
      <EntryList 
        entries={filteredEntries}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
      />
    </>
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {userRole === 'kepala_satker' ? <KepalaStats /> : <PegawaiDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;