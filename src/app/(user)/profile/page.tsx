'use client';

import { useAuthStore } from '@/store/authStore';

import { User, Phone,MapPin, Mail, Shield, ShoppingBag,
  Settings, LogOut, ChevronRight,Camera
} from 'lucide-react';
import api from '@/lib/api';
import { useState, useEffect } from 'react';
import {Loading} from '@/app/loading';
import { NotFound } from '@/app/not-found';
import PleaseLogin from '@/app/pleaselogin/page';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const menuItems = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: <User size={20} /> },
    { id: 'orders', label: 'Lịch sử đơn hàng', icon: <ShoppingBag size={20} /> },
    { id: 'security', label: 'Bảo mật & Mật khẩu', icon: <Shield size={20} /> },
    { id: 'settings', label: 'Cài đặt tài khoản', icon: <Settings size={20} /> },
  ];
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    email: user?.email || '',
  });
  // displayName tries multiple fields from backend (snake_case or camelCase)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

// PUT /api/v1/auth/profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await api.put('/api/v1/auth/profile', formData);
      // backend uses ApiResponse wrapper: { success, message, data }
      const payload = resp.data?.data ?? resp.data;
      // payload can be either the user object or an object containing `user` (in other endpoints)
      const updatedUser = payload?.user ?? payload;
      updateUser(updatedUser);
      setIsEditing(false);
      setToast({ type: 'success', msg: 'Cập nhật hồ sơ thành công' });
    } catch (error) {
      console.error('Update failed', error);
      setToast({ type: 'error', msg: 'Cập nhật hồ sơ thất bại' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      email: user?.email || '',
    });
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!user) return <PleaseLogin />;
  if (loading) {
    return <Loading />;
  }
  if (notFound) {
    return <NotFound />;
  }
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR */}
          <aside className="lg:w-1/3">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="w-28 h-28 bg-red-600 rounded-[35%] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-red-200">
                    N
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-600 hover:text-red-600 transition">
                    <Camera size={16} />
                  </button>
                </div>
                <h2 className="mt-5 text-xl font-black text-gray-900">Nguyễn Văn A</h2>
                <p className="text-sm text-gray-400 font-medium italic">Thành viên thân thiết</p>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-sm ${
                      activeTab === item.id 
                        ? 'bg-red-50 text-red-600' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {item.icon}
                      {item.label}
                    </div>
                    <ChevronRight size={16} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
                  </button>
                ))}
                <div className="h-px bg-gray-50 my-4"></div>
              </nav>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    Chỉnh sửa thông tin
                  </button>
                )}
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                          disabled={!isEditing}
                          className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all outline-none font-medium ${
                            isEditing ? 'bg-white border-red-200 focus:ring-2 focus:ring-red-500' : 'bg-gray-50 border-gray-100 text-gray-600'
                          }`}
                        />
                      ) : (
                        <div className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-gray-50 text-gray-600">
                          {user?.full_name || 'Chưa có tên'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all outline-none font-medium ${
                          isEditing ? 'bg-white border-red-200 focus:ring-2 focus:ring-red-500' : 'bg-gray-50 border-gray-100 text-gray-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email liên hệ</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={formData.email}
                       disabled={true}
                      readOnly
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-gray-50 border-gray-100 text-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Địa chỉ mặc định</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-6 text-gray-400" size={18} />
                    <textarea 
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!isEditing}
                      rows={3}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all outline-none font-medium resize-none ${
                        isEditing ? 'bg-white border-red-200 focus:ring-2 focus:ring-red-500' : 'bg-gray-50 border-gray-100 text-gray-600'
                      }`}
                    ></textarea>
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-6 flex gap-3">
                    <button 
                      type="submit"
                      className="flex-grow bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-200 transition active:scale-95"
                    >
                      Cập nhật hồ sơ
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-bold transition"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </form>

              {/* Thông tin bổ sung */}
              <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                   <Shield size={16} className="text-red-600" />
                   Cấp độ bảo mật: Cao
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tài khoản của bạn đã được xác minh bằng số điện thoại. Để tăng cường bảo mật, bạn có thể kích hoạt xác thực 2 lớp trong phần cài đặt bảo mật.
                </p>
              </div>
            </div>
          </div>
        </div>
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl border-l-4 italic ${toast.type === 'success' ? 'bg-gray-900 text-white border-green-500' : 'bg-red-600 text-white border-red-800'}`}>
            {toast.msg}
          </div>
        </div>
      )}
      </main>
    
  );
}