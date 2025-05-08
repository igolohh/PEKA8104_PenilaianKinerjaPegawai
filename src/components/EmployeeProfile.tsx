import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User2, Mail, Building2, Briefcase, Save, Loader2, FileText, Edit2 } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  department: string;
  position: string;
  nip: string;
  role: string;
}

const departments = [
  'IPDS',
  'Distribusi',
  'Neraca',
  'Produksi',
  'Sosial',
  'Sub Bagian Umum',
  'Security',
  'Cleaning Service'
];

const allPositions = [
  'Kepala Sub Bagian Umum',
  'Statistisi Ahli Muda',
  'Statistisi Ahli Pertama',
  'Statistisi Pelaksana',
  'Pelaksana',
  'Outsourcing'
];

const EmployeeProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availablePositions, setAvailablePositions] = useState(allPositions);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Check if this user is already Kepala
      const isKepala = data?.position === 'Kepala BPS Kabupaten Buru';

      // Set available positions based on whether user is Kepala
      setAvailablePositions(isKepala ? [...allPositions, 'Kepala BPS Kabupaten Buru'] : allPositions);

      // Initialize profile with user data whether it exists or not
      setProfile({
        id: user.id,
        full_name: data?.full_name || '',
        email: user.email || '',
        department: data?.department || '',
        position: data?.position || '',
        nip: data?.nip || '',
        role: data?.role || 'pegawai'
      });

      // If profile exists, start in view mode
      setIsEditing(!data);
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Error loading profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    if (!profile?.id) {
      console.error('No profile ID available');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          // Clear department if position is Kepala BPS Kabupaten Buru
          department: profile.position === 'Kepala BPS Kabupaten Buru' ? '' : profile.department
        });

      if (error) throw error;
      
      setIsEditing(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => {
      if (!prev) return null;
      
      // If changing position to Kepala BPS, clear department
      if (name === 'position' && value === 'Kepala BPS Kabupaten Buru') {
        return {
          ...prev,
          position: value,
          department: ''
        };
      }
      
      return {
        ...prev,
        [name]: value
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600">Error loading profile. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const isKepala = profile.position === 'Kepala BPS Kabupaten Buru';

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Informasi Pegawai</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <User2 className="h-4 w-4" /> Nama Lengkap
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan nama lengkap"
                />
              ) : (
                <p className="mt-1 px-3 py-2 text-gray-900">{profile.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <Mail className="h-4 w-4" /> Email
              </label>
              <p className="mt-1 px-3 py-2 text-gray-900">{profile.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <FileText className="h-4 w-4" /> NIP
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="nip"
                  value={profile.nip}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan NIP"
                />
              ) : (
                <p className="mt-1 px-3 py-2 text-gray-900">{profile.nip}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <Briefcase className="h-4 w-4" /> Jabatan
              </label>
              {isEditing ? (
                <select
                  name="position"
                  value={profile.position}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Jabatan</option>
                  {availablePositions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              ) : (
                <p className="mt-1 px-3 py-2 text-gray-900">{profile.position}</p>
              )}
            </div>

            {!isKepala && (
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Building2 className="h-4 w-4" /> Departemen
                </label>
                {isEditing ? (
                  <select
                    name="department"
                    value={profile.department}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih Departemen</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 px-3 py-2 text-gray-900">{profile.department}</p>
                )}
              </div>
            )}

            {isEditing && (
              <div className="flex justify-end space-x-2">
                {profile.full_name && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;