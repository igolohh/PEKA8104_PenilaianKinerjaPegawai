import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCircle2, LogOut, PlusCircle, CheckSquare, FileText, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UserHeader from './UserHeader';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    checkUserRole();
  }, []);

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
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isPegawai = userRole === 'pegawai';
  const isKepalaSatker = userRole === 'kepala_satker';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Panel */}
      <div className="w-64 bg-gradient-to-br from-blue-900 to-blue-700 border-r border-blue-800">
        <div className="h-16 flex items-center px-4 border-b border-blue-800">
          <img src="/logo.png" alt="PEKA Logo" className="h-14 w-auto object-contain" />
        </div>
        
        <nav className="p-4 space-y-1">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/dashboard')
                ? 'bg-white/10 text-white'
                : 'text-blue-100 hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>

          {isPegawai && (
            <>
              <Link
                to="/add-entry"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/add-entry')
                    ? 'bg-white/10 text-white'
                    : 'text-blue-100 hover:bg-white/5'
                }`}
              >
                <PlusCircle className="h-5 w-5" />
                Tambah Uraian Pekerjaan
              </Link>

              <Link
                to="/approved-entries"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/approved-entries')
                    ? 'bg-white/10 text-white'
                    : 'text-blue-100 hover:bg-white/5'
                }`}
              >
                <FileText className="h-5 w-5" />
                Rekap Pekerjaan
              </Link>
            </>
          )}

          {isKepalaSatker && (
            <>
              <Link
                to="/approvals"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/approvals')
                    ? 'bg-white/10 text-white'
                    : 'text-blue-100 hover:bg-white/5'
                }`}
              >
                <CheckSquare className="h-5 w-5" />
                Persetujuan
              </Link>

              <Link
                to="/all-employees-recap"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/all-employees-recap')
                    ? 'bg-white/10 text-white'
                    : 'text-blue-100 hover:bg-white/5'
                }`}
              >
                <Users className="h-5 w-5" />
                Rekap Seluruh Pegawai
              </Link>
            </>
          )}
          
          <Link
            to="/profile"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/profile')
                ? 'bg-white/10 text-white'
                : 'text-blue-100 hover:bg-white/5'
            }`}
          >
            <UserCircle2 className="h-5 w-5" />
            Profil
          </Link>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-white/5"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <UserHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;