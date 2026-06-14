'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Search, Info, Zap, Wind, Tag, Database, Ruler } from 'lucide-react';
import api from '@/lib/api';
import type { Product, Category } from '@/types/product';
import type { ProductImage } from '@/types/productImage';
import type { SpecsFormData } from '@/types/productSchema';
import { initialSpecs, generateAutoDescription, specsToFormData } from '@/types/productSchema';
import Loading from '@/app/loading';
import { NotFound } from '@/app/not-found';
import { uploadImage, createPreviewUrl, revokePreviewUrl } from '@/lib/cloudinary';

const generateSlug = (text: string) => {
  return text
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const emptyProduct: Product = {
  id: '', categoryId: '', sku: '', name: '', slug: '',
  price: 0, salePrice: 0, stockQuantity: 0,
  brand: '', size: '', sizeType: 'METRIC', pattern: '',
  productType: 'motorcycle_tire', hasTube: false, specs: {},
  isActive: true, createdAt: '', updatedAt: '',
};

export default function ProductsPage() {
  const [itemForm, setItemForm] = useState<Product>(emptyProduct);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [specsForm, setSpecsForm] = useState<SpecsFormData>(initialSpecs);

  // Khi edit: nạp specs từ product có sẵn
  const loadSpecsFromProduct = (product: Product) => {
    setSpecsForm(specsToFormData(product.specs || {}));
  };

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setNotFound(false);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get(`/api/v1/admin/products?page=${page}&limit=${limit}`),
        api.get('/api/v1/admin/categories')
      ]);
      setProducts(productsRes.data.data || []);
      const meta = productsRes.data.pagination;
      if (meta) setTotalPages(meta.totalPages || 1);
      setCategories(categoriesRes.data.data || []);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Hiển thị preview local ngay lập tức
    const previewUrl = createPreviewUrl(file);
    setItemForm(prev => ({ ...prev, images: { url: previewUrl } as ProductImage }));
    setIsUploading(true);

    try {
      // Upload lên Cloudinary qua module đã tách
      const result = await uploadImage(file);

      setItemForm(prev => ({
        ...prev,
        images: {
          url: result.url,
          cloudinaryId: result.cloudinaryId,
          isPrimary: true,
          sortOrder: 0,
        } as ProductImage,
      }));
      setImageChanged(true);

      revokePreviewUrl(previewUrl); // Giải phóng bộ nhớ preview local
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Upload thất bại: ${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Build specs JSONB — chỉ lấy field có giá trị
      const specs: Record<string, string> = {};
      for (const [key, val] of Object.entries(specsForm)) {
        if (val && val.trim() !== '') specs[key] = val.trim();
      }

      // Tự động sinh description từ specs
      const autoDesc = generateAutoDescription(itemForm, specsForm);

      const productData: Record<string, unknown> = {
        name: itemForm.name,
        sku: itemForm.sku,
        slug: itemForm.slug,
        stockQuantity: itemForm.stockQuantity || 0,
        price: Number(itemForm.price),
        categoryId: itemForm.categoryId || undefined,

        // Signature fields
        brand: itemForm.brand || '',
        size: itemForm.size || '',
        sizeType: itemForm.sizeType || 'METRIC',
        pattern: itemForm.pattern || undefined,
        productType: itemForm.productType,
        hasTube: itemForm.hasTube ?? null,

        // Specs + auto description
        specs,
        description: autoDesc,
      };

      // Chỉ gửi ảnh khi user thực sự upload ảnh mới
      if (imageChanged) {
        productData.image = itemForm.images?.url || undefined;
        productData.cloudinary_id = itemForm.images?.cloudinaryId || undefined;
      }

      if (itemForm.id) {
        await api.put(`/api/v1/admin/products/${itemForm.id}`, productData);
      } else {
        await api.post('/api/v1/admin/products', productData);
      }

      setSpecsForm(initialSpecs);
      setImageChanged(false);
      setItemForm(emptyProduct);
      setIsFormOpen(false);
      await loadProducts();
    } catch {
      // silent
    }
  };

  const handleEdit = (product: Product) => {
    setImageChanged(false);
    setItemForm({ ...product });
    loadSpecsFromProduct(product);
    setIsFormOpen(true);
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
      const axiosError = error as { response?: { data?: { message?: string } } };
      const msg = axiosError?.response?.data?.message || (error instanceof Error ? error.message : 'Vui lòng thử lại.');
      alert(`Xóa sản phẩm thất bại: ${msg}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, productId: null, productName: '' });
  };

  if (loading) {
    return <Loading />;
  }

  if (notFound) {
    return <NotFound />;
  }

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen italic font-sans relative">

      {/* HEADER QUẢN TRỊ */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Kho hàng <span className="text-red-600">DRC Tires</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Hệ thống quản lý sản phẩm nội bộ</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 shadow-sm rounded-2xl overflow-hidden border border-gray-200">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              placeholder="Tìm mã lốp hoặc SKU..."
              className="w-full pl-12 pr-6 py-4 bg-white outline-none font-bold italic text-xs transition-all focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setImageChanged(false); setItemForm({...emptyProduct, categoryId: categories[0]?.id || ''}); setIsFormOpen(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} /> Thêm lốp mới
          </button>
        </div>
      </div>

      {/* DANH SÁCH SẢN PHẨM TOÀN MÀN HÌNH */}
      <div className="max-w-7xl mx-auto bg-white rounded-[50px] shadow-2xl border border-gray-100 overflow-hidden min-h-[600px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left italic border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 italic">
              <tr>
                <th className="p-8 font-black text-[11px] uppercase text-gray-400 tracking-widest">Sản phẩm & SKU</th>
                <th className="p-8 font-black text-[11px] uppercase text-gray-400 tracking-widest text-center">Kích thước</th>
                <th className="p-8 font-black text-[11px] uppercase text-gray-400 tracking-widest text-center">Tải & Tốc độ</th>
                <th className="p-8 font-black text-[11px] uppercase text-gray-400 tracking-widest">Giá niêm yết</th>
                <th className="p-8 font-black text-[11px] uppercase text-gray-400 tracking-widest text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products
                .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(p => (
                <tr key={p.id} className="hover:bg-red-50/30 transition-all group">
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-white rounded-3xl p-2 border border-gray-100 group-hover:scale-110 transition-transform shadow-sm flex items-center justify-center shrink-0">
                      {p.images?.url ? (
                        <img src={p.images.url} className="max-w-full max-h-full object-contain" alt="tire" />
                      ) : (
                        <div className="text-gray-300"><Upload size={24} /></div>
                      )}
                      </div>
                      <div>
                        <span className="font-black text-base text-gray-900 block uppercase italic group-hover:text-red-600 transition-colors leading-tight mb-2">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-gray-700 bg-gray-100 px-3 py-1 rounded-full">SL: {p.stockQuantity ?? 0}</span>
                          <span className="text-[10px] font-black uppercase text-red-600 border border-red-100 px-3 py-1 rounded-full tracking-widest">{p.category?.name || 'Chưa phân loại'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl px-5 py-3 border border-gray-200 min-w-[90px]">
                          <Ruler size={16} className="text-gray-400 mb-1" />
                          <span className="font-black text-sm text-gray-900 leading-none">{p.size || '—'}</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">Size</span>
                        </div>
                        <div className="flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl px-5 py-3 border border-gray-200 min-w-[90px]">
                          <Ruler size={14} className="text-gray-400 mb-1" />
                          <span className="font-black text-sm text-gray-900 leading-none">{p.brand || '—'}</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">Thương hiệu</span>
                        </div>
                      </div>
                      <div className="flex gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        SKU: <span className="text-gray-700">{p.sku || '—'}</span>
                        <span className="text-gray-300">|</span>
                        Pattern: <span className="text-gray-700">{p.pattern || '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center bg-amber-50 rounded-2xl px-5 py-3 border border-amber-200 min-w-[80px]">
                          <Database size={16} className="text-amber-500 mb-1" />
                          <span className="font-black text-base text-amber-700 leading-none">{p.productType ? (p.productType === 'motorcycle_tire' ? 'Lốp xe máy' : p.productType === 'bicycle_tire' ? 'Lốp xe đạp' : p.productType === 'motorcycle_tube' ? 'Săm xe máy' : 'Săm xe đạp') : '—'}</span>
                          <span className="text-[8px] font-bold text-amber-500 uppercase mt-1">Loại SP</span>
                        </div>
                        <div className="flex flex-col items-center bg-blue-50 rounded-2xl px-5 py-3 border border-blue-200 min-w-[80px]">
                          <Info size={16} className="text-blue-500 mb-1" />
                          <span className="font-black text-base text-blue-700 leading-none">{p.hasTube !== null ? (p.hasTube ? 'Có săm' : 'Không săm') : '—'}</span>
                          <span className="text-[8px] font-bold text-blue-500 uppercase mt-1">Săm</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col items-start">
                      <span className="text-2xl font-black text-gray-900 tracking-tighter italic">{(p.price || 0).toLocaleString('vi-VN')}<span className="text-sm font-bold text-gray-500 ml-1">đ</span></span>
                      {p.salePrice ? (
                        <span className="text-sm font-bold text-red-500 line-through">{(p.salePrice).toLocaleString('vi-VN')}đ</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex justify-center gap-4">
                      <button onClick={() => handleEdit(p)} className="p-4 bg-gray-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-md active:scale-90"><Edit size={20} /></button>
                      <button onClick={() => handleDeleteClick(p.id, p.name)} className="p-4 bg-gray-100 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-md active:scale-90"><Trash2 size={20} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="py-60 text-center flex flex-col items-center italic">
              <Database size={100} className="text-gray-100 mb-6" />
              <p className="text-gray-300 font-black uppercase italic tracking-widest text-2xl">Kho hàng DRC hiện đang trống rỗng</p>
            </div>
          )}
        </div>
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto mt-6 flex items-center justify-between bg-white rounded-3xl shadow-lg border border-gray-100 px-6 py-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Trang {page} / {totalPages}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl font-black text-xs uppercase tracking-wider transition-all"
            >
              ← Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                  p === page
                    ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl font-black text-xs uppercase tracking-wider transition-all"
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      {/* MODAL FORM (THÊM / SỬA) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 italic">

            {/* Modal Header */}
            <div className="bg-white px-10 py-8 border-b flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                  {itemForm.id ? <Edit className="text-blue-500" /> : <Plus className="text-red-600" />}
                  {itemForm.id ? "Hiệu chỉnh lốp" : "Đăng lốp mới"}
                </h2>
                <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest mt-1">Vui lòng điền đầy đủ các thông số chuẩn DRC</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-4 bg-gray-50 text-gray-400 hover:text-red-600 rounded-full transition-all hover:bg-red-50">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - Cuộn nội bộ */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">

              {/* Row 1: Image & Basic Info */}
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-56 shrink-0 relative border-4 border-dashed border-gray-100 rounded-[40px] p-6 text-center hover:border-red-500 transition-all group bg-gray-50/30 overflow-hidden aspect-square flex flex-col items-center justify-center">
                  {itemForm.images?.url ? (
                    <div className="relative w-full h-full">
                      <img src={itemForm.images.url} className="w-full h-full object-fill rounded-[32px]" alt="Preview" />
                      <button type="button" onClick={() => { setImageChanged(false); setItemForm({...itemForm, images: undefined}); }} className="absolute top-0 right-0 bg-red-600 text-white p-2 rounded-full shadow-lg"><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center cursor-pointer">
                      {isUploading ? <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div> : <Upload size={32} className="text-gray-300 group-hover:text-red-500 mb-2 transition-colors" />}
                      <p className="text-[9px] font-black uppercase text-gray-400 italic">Tải ảnh lên</p>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest italic font-bold">Tên sản phẩm lốp</label>
                    <input required placeholder="Ví dụ: DRC 1100-20 D602..." className="w-full p-4 bg-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-100 font-black italic uppercase text-sm border-2 border-transparent focus:border-red-100 transition-all shadow-inner" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value, slug: generateSlug(e.target.value)})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest italic font-bold">Giá niêm yết (đ)</label>
                      <input required type="number" className="w-full p-4 bg-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-100 font-black text-sm border-2 border-transparent focus:border-red-100 transition-all shadow-inner" value={itemForm.price || 0} onChange={e => setItemForm({...itemForm, price: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest italic font-bold">Mã phân loại</label>
                      <select className="w-full p-4 bg-gray-100 rounded-2xl font-black italic text-[10px] uppercase outline-none border-2 border-transparent focus:border-red-100 transition-all cursor-pointer shadow-sm" value={itemForm.categoryId || ''} onChange={e => setItemForm({...itemForm, categoryId: e.target.value})}>
                        <option value="" disabled className="text-gray-400">-- Chọn phân loại --</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Secondary Identifiers */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1 relative">
                  <Tag className="absolute left-6 top-1/2 translate-y-1 text-gray-300" size={18} />
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-12 tracking-widest font-bold">Mã SKU kho</label>
                  <input placeholder="SKU-XXX..." className="w-full p-4 pl-14 bg-gray-50 rounded-2xl outline-none text-xs font-black uppercase shadow-inner" value={itemForm.sku} onChange={e => setItemForm({...itemForm, sku: e.target.value})} />
                </div>
                <div className="space-y-1 relative">
                  <Database className="absolute left-6 top-1/2 translate-y-1 text-gray-300" size={18} />
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-12 tracking-widest font-bold">Số lượng tồn kho</label>
                  <input type="number" min="0" placeholder="0" className="w-full p-4 pl-14 bg-gray-50 rounded-2xl outline-none text-xs font-black uppercase shadow-inner" value={itemForm.stockQuantity || 0} onChange={e => setItemForm({...itemForm, stockQuantity: Number(e.target.value)})} />
                </div>
              </div>

              {/* Row 3: Signature + Specs Box */}
              <div className="p-10 bg-red-50/20 rounded-[50px] border-2 border-red-50 space-y-8 shadow-inner relative">
                <div className="absolute top-6 right-10 flex gap-2">
                   <Zap size={16} className="text-red-600 animate-pulse" />
                   <Wind size={16} className="text-blue-500 animate-pulse" />
                </div>
                <h4 className="text-xs font-black uppercase text-red-600 flex items-center gap-3 border-b-2 border-red-100 pb-4 italic">
                  <Info size={16} /> Thông số định danh sản phẩm
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Thương hiệu</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-red-600 outline-none" value={itemForm.brand || ''} onChange={e => setItemForm({...itemForm, brand: e.target.value})} placeholder="DPLUS, DRC..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Kích cỡ</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-red-600 outline-none" value={itemForm.size || ''} onChange={e => setItemForm({...itemForm, size: e.target.value})} placeholder="120/70-17" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Kiểu hoa (Pattern)</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-red-600 outline-none" value={itemForm.pattern || ''} onChange={e => setItemForm({...itemForm, pattern: e.target.value})} placeholder="D354, 119..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Loại sản phẩm</label>
                    <select className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-red-600 outline-none" value={itemForm.productType} onChange={e => setItemForm({...itemForm, productType: e.target.value as Product['productType']})}>
                      <option value="motorcycle_tire">Lốp xe máy</option>
                      <option value="bicycle_tire">Lốp xe đạp</option>
                      <option value="motorcycle_tube">Săm xe máy</option>
                      <option value="bicycle_tube">Săm xe đạp</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Hệ size</label>
                    <select className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-red-600 outline-none" value={itemForm.sizeType || 'METRIC'} onChange={e => setItemForm({...itemForm, sizeType: e.target.value as Product['sizeType']})}>
                      <option value="METRIC">Metric</option>
                      <option value="INCH">Inch</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Có săm?</label>
                    <select className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-red-600 outline-none" value={itemForm.hasTube === undefined ? '' : itemForm.hasTube ? 'true' : 'false'} onChange={e => {
                      const val = e.target.value;
                      setItemForm({...itemForm, hasTube: val === '' ? undefined : val === 'true'});
                    }}>
                      <option value="">Không áp dụng</option>
                      <option value="true">Có săm (Tube-type)</option>
                      <option value="false">Không săm (Tubeless)</option>
                    </select>
                  </div>
                </div>

                <h4 className="text-xs font-black uppercase text-blue-600 flex items-center gap-3 border-b-2 border-blue-100 pb-4 italic mt-10">
                  <Info size={16} /> Thông số kỹ thuật chuyên sâu
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Nhóm lốp</label>
                    <select className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.nhom_lop} onChange={e => setSpecsForm({...specsForm, nhom_lop: e.target.value})}>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Scooter">Scooter</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Dòng series</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.dong_series} onChange={e => setSpecsForm({...specsForm, dong_series: e.target.value})} placeholder="D602, X01..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Cấu trúc lốp</label>
                    <select className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.cau_truc_lop} onChange={e => setSpecsForm({...specsForm, cau_truc_lop: e.target.value})}>
                      <option value="Millimetric">Millimetric</option>
                      <option value="Normal">Normal</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Phân loại tải</label>
                    <select className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.phan_loai_tai} onChange={e => setSpecsForm({...specsForm, phan_loai_tai: e.target.value})}>
                      <option value="SV">SV (Standard)</option>
                      <option value="EV">EV (Extra)</option>
                      <option value="LV">LV (Light)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Đường kính vành (&quot;)</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.duong_kinh_vanh} onChange={e => setSpecsForm({...specsForm, duong_kinh_vanh: e.target.value})} placeholder="17" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Rộng vành tiêu chuẩn (&quot;)</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.rong_vanh_tieu_chuan} onChange={e => setSpecsForm({...specsForm, rong_vanh_tieu_chuan: e.target.value})} placeholder="1.85" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Rộng vành thích hợp (&quot;)</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.rong_vanh_thich_hop} onChange={e => setSpecsForm({...specsForm, rong_vanh_thich_hop: e.target.value})} placeholder="1.60-2.15" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Đường kính ngoài (mm)</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.duong_kinh_ngoai} onChange={e => setSpecsForm({...specsForm, duong_kinh_ngoai: e.target.value})} placeholder="627" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Chiều rộng toàn bộ (mm)</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.chieu_rong_toan_bo} onChange={e => setSpecsForm({...specsForm, chieu_rong_toan_bo: e.target.value})} placeholder="110" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Chiều sâu hoa (mm)</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.chieu_sau_hoa} onChange={e => setSpecsForm({...specsForm, chieu_sau_hoa: e.target.value})} placeholder="8" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Số lớp bố</label>
                    <select className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.so_lop_bo} onChange={e => setSpecsForm({...specsForm, so_lop_bo: e.target.value})}>
                      <option value="4PR">4PR</option>
                      <option value="2PR">2PR</option>
                      <option value="6PR">6PR</option>
                      <option value="8PR">8PR</option>
                      <option value="10PR">10PR</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Chỉ số tải &amp; tốc độ</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.chi_so_tai_toc_do} onChange={e => setSpecsForm({...specsForm, chi_so_tai_toc_do: e.target.value})} placeholder="52P" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Tải trọng lớn nhất (kg)</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.tai_trong_lon_nhat} onChange={e => setSpecsForm({...specsForm, tai_trong_lon_nhat: e.target.value})} placeholder="200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Nội áp tiêu chuẩn (kPa)</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.noi_ap_tieu_chuan} onChange={e => setSpecsForm({...specsForm, noi_ap_tieu_chuan: e.target.value})} placeholder="280" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Tốc độ tối đa (km/h)</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.toc_do_toi_da} onChange={e => setSpecsForm({...specsForm, toc_do_toi_da: e.target.value})} placeholder="150" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Van</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.van} onChange={e => setSpecsForm({...specsForm, van: e.target.value})} placeholder="TR87, TR4..." />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest italic font-bold">Trọng lượng (g)</label>
                    <input className="w-full p-3 bg-white border-2 border-transparent rounded-xl font-black italic text-xs shadow-sm focus:border-blue-600 outline-none" value={specsForm.trong_luong} onChange={e => setSpecsForm({...specsForm, trong_luong: e.target.value})} placeholder="150" />
                  </div>
                </div>
              </div>

              {/* ── Mô tả tự động từ thông số kỹ thuật ── */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-[40px] border-2 border-gray-200 p-8 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-gray-500 flex items-center gap-3 italic tracking-wider">
                    <Zap size={16} className="text-amber-500" /> Mô tả tự động
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const desc = generateAutoDescription(itemForm, specsForm);
                      setItemForm(prev => ({ ...prev, description: desc }));
                    }}
                    className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-full transition-all tracking-wider italic"
                  >
                    Sinh mô tả
                  </button>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-gray-100 min-h-[80px] shadow-sm">
                  {(() => {
                    const desc = generateAutoDescription(itemForm, specsForm);
                    const lines = desc.split('\n');
                    return lines.length > 1 ? (
                      <>
                        <p className="font-black text-gray-900 text-base italic leading-tight mb-3">{lines[0]}</p>
                        <div className="flex flex-wrap gap-2">
                          {lines[1].split(' | ').map((item, idx) => (
                            <span key={idx} className="text-[10px] font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 italic">
                              {item}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 text-sm italic font-medium">{desc || 'Chưa có thông số — mô tả sẽ tự động được tạo'}</p>
                    );
                  })()}
                </div>
                {itemForm.description && (
                  <p className="text-[9px] text-green-600 font-bold italic flex items-center gap-2">
                    ✓ Đã lưu mô tả (bấm &quot;Sinh mô tả&quot; để cập nhật)
                  </p>
                )}
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-10 py-10 border-t bg-gray-50 flex gap-6 shrink-0 shadow-2xl">
              <button
                type="button"
                onClick={() => {
                  setImageChanged(false);
                  setIsFormOpen(false);
                  setItemForm(emptyProduct);
                  setSpecsForm(initialSpecs);
                }}
                className="flex-1 py-6 bg-white text-gray-400 border border-gray-200 rounded-[30px] font-black uppercase tracking-widest text-[11px] hover:bg-gray-100 transition-all active:scale-95 shadow-sm shadow-gray-100"
              >
                Hủy bỏ thay đổi
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className={`flex-[2] py-6 ${itemForm.id ? 'bg-blue-600' : 'bg-red-600'} text-white rounded-[30px] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 transition-all active:scale-95 shadow-red-900/20 border-b-8 ${itemForm.id ? 'border-blue-900/50' : 'border-red-900/50'} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {isUploading ? 'Đang tải ảnh lên...' : (itemForm.id ? "Lưu lại thay đổi hệ thống" : "Xác nhận đăng bán vào kho")}
              </button>
            </div>
          </div>
        </div>
      )}

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