'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Search } from 'lucide-react';
import api from '@/lib/api';
import type { Category } from '@/types/product';
import Loading from '@/app/loading';

interface CategoryForm {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string | null;
}

export default function CategoriesPage() {
  const [itemForm, setItemForm] = useState<CategoryForm>({
    id: null,
    name: '',
    slug: '',
    description: '',
    image_url: '',
    parent_id: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setItemForm(prev => ({ ...prev, image_url: previewUrl }));
    setIsUploading(true);

    const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = 'drc_tires';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'categories');

    try {
      if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local');
      }

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.secure_url) {
        const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_400/');
        setItemForm(prev => ({ ...prev, image_url: optimizedUrl }));
        URL.revokeObjectURL(previewUrl);
      } else {
        throw new Error('Upload failed: No secure_url in response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      URL.revokeObjectURL(previewUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = {
        name: itemForm.name,
        slug: itemForm.slug || itemForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: itemForm.description,
        image_url: itemForm.image_url,
        parent_id: itemForm.parent_id
      };

      if (itemForm.id) {
        await api.put(`/api/v1/admin/categories/${itemForm.id}`, formData);
      } else {
        await api.post('/api/v1/admin/categories', formData);
      }

      await loadCategories();
      setShowForm(false);
      setItemForm({
        id: null,
        name: '',
        slug: '',
        description: '',
        image_url: '',
        parent_id: null
      });
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Lưu thất bại. Vui lòng thử lại.');
    }
  };

  const handleEdit = (category: Category) => {
    setItemForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      parent_id: category.parent_id || null
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      await api.delete(`/api/v1/admin/categories/${id}`);
      await loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Xóa thất bại. Vui lòng thử lại.');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-wider">Quản lý danh mục</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-widest shadow-lg"
          >
            <Plus size={20} />
            Thêm danh mục
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {category.image_url && (
                <div className="aspect-square bg-gray-100">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Slug: {category.slug}</p>
                {category.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{category.description}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={16} />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wider">
                  {itemForm.id ? 'Sửa danh mục' : 'Thêm danh mục'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tên danh mục</label>
                    <input
                      type="text"
                      value={itemForm.name}
                      onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Slug</label>
                    <input
                      type="text"
                      value={itemForm.slug}
                      onChange={(e) => setItemForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="auto-generate từ tên"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục cha (tùy chọn)</label>
                  <select
                    value={itemForm.parent_id || ''}
                    onChange={(e) => setItemForm(prev => ({ ...prev, parent_id: e.target.value || null }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Không có</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Hình ảnh</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      className="hidden"
                      id="category-image"
                    />
                    <label
                      htmlFor="category-image"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                    >
                      <Upload size={16} />
                      Chọn ảnh
                    </label>
                    {isUploading && <div className="text-sm text-gray-500">Đang tải...</div>}
                  </div>
                  {itemForm.image_url && (
                    <div className="mt-4">
                      <img
                        src={itemForm.image_url}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-widest"
                  >
                    {itemForm.id ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}