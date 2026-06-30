'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Camera, Upload, Shield,
  Sparkles, Merge, Search, RotateCcw, Bike, Layers,
  CheckCircle2, CarFront, ShoppingCart, ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { scanTire } from '@/services/inspectionService';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types/product';
import type { ScanResponse, TireRecommendItem, PatternBenefit, VehicleInfo } from '@/services/inspectionService';

// ── Kiểu dữ liệu ─────────────────────────────────────────────────────────

interface SideState {
  file: File | null;
  preview: string | null;
}

type Step = 'upload' | 'detecting' | 'vehicle_select' | 'recommending' | 'done';

// ── Helper ───────────────────────────────────────────────────────────────

const POSITION_LABELS: Record<string, { label: string; short: string; color: string }> = {
  front: { label: 'Lốp trước', short: 'TRƯỚC', color: 'bg-blue-600' },
  rear: { label: 'Lốp sau', short: 'SAU', color: 'bg-orange-600' },
};

function groupByBrand(items: TireRecommendItem[]): Record<string, TireRecommendItem[]> {
  const map: Record<string, TireRecommendItem[]> = {};
  for (const item of items) {
    if (!map[item.brand]) map[item.brand] = [];
    map[item.brand].push(item);
  }
  return map;
}

function groupByPosition(items: TireRecommendItem[]): Record<string, TireRecommendItem[]> {
  const map: Record<string, TireRecommendItem[]> = {};
  for (const item of items) {
    if (!map[item.position]) map[item.position] = [];
    map[item.position].push(item);
  }
  return map;
}

function PriceTag({ item }: { item: TireRecommendItem }) {
  if (!item.sale_price_inc_vat) return null;
  return (
    <span className="font-bold text-red-600">
      {item.sale_price_inc_vat.toLocaleString()}đ
    </span>
  );
}

function BenefitBadge({ benefit }: { benefit: PatternBenefit | null }) {
  if (!benefit) return null;
  return (
    <div className="mt-2 space-y-1 text-xs bg-amber-50 rounded-lg p-2 border border-amber-200">
      {benefit.loi_ich && (
        <div className="flex items-start gap-1.5">
          <span className="text-amber-600 mt-0.5">✦</span>
          <span className="text-amber-900">{benefit.loi_ich}</span>
        </div>
      )}
      {benefit.phu_hop && (
        <div className="flex items-start gap-1.5">
          <span className="text-blue-500 mt-0.5">▸</span>
          <span className="text-blue-800">{benefit.phu_hop}</span>
        </div>
      )}
      {benefit.dieu_kien_duong && (
        <div className="flex items-start gap-1.5">
          <span className="text-green-500 mt-0.5">●</span>
          <span className="text-green-800">{benefit.dieu_kien_duong}</span>
        </div>
      )}
    </div>
  );
}

/** Helper: trích xuất message từ lỗi (axios hoặc general) mà không dùng any */
function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    err.response &&
    typeof err.response === 'object' &&
    'data' in err.response &&
    err.response.data &&
    typeof err.response.data === 'object' &&
    'message' in err.response.data &&
    typeof err.response.data.message === 'string'
  ) {
    return err.response.data.message;
  }
  return fallback;
}

