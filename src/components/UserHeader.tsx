import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User2, Building2, FileText, Briefcase } from 'lucide-react';

interface Profile {
  full_name: string;
  nip: string;
  department: string;
  position: string;
  role: string;
}

const UserHeader: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, nip, department, position, role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  if (!profile) return null;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-700">
            <User2 className="h-4 w-4 text-gray-500" />
            <span>{profile.full_name}</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-700">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>{profile.nip}</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-700">
            <Briefcase className="h-4 w-4 text-gray-500" />
            <span>{profile.position}</span>
            {profile.role === 'kepala_satker' && (
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                Kepala Satker
              </span>
            )}
          </div>
          
          {profile.department && (
            <div className="flex items-center gap-1 text-gray-700">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span>{profile.department}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHeader;