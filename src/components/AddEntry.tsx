import React from 'react';
import { useNavigate } from 'react-router-dom';
import EntryForm from './EntryForm';
import { WorkEntryFormData } from '../types';
import { supabase } from '../lib/supabase';

const AddEntry: React.FC = () => {
  const navigate = useNavigate();

  const handleAddEntry = async (formData: WorkEntryFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const newEntry = {
        ...formData,
        user_id: user.id,
        approved: null,
        created_at: new Date().toISOString(),
        updated_at: null
      };

      const { error } = await supabase
        .from('work_entries')
        .insert(newEntry);

      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Failed to add entry');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Catat Pekerjaan Anda Hari ini</h2>
          <EntryForm onSubmit={handleAddEntry} />
        </div>
      </div>
    </div>
  );
};

export default AddEntry;