function TireCard({ item }: { item: TireRecommendItem }) {
  const addItem = useCartStore(s => s.addItem);
  const pos = POSITION_LABELS[item.position] || { label: '', short: '', color: 'bg-gray-600' };

  const handleAddToCart = () => {
    const pid = item.product_id || `temp_${item.brand}_${item.pattern_code}_${Date.now()}`;
    const cartItem: Product = {
      id: pid,
      brand: item.brand ?? '',
      size: item.size ?? '',
      pattern: item.pattern_code,
      name: item.product_name || `${item.brand} ${item.pattern_code}`,
      slug: item.product_slug || '',
      price: item.sale_price_inc_vat || 0,
      salePrice: item.sale_price_inc_vat ?? undefined,
      images: item.image_url ? { url: item.image_url } as Product['images'] : undefined,
      sku: '',
      productType: 'motorcycle_tire',
      stockQuantity: 1,
      isActive: true,
      hasTube: false,
      createdAt: '',
      updatedAt: '',
    };
    addItem(cartItem);
    toast.success(`Đã thêm ${item.brand} ${item.pattern_code} vào giỏ hàng`);
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${pos.color}`}>
              {pos.short}
            </span>
            <span className="font-mono font-bold text-gray-900 text-lg">
              {item.pattern_code}
            </span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {item.tire_type || 'N/A'}
            </span>
            {item.tube_size && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Săm: {item.tube_size}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {item.brand} · Size: {item.size}
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <div className="text-xs text-gray-400 mb-0.5">Giá niêm yết</div>
          <PriceTag item={item} />
        </div>
      </div>

      {item.pattern_benefit && <BenefitBadge benefit={item.pattern_benefit} />}

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        {item.product_slug && (
          <Link
            href={`/products/${item.product_slug}`}
            className="flex-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 px-3 transition-colors text-center flex items-center justify-center gap-1"
          >
            <ExternalLink size={13} /> Chi tiết
          </Link>
        )}
        <button
          onClick={handleAddToCart}
          className="flex-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg py-2 px-3 transition-colors flex items-center justify-center gap-1"
        >
          <ShoppingCart size={13} /> Thêm giỏ hàng
        </button>
      </div>
    </div>
  );
}

function BrandSection({ brand, items }: { brand: string; items: TireRecommendItem[] }) {
  return (
    <Card className="border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-4 py-2.5">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <span className="w-1.5 h-5 bg-red-500 rounded-full inline-block" />
          {brand}
          <span className="text-gray-400 font-normal text-xs">({items.length} mã gai)</span>
        </h4>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((item, idx) => (
          <TireCard key={idx} item={item} />
        ))}
      </div>
    </Card>
  );
}

function PositionSection({ position, size, items }: { position: string; size: string; items: TireRecommendItem[] }) {
  const pos = POSITION_LABELS[position] || { label: position, short: position, color: 'bg-gray-600' };
  const grouped = groupByBrand(items);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-8 rounded-full ${pos.color}`} />
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{pos.label}</h3>
          <p className="text-sm text-gray-400">Size {size} · {items.length} lốp</p>
        </div>
      </div>
      {Object.entries(grouped).map(([brand, brandItems]) => (
        <BrandSection key={brand} brand={brand} items={brandItems} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT CHÍNH
//  ═══════════════════════════════════════════════════════════════════════════

export default function TechnologyPage() {
  const [sideA, setSideA] = useState<SideState>({ file: null, preview: null });
  const [sideB, setSideB] = useState<SideState>({ file: null, preview: null });
  const [step, setStep] = useState<Step>('upload');
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const aRef = useRef<HTMLInputElement>(null);
  const bRef = useRef<HTMLInputElement>(null);

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleFile = (side: 'A' | 'B') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (side === 'A') setSideA({ file, preview });
    else setSideB({ file, preview });
    setError(null);
    setResult(null);
    setStep('upload');
  };

  const removeSide = (side: 'A' | 'B') => {
    if (side === 'A') {
      if (sideA.preview) URL.revokeObjectURL(sideA.preview);
      setSideA({ file: null, preview: null });
    } else {
      if (sideB.preview) URL.revokeObjectURL(sideB.preview);
      setSideB({ file: null, preview: null });
    }
    setResult(null);
    setStep('upload');
  };

  const handleScan = async () => {
    if (!sideA.file) return;
    setStep('detecting');
    setError(null);
    try {
      const data = await scanTire(sideA.file, sideB.file);
      if (!data.success) {
        setError(data.merged?.error || 'Không thể detect thông số lốp');
        setStep('upload');
        return;
      }
      setResult(data);
      // Nếu có vehicles → chuyển sang bước chọn xe
      if (data.vehicles && data.vehicles.length > 0) {
        setStep('vehicle_select');
        setSelectedVehicle('');
      } else {
        setStep('done');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Lỗi kết nối'));
      setStep('upload');
    }
  };

  const handleRecommend = async () => {
    if (!selectedVehicle || !sideA.file) return;
    setStep('recommending');
    setError(null);
    try {
      const data = await scanTire(sideA.file, sideB.file, selectedVehicle);
      setResult(data);
      setStep('done');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Lỗi gợi ý'));
      setStep('vehicle_select');
    }
  };

  const resetAll = () => {
    if (sideA.preview) URL.revokeObjectURL(sideA.preview);
    if (sideB.preview) URL.revokeObjectURL(sideB.preview);
    setSideA({ file: null, preview: null });
    setSideB({ file: null, preview: null });
    setResult(null);
    setError(null);
    setStep('upload');
    setSelectedVehicle('');
    setVehicleSearch('');
  };

  // Filter vehicles by search text
  const filteredVehicles = (result?.vehicles || []).filter(v =>
    v.name.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
              <Sparkles size={16} />
              AI Scan + Gợi ý thông minh
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Quét lốp xe
              <span className="block text-red-200">nhận gợi ý tức thì</span>
            </h1>
            <p className="text-lg text-red-100 max-w-xl mx-auto">
              Chụp <strong>2 mặt</strong> của cùng 1 lốp → AI detect thông số → 
              chọn <strong>tên xe</strong> → gợi ý tất cả mã gai trước &amp; sau.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 -mt-8 relative z-10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Camera, step: '①', title: 'Chụp 2 mặt', desc: 'Cùng 1 lốp, ảnh mặt A + B' },
            { icon: Merge, step: '②', title: 'AI hợp nhất', desc: 'Gộp detect từ 2 mặt' },
            { icon: Bike, step: '③', title: 'Chọn tên xe', desc: 'VD: Vario 125, Vision...' },
            { icon: Layers, step: '④', title: 'Gợi ý lốp trước/sau', desc: 'Tất cả brand × pattern' },
          ].map((f, i) => (
            <Card key={i} className="border-0 shadow-lg shadow-gray-200/50 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <f.icon size={20} className="text-red-600" />
                </div>
                <div>
                  <div className="text-xs text-red-500 font-bold">{f.step}</div>
                  <h3 className="font-bold text-gray-900 text-sm">{f.title}</h3>
                  <p className="text-xs text-gray-400">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Main Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* ─── LEFT: Upload 2 mặt ─── */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-2 border-dashed border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Camera size={28} className="mx-auto text-red-500 mb-2" />
                  <h2 className="text-xl font-bold text-gray-900">Chụp 2 mặt lốp</h2>
                  <p className="text-xs text-gray-400">Cùng 1 lốp — mặt A + mặt B</p>
                </div>

                {/* Side A */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                      <span className="w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">A</span>
                      Mặt A <span className="text-gray-400 font-normal">(bắt buộc)</span>
                    </span>
                    {sideA.preview && (
                      <button onClick={() => removeSide('A')} className="text-xs text-red-500 hover:underline">Xoá</button>
                    )}
                  </div>
                  {!sideA.preview ? (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-red-300 hover:bg-red-50/30 transition-all">
                        <Upload size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm font-semibold text-gray-500">Chọn ảnh mặt A</p>
                      </div>
                      <input ref={aRef} type="file" accept="image/*" className="hidden" onChange={handleFile('A')} />
                    </label>
                  ) : (
                    <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden group">
                      <Image src={sideA.preview} alt="Side A" fill className="object-contain" />
                    </div>
                  )}
                </div>

                {/* Side B */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                      <span className="w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">B</span>
                      Mặt B <span className="text-gray-400 font-normal">(không bắt buộc)</span>
                    </span>
                    {sideB.preview && (
                      <button onClick={() => removeSide('B')} className="text-xs text-red-500 hover:underline">Xoá</button>
                    )}
                  </div>
                  {!sideB.preview ? (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                        <Upload size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm font-semibold text-gray-500">Chọn ảnh mặt B</p>
                      </div>
                      <input ref={bRef} type="file" accept="image/*" className="hidden" onChange={handleFile('B')} />
                    </label>
                  ) : (
                    <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden group">
                      <Image src={sideB.preview} alt="Side B" fill className="object-contain" />
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                {step === 'upload' && (
                  <Button
                    onClick={handleScan}
                    disabled={!sideA.file}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Search size={16} />
                    Quét + Detect
                  </Button>
                )}

                {(step === 'detecting' || step === 'recommending') && (
                  <div className="text-center py-4">
                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600">
                      {step === 'detecting' ? 'AI đang phân tích 2 mặt lốp...' : 'Đang truy vấn tất cả mã gai...'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {step === 'detecting' ? 'Detect → Hợp nhất kết quả' : 'Tra Neo4j tìm lốp trước/sau'}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ─── RIGHT: Results ─── */}
          <div className="lg:col-span-3">
            {/* No results yet */}
            {!result && step === 'upload' && (
              <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-100">
                <CardContent className="p-8 text-center">
                  <Shield size={64} className="mx-auto text-gray-200 mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Chờ kết quả...</h3>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    Tải ảnh mặt A (và mặt B nếu có), nhấn <strong>Quét + Detect</strong>.
                    Sau đó chọn <strong>tên xe</strong> để xem tất cả lốp phù hợp.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Detecting */}
            {(step === 'detecting' || step === 'recommending') && (
              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-blue-900">
                    {step === 'detecting' ? 'AI đang xử lý...' : 'Đang gợi ý...'}
                  </h3>
                </CardContent>
              </Card>
            )}

            {/* Vehicle selection step */}
            {result && step === 'vehicle_select' && (
              <div className="space-y-4">
                {/* Merged result */}
                <Card className="bg-white border-green-100">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 size={18} className="text-green-600" />
                      <span className="font-bold text-gray-900">Đã detect — chọn xe để gợi ý lốp</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Thương hiệu</div>
                        <div className="font-bold text-gray-900 text-lg">
                          {result.merged.brand || '—'}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Kích cỡ</div>
                        <div className="font-bold text-red-600 text-xl">
                          {result.merged.size || '—'}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Mã gai</div>
                        <div className="font-bold text-gray-900 text-lg">
                          {result.merged.pattern || '—'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle selector */}
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CarFront size={18} className="text-blue-600" />
                      <span className="font-bold text-gray-900">
                        Chọn xe của bạn ({result.vehicles?.length || 0} xe có size {result.merged.size})
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Tìm nhanh tên xe..."
                      value={vehicleSearch}
                      onChange={e => setVehicleSearch(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <div className="max-h-60 overflow-y-auto space-y-1 mb-4 border border-gray-100 rounded-xl p-1">
                      {filteredVehicles.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">
                          Không tìm thấy xe phù hợp
                        </p>
                      ) : (
                        filteredVehicles.map((v) => (
                          <button
                            key={v.name}
                            onClick={() => setSelectedVehicle(v.name)}
                            className={`w-full text-left p-2.5 rounded-lg text-sm font-medium transition-all ${
                              selectedVehicle === v.name
                                ? 'bg-red-600 text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {v.name}
                          </button>
                        ))
                      )}
                    </div>

                    <Button
                      onClick={handleRecommend}
                      disabled={!selectedVehicle}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      <Layers size={16} />
                      Gợi ý lốp cho {selectedVehicle || '...'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Final results: recommend */}
            {result && step === 'done' && result.recommend && (
              <div className="space-y-4">
                {/* Info header */}
                <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={20} />
                      <span className="font-bold">Kết quả gợi ý cho: {result.recommend.vehicle_name}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-green-100">
                      <span>Lốp trước: <strong>{result.recommend.front_size || '—'}</strong></span>
                      <span>|</span>
                      <span>Lốp sau: <strong>{result.recommend.rear_size || '—'}</strong></span>
                      <span>|</span>
                      <span>Tổng: <strong>{result.recommend.tires?.length || 0} lốp</strong></span>
                    </div>
                  </CardContent>
                </Card>

                {/* Group by position (front / rear) */}
                {result.recommend.success === false ? (
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-5 text-center">
                      <p className="text-amber-800 font-medium">{result.recommend.error}</p>
                    </CardContent>
                  </Card>
                ) : (
                  (() => {
                    const grouped = groupByPosition(result.recommend.tires || []);
                    return Object.entries(grouped).map(([position, items]) => {
                      const size = items[0]?.size || '';
                      return (
                        <PositionSection
                          key={position}
                          position={position}
                          size={size}
                          items={items}
                        />
                      );
                    });
                  })()
                )}

                {/* Actions */}
                <div className="flex gap-2 items-center bg-white p-4 rounded-xl border border-gray-200">
                  <span className="text-sm text-gray-600">
                    Chọn xe khác?
                  </span>
                  <button
                    onClick={() => { setStep('vehicle_select'); }}
                    className="text-sm text-red-600 hover:underline font-medium"
                  >
                    Quay lại chọn xe
                  </button>
                  <button onClick={resetAll} className="ml-auto text-sm text-red-500 hover:underline flex items-center gap-1">
                    <RotateCcw size={14} /> Quét lại
                  </button>
                </div>
              </div>
            )}

            {/* Done with products directly (CASE 1: size+pattern) */}
            {result && step === 'done' && !result.recommend && result.case_type === 'size_pattern' && result.products?.length > 0 && (
              <div className="space-y-4">
                {/* Info header */}
                <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={20} />
                      <span className="font-bold">Kết quả gợi ý lốp</span>
                    </div>
                    <div className="flex gap-4 text-sm text-green-100">
                      <span>Size: <strong>{result.merged.size}</strong></span>
                      <span>|</span>
                      <span>Pattern: <strong>{result.merged.pattern}</strong></span>
                      <span>|</span>
                      <span>Tổng: <strong>{result.products.length} lốp</strong></span>
                    </div>
                  </CardContent>
                </Card>

                {/* Group by brand */}
                {(() => {
                  const items: TireRecommendItem[] = result.products.map(p => ({
                    position: 'rear',
                    size: p.size,
                    brand: p.brand,
                    pattern_code: p.pattern,
                    sale_price_inc_vat: p.sale_price ?? p.price,
                    pattern_benefit: null,
                    tube_size: null,
                    tire_type: p.tire_type || null,
                    product_id: p.id,
                    product_slug: p.slug,
                    product_name: p.name,
                    image_url: p.image_url || undefined,
                  }));
                  const grouped = groupByBrand(items);
                  return Object.entries(grouped).map(([brand, brandItems]) => (
                    <BrandSection key={brand} brand={brand} items={brandItems} />
                  ));
                })()}

                {/* Actions */}
                <div className="flex gap-2 items-center bg-white p-4 rounded-xl border border-gray-200">
                  <button onClick={resetAll} className="ml-auto text-sm text-red-500 hover:underline flex items-center gap-1">
                    <RotateCcw size={14} /> Quét lại
                  </button>
                </div>
              </div>
            )}

            {/* Done without recommend (fallback when no vehicles found) */}
            {result && step === 'done' && !result.recommend && result.vehicles?.length === 0 && result.case_type !== 'size_pattern' && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-5 text-center">
                  <p className="text-amber-800 font-medium">
                    Đã detect size <strong>{result.merged.size}</strong> nhưng không tìm thấy xe nào phù hợp.
                  </p>
                  <button onClick={resetAll} className="mt-3 text-sm text-red-600 hover:underline">
                    Quét lại
                  </button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </div>
  );
}

// Floating Cart Button Component
function FloatingCartButton() {
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link
      href="/cart"
      className="fixed bottom-6 left-6 z-50 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl shadow-red-600/30 transition-all duration-300 hover:scale-110 group"
    >
      <div className="relative">
        <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-red-600 animate-pulse">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </div>
    </Link>
  );
}