'use client';

import { useState, useEffect } from 'react';
import { Search, Settings } from 'lucide-react';
import api from '@/lib/api';
import type { User } from '@/types/auth';

export default function UsersPage() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/users');
      setUsersList(response.data.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in">
      <h2 className="text-4xl font-black uppercase mb-10 italic tracking-tighter">Quản lý <span className="text-red-600">Người dùng</span></h2>
      <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
         <div className="p-8 border-b flex justify-between items-center">
            <h3 className="font-black uppercase text-lg italic tracking-tighter">Danh sách thành viên ({usersList.length})</h3>
            <div className="flex gap-4">
              <button className="p-3 bg-gray-50 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"><Search size={20}/></button>
            </div>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                 <tr>
                   <th className="p-8 font-black text-[10px] uppercase text-gray-400 tracking-widest">Thành viên</th>
                   <th className="p-8 font-black text-[10px] uppercase text-gray-400 tracking-widest">Email</th>
                   <th className="p-8 font-black text-[10px] uppercase text-gray-400 tracking-widest">Vai trò</th>
                   <th className="p-8 font-black text-[10px] uppercase text-gray-400 tracking-widest">Thao tác</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {usersList.map(u => (
                   <tr key={u.id} className="hover:bg-gray-50 transition-all">
                     <td className="p-8 flex items-center gap-5">
                       <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-red-100 uppercase">{u.email?.[0]}</div>
                       <span className="font-black uppercase italic text-sm">{u.full_name || 'Thành viên DRC'}</span>
                     </td>
                     <td className="p-8 font-bold text-gray-500 text-sm">{u.email}</td>
                     <td className="p-8">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                         {u.role === 'admin' ? 'Admin' : 'Khách hàng'}
                       </span>
                     </td>
                     <td className="p-8 text-gray-300 hover:text-red-600 transition-colors"><button><Settings size={20}/></button></td>
                   </tr>
                 ))}
              </tbody>
           </table>
           {usersList.length === 0 && (
             <div className="text-center py-8 text-gray-500">Không có người dùng nào</div>
           )}
         </div>
      </div>
    </div>
  );
}