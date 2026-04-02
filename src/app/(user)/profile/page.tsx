'use client';

import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', formData);
      updateUser(data.user);
    } catch (error) {
      console.error('Update failed', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Vui lòng đăng nhập</div>;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Hồ sơ cá nhân</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>Cập nhật</Button>
          </div>
        </form>
      </div>
    </div>
  );
}