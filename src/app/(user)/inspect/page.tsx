'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Camera, Upload, Shield, AlertTriangle, CheckCircle2, 
  ArrowRight, Brain, Zap, BarChart3, Sparkles
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface InspectionResult {
  wear_level: string;
  wear_percentage: number;
  tire_type_detected: string;
  crack_detected: boolean;
  crack_severity: string;
  crack_locations: Array<{x: number, y: number, confidence: number}>;
  confidence: number;
  recommendation: string;
  image_url: string;
  suggested_products?: Array<{id: string; name: string; price: number; sale_price?: number; slug: string}>;
}

export default function TechnologyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      setResult(null);
    }
  };

  const handleInspect = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.post('/api/v1/inspect', formData);
      setResult(data.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getWearColor = (level: string) => {
    const map: Record<string, string> = {
      new: 'text-green-600 bg-green-50 border-green-200',
      good: 'text-blue-600 bg-blue-50 border-blue-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      critical: 'text-red-600 bg-red-50 border-red-200',
    };
    return map[level] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
              <Sparkles size={16} />
              Công nghệ AI tiên tiến
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Kiểm tra lốp xe
              <span className="block text-red-200">bằng trí tuệ nhân tạo</span>
            </h1>
            <p className="text-lg text-red-100 max-w-xl mx-auto">
              Chỉ cần chụp ảnh lốp xe, AI sẽ phân tích độ mòn, phát hiện vết nứt 
              và đưa ra khuyến nghị chính xác trong vài giây.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 -mt-8 relative z-10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: 'AI Thông Minh', desc: 'Phân tích hơn 1000 mẫu lốp với độ chính xác 95%' },
            { icon: Zap, title: 'Kết quả tức thì', desc: 'Nhận kết quả kiểm tra chỉ sau 5-10 giây' },
            { icon: BarChart3, title: 'Báo cáo chi tiết', desc: 'Đánh giá độ mòn, vết nứt và khuyến nghị thay thế' },
          ].map((feature, i) => (
            <Card key={i} className="border-0 shadow-lg shadow-gray-200/50 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <feature.icon size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Main Inspection Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Upload Area */}
          <Card className="border-2 border-dashed border-gray-200 hover:border-red-300 transition-colors bg-white">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera size={32} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Tải ảnh lốp xe</h2>
                <p className="text-gray-500 text-sm mt-2">Chụp ảnh mặt lốp để AI phân tích</p>
              </div>

              {!preview ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:border-red-400 hover:bg-red-50/30 transition-all">
                    <Upload size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="font-semibold text-gray-600">Nhấn để chọn ảnh</p>
                    <p className="text-sm text-gray-400 mt-1">JPG, PNG tối đa 10MB</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-gray-100 rounded-3xl overflow-hidden">
                    <Image src={preview} alt="Preview" fill className="object-contain" />
                    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                      variant="outline"
                      className="flex-1"
                    >
                      Chọn ảnh khác
                    </Button>
                    <Button
                      onClick={handleInspect}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {loading ? (
                        <>Đang phân tích...</>
                      ) : (
                        <><Brain size={18} /> Phân tích bằng AI</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Area */}
          <div>
            {!result && !loading && (
              <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-100">
                <CardContent className="p-8 text-center">
                  <Shield size={64} className="mx-auto text-gray-200 mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Chờ kết quả...</h3>
                  <p className="text-gray-400 text-sm">
                    Tải ảnh lên và nhấn "Phân tích bằng AI" để kiểm tra lốp xe của bạn
                  </p>
                </CardContent>
              </Card>
            )}

            {loading && (
              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 animate-pulse">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-blue-900">AI đang phân tích...</h3>
                  <p className="text-sm text-blue-600 mt-2">Xử lý ảnh và nhận diện mẫu lốp</p>
                </CardContent>
              </Card>
            )}

            {result && (
              <div className="space-y-4">
                <Card className="bg-white border-green-100">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getWearColor(result.wear_level)}`}>
                        {result.wear_level === 'new' ? 'MỚI' : result.wear_level === 'good' ? 'TỐT' : result.wear_level === 'warning' ? 'CẢNH BÁO' : 'NGUY KỊCH'}
                      </div>
                      <span className="text-sm text-gray-400">Độ chính xác: {(result.confidence * 100).toFixed(0)}%</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500">Độ mòn</span>
                        <span className="font-bold text-gray-900">{result.wear_percentage}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500">Loại lốp</span>
                        <span className="font-bold text-gray-900">{result.tire_type_detected}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500">Phát hiện nứt</span>
                        {result.crack_detected ? (
                          <span className="font-bold text-red-600 flex items-center gap-1">
                            <AlertTriangle size={16} /> Có
                          </span>
                        ) : (
                          <span className="font-bold text-green-600 flex items-center gap-1">
                            <CheckCircle2 size={16} /> Không
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl">
                      <p className="text-sm font-medium text-gray-800">{result.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Suggested Products */}
                {result.suggested_products && result.suggested_products.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-bold text-gray-900 mb-3">🛞 Sản phẩm gợi ý</h4>
                      <div className="space-y-2">
                        {result.suggested_products.map((p: any) => (
                          <Link key={p.id} href={`/products/${p.slug}`}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors group"
                          >
                            <span className="font-medium text-sm text-gray-700 group-hover:text-red-600">{p.name}</span>
                            <span className="font-bold text-red-600 text-sm flex items-center gap-1">
                              {(p.sale_price || p.price).toLocaleString()}đ
                              <ArrowRight size={14} />
                            </span>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}