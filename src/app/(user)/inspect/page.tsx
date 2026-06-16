'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Camera, Upload, Shield, CheckCircle2,
  ArrowRight, Brain, Zap, BarChart3, Sparkles
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface StepDetail {
  step: number;
  name: string;
  status: string; // "ok" | "error"
  detail: string;
  image?: string; // base64 data URI
  crops?: Array<{class: string; image: string}>;
  detect_input_image?: string;
}

interface OcrDetail {
  raw_text: string;
  normalized_text: string;
  ocr_confidence: number;
  yolo_confidence: number;
  crop_image?: string;
  ocr_input_image?: string;
}

interface InspectionResult {
  brand: string | null;
  size: string | null;
  pattern: string | null;
  brand_raw: string | null;
  size_raw: string | null;
  pattern_raw: string | null;
  brand_ocr?: OcrDetail;
  size_ocr?: OcrDetail;
  pattern_ocr?: OcrDetail;
  ocr_confidence: number;
  yolo_confidence: number;
  detections_count: number;
  image_url: string;
  saved: boolean;
  steps?: StepDetail[];
  ai_raw_result?: { steps?: StepDetail[] };
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
              Chỉ cần chụp ảnh lốp xe, AI sẽ nhận diện thương hiệu, kích cỡ 
              và mã gai trong vài giây.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 -mt-8 relative z-10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: 'AI Thông Minh', desc: 'Nhận diện thương hiệu lốp DRC, DPLUS và các thông số' },
            { icon: Zap, title: 'Kết quả tức thì', desc: 'Nhận kết quả kiểm tra chỉ sau 15-30 giây' },
            { icon: BarChart3, title: 'Báo cáo chi tiết', desc: 'Thương hiệu, kích cỡ và mã gai kèm độ tin cậy' },
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
                    Tải ảnh lên và nhấn Phân tích bằng AI để kiểm tra lốp xe của bạn
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
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 size={20} className="text-green-600" />
                      <span className="text-lg font-bold text-gray-900">Kết quả nhận dạng</span>
                      {result.detections_count > 0 && (
                        <span className="text-xs text-gray-400 ml-auto">
                          {result.detections_count} vùng phát hiện
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Brand */}
                      <div className="flex justify-between items-center py-3 border-b border-gray-50">
                        <span className="text-gray-500">Thương hiệu (Brand)</span>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 text-lg">
                            {result.brand || <span className="text-gray-400">—</span>}
                          </div>
                          {result.brand_raw && result.brand_raw !== result.brand && (
                            <div className="text-xs text-gray-400">raw: {result.brand_raw}</div>
                          )}
                          {result.brand_ocr?.crop_image && (
                            <div className="mt-1 flex justify-end gap-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={result.brand_ocr.crop_image} alt="brand crop" className="h-10 rounded border" title="Crop gốc" />
                              {result.brand_ocr?.ocr_input_image && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={result.brand_ocr.ocr_input_image} alt="brand ocr input" className="h-10 rounded border" title="Đầu vào OCR (48×320)" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Size */}
                      <div className="flex justify-between items-center py-3 border-b border-gray-50">
                        <span className="text-gray-500">Kích cỡ (Size)</span>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 text-lg">
                            {result.size || <span className="text-gray-400">—</span>}
                          </div>
                          {result.size_raw && result.size_raw !== result.size && (
                            <div className="text-xs text-gray-400">raw: {result.size_raw}</div>
                          )}
                          {result.size_ocr?.crop_image && (
                            <div className="mt-1 flex justify-end gap-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={result.size_ocr.crop_image} alt="size crop" className="h-10 rounded border" title="Crop gốc" />
                              {result.size_ocr?.ocr_input_image && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={result.size_ocr.ocr_input_image} alt="size ocr input" className="h-10 rounded border" title="Đầu vào OCR (48×320)" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Pattern */}
                      <div className="flex justify-between items-center py-3 border-b border-gray-50">
                        <span className="text-gray-500">Mã gai (Pattern)</span>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 text-lg">
                            {result.pattern || <span className="text-gray-400">—</span>}
                          </div>
                          {result.pattern_raw && result.pattern_raw !== result.pattern && (
                            <div className="text-xs text-gray-400">raw: {result.pattern_raw}</div>
                          )}
                          {result.pattern_ocr?.crop_image && (
                            <div className="mt-1 flex justify-end gap-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={result.pattern_ocr.crop_image} alt="pattern crop" className="h-10 rounded border" title="Crop gốc" />
                              {result.pattern_ocr?.ocr_input_image && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={result.pattern_ocr.ocr_input_image} alt="pattern ocr input" className="h-10 rounded border" title="Đầu vào OCR (48×320)" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {result.ocr_confidence > 0 && (
                      <div className="mt-4 flex items-center gap-2 text-sm flex-wrap">
                        <span className="text-gray-400">Độ tin cậy:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                          result.ocr_confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                          result.ocr_confidence >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          OCR: {Math.round(result.ocr_confidence * 100)}%
                        </span>
                        {result.yolo_confidence > 0 && (
                          <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                            result.yolo_confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                            result.yolo_confidence >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            YOLO: {Math.round(result.yolo_confidence * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Steps Timeline with images */}
                {(result.steps || result.ai_raw_result?.steps) && (
                  <Card className="bg-white border-gray-100">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider text-gray-500">
                        📋 Các bước xử lý
                      </h4>
                      <div className="space-y-6">
                        {(result.steps || result.ai_raw_result?.steps || []).map((s, i) => (
                          <div key={i} className="flex gap-4">
                            {/* Timeline dot + line */}
                            <div className="flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                                s.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                              }`}>
                                {s.status === 'ok' ? '✓' : '✗'}
                              </div>
                              {i < (result.steps || result.ai_raw_result?.steps || []).length - 1 && (
                                <div className="w-0.5 flex-1 bg-gray-200 mt-1 min-h-[8px]" />
                              )}
                            </div>
                            {/* Content */}
                            <div className="flex-1 pb-4 min-w-0">
                              <div className="font-semibold text-sm text-gray-900 mb-1">
                                Bước {s.step}: {s.name}
                              </div>
                              {s.detail && (
                                <div className="text-xs text-gray-500 mb-2 font-mono">
                                  {s.detail}
                                </div>
                              )}
                              {s.image && (
                                <div className="relative w-full max-w-md rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mb-2">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={s.image}
                                    alt={`Step ${s.step}`}
                                    className="w-full h-auto object-contain max-h-48"
                                  />
                                </div>
                              )}
                              {/* Crops for step 4 */}
                              {s.crops && s.crops.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {s.crops.map((c, ci) => (
                                    <div key={ci} className="text-center">
                                      <div className="text-xs font-medium text-gray-500 mb-1 uppercase">{c.class}</div>
                                      <div className="rounded-lg overflow-hidden border border-gray-200 inline-block">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={c.image} alt={c.class} className="h-16 w-auto" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {s.detect_input_image && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-gray-500 mb-1">Ảnh đầu vào YOLO detect (resized 1280px)</div>
                                  <div className="rounded-lg overflow-hidden border border-gray-200 inline-block">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={s.detect_input_image} alt="yolo detect input" className="h-20 w-auto" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

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