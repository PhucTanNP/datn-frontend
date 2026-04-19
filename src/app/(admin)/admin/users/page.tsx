'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Mail, Phone, Edit, Trash2, X, Settings, UserCheck, UserCog } from 'lucide-react';
import api from '@/lib/api';
import type { User } from '@/types/auth';
import Loading from '@/app/loading';
// import { db, doc, deleteDoc } from 'firebase/firestore';
// import { appId } from '@/lib/firebase';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [form, setForm] = useState({ id: '', fullName: '', email: '', phone: '', role: 'customer', status: 'active', note: '' });
  const [modal, setModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const ROLES = [
    { value: 'admin', label: 'Quản trị viên', color: 'bg-red-50 text-red-600 border-red-200' },
    { value: 'manager', label: 'Quản lý', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { value: 'customer', label: 'Khách hàng', color: 'bg-gray-50 text-gray-600 border-gray-200' }
  ];

  const STATUSES = [
    { value: 'active', label: 'Hoạt động', color: 'bg-green-50 text-green-600 border-green-200' },
    { value: 'inactive', label: 'Không hoạt động', color: 'bg-red-50 text-red-600 border-red-200' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setForm({
      id: user.id,
      fullName: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer',
      status: user.status || (user.is_active ? 'active' : 'inactive'),
      note: user.note || ''
    });
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setForm({ id: '', fullName: '', email: '', phone: '', role: 'customer', status: 'active', note: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.id) {
        // Update user
        await api.put(`/api/v1/admin/users/${form.id}`, form);
        setModal({ type: 'success', message: 'Cập nhật thành công!' });
      } else {
        // Create user
        await api.post('/api/v1/admin/users', form);
        setModal({ type: 'success', message: 'Tạo mới thành công!' });
      }
      loadUsers();
      handleClosePanel();
      setTimeout(() => setModal(null), 3000);
    } catch {
      setModal({ type: 'error', message: 'Có lỗi xảy ra!' });
      setTimeout(() => setModal(null), 3000);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden italic font-sans relative">

      {/* CỘT TRÁI: DANH SÁCH NGƯỜI DÙNG */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ${isPanelOpen ? 'mr-[450px]' : 'mr-0'}`}>
        {/* Header Công cụ */}
        <header className="p-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
              QUẢN LÝ <span className="text-red-600">NGƯỜI DÙNG</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest mt-1 italic">Hệ thống thành viên DRC Elite</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 shadow-sm rounded-2xl overflow-hidden border border-gray-200">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                placeholder="Tìm thành viên..."
                className="w-full pl-10 pr-6 py-3 bg-white outline-none font-bold italic text-xs"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {!isPanelOpen && (
              <button
                onClick={() => setIsPanelOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95"
              >
                <UserPlus size={16} /> Thêm mới
              </button>
            )}
          </div>
        </header>

        {/* Bảng Danh sách */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 no-scrollbar">
          <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left italic border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-50 italic">
                <tr>
                  <th className="p-8 font-black text-[10px] uppercase text-gray-400 tracking-widest italic">Hội viên</th>
                  <th className="p-8 font-black text-[10px] uppercase text-gray-400 tracking-widest italic">Thông tin liên lạc</th>
                  <th className="p-8 font-black text-[10px] uppercase text-gray-400 tracking-widest italic text-center">Vai trò</th>
                  <th className="p-8 font-black text-[10px] uppercase text-gray-400 tracking-widest italic text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users
                  .filter(u =>
                    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(u => (
                  <tr key={u.id} className="hover:bg-red-50/30 transition-all group">
                    <td className="p-8">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border-4 border-white group-hover:bg-red-600 transition-all italic">
                            {u.full_name?.[0] || u.email?.[0]?.toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div>
                          <span className="font-black text-lg text-gray-900 block uppercase italic tracking-tight group-hover:translate-x-1 transition-transform">{u.full_name || 'Hội viên mới'}</span>
                          <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest">#{u.id?.slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-8 italic">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-500 font-bold text-xs"><Mail size={12} className="text-red-600"/> {u.email}</div>
                        {u.phone && <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px]"><Phone size={12}/> {u.phone}</div>}
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 italic ${ROLES.find(r => r.value === u.role)?.color || ROLES[0].color}`}>
                          {ROLES.find(r => r.value === u.role)?.label || "Khách hàng"}
                        </span>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleEdit(u)} className="p-3 bg-gray-50 text-gray-300 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-gray-100"><Edit size={16} /></button>
                        <button onClick={() => { if(confirm("Xóa vĩnh viễn tài khoản này?")) api.delete(`/api/v1/admin/users/${u.id}`).then(() => loadUsers()) }} className="p-3 bg-gray-50 text-gray-300 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm border border-gray-100"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

{/* CỘT PHẢI: SIDE PANEL (FORM THÊM/SỬA) */}
      <div className={`fixed top-0 right-0 h-full bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] border-l border-gray-100 transition-all duration-500 ease-in-out z-50 ${isPanelOpen ? 'w-[450px] translate-x-0' : 'w-0 translate-x-full'}`}>
        <div className="w-[450px] h-full flex flex-col overflow-hidden">
          {/* Panel Header */}
          <div className="p-10 border-b flex justify-between items-center shrink-0 italic">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><UserCog size={24}/></div>
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                  {form.id ? "Hiệu chỉnh" : "Hội viên mới"}
                </h2>
                <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest mt-1 italic">Hồ sơ định danh DRC</p>
              </div>
            </div>
            <button
              onClick={handleClosePanel}
              className="p-4 bg-gray-50 text-gray-400 hover:text-red-600 rounded-full transition-all hover:bg-red-50 shadow-sm"
            >
              <X size={24} />
            </button>
          </div>

          {/* Panel Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar italic">

            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-gray-300 ml-8 tracking-widest italic">Họ và tên đầy đủ</label>
              <input required placeholder="Nhập tên..." className="w-full p-6 bg-gray-50 rounded-[30px] outline-none focus:ring-4 focus:ring-red-100 font-black italic uppercase text-sm border-2 border-transparent focus:border-red-600 shadow-inner" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-300 ml-8 tracking-widest italic">Địa chỉ Email</label>
                <input required type="email" placeholder="example@gmail.com" className="w-full p-5 bg-gray-50 rounded-[25px] outline-none focus:ring-4 focus:ring-red-100 font-bold italic text-xs shadow-inner" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-300 ml-8 tracking-widest italic">Số điện thoại liên lạc</label>
                <input type="tel" placeholder="09xx xxx xxx" className="w-full p-5 bg-gray-50 rounded-[25px] outline-none focus:ring-4 focus:ring-red-100 font-bold italic text-xs shadow-inner" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
            </div>

            <div className="p-8 bg-gray-50 rounded-[40px] border-2 border-gray-100 space-y-6 shadow-inner relative">
               <h4 className="text-[10px] font-black uppercase text-red-600 italic tracking-widest flex items-center gap-3 border-b pb-4"><Settings size={14}/> Thiết lập hệ thống</h4>

               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2 px-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic">Vai trò (Phân quyền)</label>
                    <select className="w-full p-4 bg-white rounded-2xl font-black italic text-[11px] uppercase border-2 border-transparent focus:border-red-600 outline-none cursor-pointer shadow-sm" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 px-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic">Trạng thái tài khoản</label>
                    <select className={`w-full p-4 bg-white rounded-2xl font-black italic text-[11px] uppercase border-2 border-transparent focus:border-red-600 outline-none cursor-pointer shadow-sm ${STATUSES.find(s => s.value === form.status)?.color}`} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
               </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-gray-300 ml-8 tracking-widest italic">Ghi chú quản lý</label>
              <textarea rows={4} placeholder="Nhập ghi chú chi tiết về thành viên..." className="w-full p-8 bg-gray-50 rounded-[35px] outline-none font-bold text-xs italic shadow-inner border-2 border-transparent focus:border-red-100 transition-all" value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
            </div>
          </form>

          {/* Panel Footer */}
          <div className="p-10 border-t bg-gray-50 flex flex-col gap-4 shrink-0 shadow-2xl italic">
            <button
              onClick={handleSubmit}
              className={`w-full py-6 ${form.id ? 'bg-blue-600' : 'bg-gray-900'} text-white rounded-[30px] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 transition-all active:scale-95 border-b-8 ${form.id ? 'border-blue-900' : 'border-red-600'} italic`}
            >
              {form.id ? "Cập nhật dữ liệu" : "Xác nhận tạo mới"}
            </button>
            <button
              type="button"
              onClick={handleClosePanel}
              className="w-full py-4 bg-white text-gray-400 border border-gray-200 rounded-[25px] font-black uppercase tracking-widest text-[9px] hover:bg-gray-100 transition-all shadow-sm"
            >
              Đóng bảng điều khiển
            </button>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {modal && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-bottom-10 italic">
          <div className={`${modal.type === 'success' ? 'bg-gray-900 border-red-600' : 'bg-red-600 border-white'} text-white px-10 py-5 rounded-[25px] shadow-2xl flex items-center gap-4 font-black italic text-xs uppercase tracking-widest border-l-8`}>
            {modal.type === 'success' ? <UserCheck size={24} className="text-red-600" /> : <X size={24} />}
            {modal.message}
          </div>
        </div>
      )}
    </div>
  );
}