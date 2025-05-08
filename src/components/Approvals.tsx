import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatDate } from '../utils/date';

interface WorkEntry {
  id: string;
  date: string;
  description: string;
  duration: number;
  volume: number;
  unit: string;
  status: string;
  user_id: string;
  approved: boolean | null;
}

interface UserProfile {
  id: string;
  full_name: string;
  nip: string;
  department: string;
  position: string;
}

const Approvals: React.FC = () => {
  const [entries, setEntries] = useState<(WorkEntry & { profile: UserProfile | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchPendingEntries();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('work_entries_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'work_entries'
        },
        (payload) => {
          const updatedEntry = payload.new as WorkEntry;
          if (updatedEntry.approved !== null) {
            // Remove the entry from the list if it's been approved/rejected
            setEntries(prev => prev.filter(entry => entry.id !== updatedEntry.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPendingEntries = async () => {
    try {
      const { data, error } = await supabase
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
        .is('approved', null)
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setMessage({ type: 'error', text: 'Gagal memuat data' });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (entryId: string, approved: boolean) => {
    try {
      setUpdating(entryId);
      setMessage(null);

      // First, check if we have permission to update
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get the user's role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (profileData.role !== 'kepala_satker') {
        throw new Error('Unauthorized: Only kepala_satker can approve entries');
      }

      // Update the work entry
      const { error: updateError } = await supabase
        .from('work_entries')
        .update({
          approved: approved,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (updateError) throw updateError;

      setMessage({ 
        type: 'success', 
        text: `Berhasil ${approved ? 'menyetujui' : 'menolak'} uraian pekerjaan` 
      });

      // Update local state
      setEntries(prev => prev.filter(entry => entry.id !== entryId));

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating entry:', error);
      setMessage({ type: 'error', text: 'Gagal memperbarui status persetujuan' });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Tidak ada uraian pekerjaan yang perlu disetujui</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Persetujuan Uraian Pekerjaan
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {entries.map(entry => (
              <div key={entry.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {entry.profile?.full_name || 'Pengguna tidak ditemukan'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {entry.profile ? (
                        <>
                          {entry.profile.nip} • {entry.profile.department}
                        </>
                      ) : (
                        'Data profil tidak tersedia'
                      )}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(entry.date)}</p>
                </div>
                
                <p className="text-gray-700 mb-4">{entry.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>{entry.duration} jam</span>
                  <span>•</span>
                  <span>{entry.volume} {entry.unit}</span>
                  <span>•</span>
                  <span className="capitalize">{entry.status}</span>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleApproval(entry.id, false)}
                    disabled={updating === entry.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Tolak
                  </button>
                  <button
                    onClick={() => handleApproval(entry.id, true)}
                    disabled={updating === entry.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-md disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Setujui
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Approvals;