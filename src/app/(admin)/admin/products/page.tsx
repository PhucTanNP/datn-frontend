'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Search } from 'lucide-react';
import api from '@/lib/api';
import type { Product, Category } from '@/types/product';

// Helper function to get primary image or fallback
// Backend response includes images array with full ProductImage objects
const getProductImage = (product: Product): string => {
  return product.images?.find(img => img.isPrimary)?.url ||
         product.images?.[0]?.url ||
         '/placeholder.png';
};

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = 'drc_tires'; // You may need to create this preset in Cloudinary

interface ProductForm {
  id: string | null;
  name: string;
  sku: string;
  slug: string;
  price: string;
  category_id: string;
  image: string;
  cloudinary_id: string;
  description: string;
}

export default function ProductsPage() {
  const [itemForm, setItemForm] = useState<ProductForm>({
    id: null,
    name: '',
    sku: '',
    slug: '',
    price: '',
    category_id: '',
    image: '',
    cloudinary_id: '',
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: ''
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/api/v1/admin/products'), // Backend tự động include images
        api.get('/api/v1/admin/categories')
      ]);
      setProducts(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setItemForm(prev => ({ ...prev, image: previewUrl }));
    setIsUploading(true);

    // Async upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

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
      console.log('Cloudinary response:', data);

      if (data.secure_url && data.public_id) {
        const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
        setItemForm(prev => ({
          ...prev,
          image: optimizedUrl,
          cloudinary_id: data.public_id
        }));
        URL.revokeObjectURL(previewUrl); // Cleanup local preview
      } else {
        throw new Error('Upload failed: Missing secure_url or public_id in response.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Upload failed:', err);
      alert(`Upload thất bại: ${message}\nCheck Console/Network tab.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.image) {
      alert("Vui lòng tải ảnh lên!");
      return;
    }

    try {
      const productData = {
        name: itemForm.name,
        sku: itemForm.sku,
        slug: itemForm.slug,
        price: Number(itemForm.price),
        category_id: itemForm.category_id,
        image: itemForm.image,
        cloudinary_id: itemForm.cloudinary_id,
        description: itemForm.description,
        is_active: true
      };

      if (itemForm.id) {
        // Update product
        await api.put(`/api/v1/admin/products/${itemForm.id}`, productData);
      } else {
        // Create product
        await api.post('/api/v1/admin/products', productData);
      }

      // Reset form and reload data
      setItemForm({
        id: null,
        name: '',
        sku: '',
        slug: '',
        price: '',
        category_id: '',
        image: '',
        cloudinary_id: '',
        description: ''
      });
      await loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Lưu sản phẩm thất bại. Vui lòng thử lại.');
    }
  };

  const handleEdit = (product: Product) => {
    setItemForm({
      id: product.id,
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      price: product.price.toString(),
      category_id: product.category?.id || '',
      image: getProductImage(product),
      cloudinary_id: product.images?.find(img => img.isPrimary)?.cloudinaryId || product.images?.[0]?.cloudinaryId || '',
      description: product.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (productId: string, productName: string) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.productId) return;

    setDeleting(true);
    try {
      await api.delete(`/api/v1/admin/products/${deleteModal.productId}`);
      await loadProducts();
      setDeleteModal({ isOpen: false, productId: null, productName: '' });
    } catch (error) {
      console.error('Failed to delete product:', error);
      // Có thể thêm toast notification thay vì alert
      alert('Xóa sản phẩm thất bại. Vui lòng thử lại.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, productId: null, productName: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in">
      <div className="lg:col-span-4">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 sticky top-[180px]">
          <h3 className="text-2xl font-black mb-8 uppercase flex items-center gap-3 italic">
            {itemForm.id ? <Edit size={24} className="text-blue-500" /> : <Plus size={24} className="text-red-600" />}
            {itemForm.id ? 'Cập nhật sản phẩm' : 'Sản phẩm mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative border-4 border-dashed border-gray-100 rounded-[32px] p-6 text-center hover:border-red-600 transition-all group cursor-pointer overflow-hidden bg-gray-50/30">
              {itemForm.image ? (
                <div className="relative h-56 rounded-3xl overflow-hidden">
                  <img src={itemForm.image} className="w-full h-full object-contain" />
                  <button type="button" onClick={() => setItemForm({...itemForm, image: ''})} className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-2xl hover:bg-red-700 transition-all"><X size={20} /></button>
                </div>
              ) : (
                <div className="py-16">
                  {isUploading ? (
                    <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto"></div>
                  ) : (
                    <>
                      <Upload size={48} className="mx-auto text-gray-200 mb-4 group-hover:text-red-600 transition-colors" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tải ảnh lên </p>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*" />
                    </>
                  )}
                </div>
              )}
            </div>
            <input required placeholder="Tên sản phẩm DRC..." className="w-full p-5 bg-gray-100 rounded-[25px] outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all font-black uppercase text-sm tracking-tight" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="SKU..." className="w-full p-5 bg-gray-100 rounded-[25px] outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all font-black text-sm" value={itemForm.sku} onChange={e => setItemForm({...itemForm, sku: e.target.value})} />
              <input required placeholder="Slug..." className="w-full p-5 bg-gray-100 rounded-[25px] outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all font-black text-sm" value={itemForm.slug} onChange={e => setItemForm({...itemForm, slug: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input required type="number" placeholder="Giá niêm yết" className="w-full p-5 bg-gray-100 rounded-[25px] outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all font-black text-sm" value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})} />
              <select className="w-full p-5 bg-gray-100 rounded-[25px] font-black text-[10px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-red-600" value={itemForm.category_id} onChange={e => setItemForm({...itemForm, category_id: e.target.value})}>
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <textarea rows={4} placeholder="Mô tả kỹ thuật chi tiết..." className="w-full p-6 bg-gray-100 rounded-[30px] outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all text-sm font-medium" value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} />

            <div className="flex gap-4 pt-4">
              {itemForm.id && <button type="button" onClick={() => setItemForm({ id: null, name: '', sku: '', slug: '', price: '', category_id: '', image: '', cloudinary_id: '', description: '' })} className="flex-1 py-5 bg-gray-100 text-gray-400 font-black rounded-[25px] uppercase tracking-widest hover:bg-gray-200">Hủy</button>}
              <button className={`flex-[2] py-5 ${itemForm.id ? 'bg-blue-600' : 'bg-red-600'} text-white font-black rounded-[25px] shadow-2xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95`}>
                {itemForm.id ? 'Lưu sản phẩm' : 'Đăng kho ngay'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b flex flex-col sm:flex-row justify-between items-center gap-6">
            <h3 className="font-black uppercase text-xl italic tracking-tighter">Kho hàng DRC</h3>
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input placeholder="Tìm kiếm lốp nhanh..." className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-red-600 transition-all font-bold text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="p-6 font-black text-[10px] uppercase text-gray-400 tracking-widest">Sản phẩm</th>
                  <th className="p-6 font-black text-[10px] uppercase text-gray-400 tracking-widest">Giá bán</th>
                  <th className="p-6 font-black text-[10px] uppercase text-gray-400 tracking-widest">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-all group">
                    <td className="p-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl p-2 border group-hover:scale-110 transition-transform">
                          <img
                            src={getProductImage(p)}
                            alt={p.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <span className="font-black text-sm text-gray-900 block group-hover:text-red-600 transition-colors uppercase italic">{p.name}</span>
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{p.category?.name || 'Chưa phân loại'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 font-black text-red-600 text-lg tracking-tighter">{p.price.toLocaleString('vi-VN')}đ</td>
                    <td className="p-6">
                      <div className="flex gap-3">
                        <button onClick={() => handleEdit(p)} className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={20} /></button>
                        <button onClick={() => handleDeleteClick(p.id, p.name)} className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                <p className="text-sm text-gray-600">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa sản phẩm <span className="font-semibold text-gray-900">{deleteModal.productName}</span> không?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleting}
              >
                {deleting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Đang xóa...
                  </div>
                ) : (
                  'Xóa sản phẩm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}