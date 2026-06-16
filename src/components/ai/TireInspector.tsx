'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface OcrDetail {
  raw_text: string;
  normalized_text: string;
  ocr_confidence: number;
  yolo_confidence: number;
}

interface DetectData {
  brand: string | null;
  size: string | null;
  pattern: string | null;
  brand_ocr: OcrDetail | null;
  size_ocr: OcrDetail | null;
  pattern_ocr: OcrDetail | null;
  detections_count: number;
}

interface DetectResponse {
  success: boolean;
  data: DetectData | null;
  error?: string;
}

export function TireInspector() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DetectData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      if (imgRef.current) imgRef.current.src = url;
      setResult(null);
      setError(null);
    }
  };

  const handleInspect = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await api.post('/api/v1/inspect', formData);
      const body = response.data as DetectResponse;
      if (body.success && body.data) {
        setResult(body.data);
      } else {
        setError(body.error || 'Detection failed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const ConfidenceBadge = ({ label, value }: { label: string; value?: number }) => {
    if (value === undefined || value === null) return null;
    const pct = Math.round(value * 100);
    const color = pct >= 80 ? 'bg-green-100 text-green-800' : pct >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {label}: {pct}%
      </span>
    );
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8 space-y-6">
        <h3 className="text-2xl font-bold text-center">AI Tire Inspector</h3>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative">
            <img ref={imgRef} className="max-w-md rounded-xl shadow-lg" alt="Tire preview" />
          </div>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <Button onClick={handleInspect} disabled={!file || loading} className="w-full">
              {loading ? 'Đang phân tích...' : 'Phân tích lốp'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
            <h4 className="font-bold text-xl">Kết quả nhận dạng:</h4>

            <div className="grid grid-cols-1 gap-4">
              {/* Brand */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                <div className="text-sm text-gray-500 mb-1">Thương hiệu (Brand)</div>
                <div className="text-2xl font-bold text-gray-900">
                  {result.brand || <span className="text-gray-400">—</span>}
                </div>
                {result.brand_ocr && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <ConfidenceBadge label="OCR" value={result.brand_ocr.ocr_confidence} />
                    <ConfidenceBadge label="YOLO" value={result.brand_ocr.yolo_confidence} />
                    {result.brand_ocr.raw_text && result.brand_ocr.raw_text !== result.brand && (
                      <span className="text-xs text-gray-400">(raw: {result.brand_ocr.raw_text})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Size */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                <div className="text-sm text-gray-500 mb-1">Kích cỡ (Size)</div>
                <div className="text-2xl font-bold text-gray-900">
                  {result.size || <span className="text-gray-400">—</span>}
                </div>
                {result.size_ocr && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <ConfidenceBadge label="OCR" value={result.size_ocr.ocr_confidence} />
                    <ConfidenceBadge label="YOLO" value={result.size_ocr.yolo_confidence} />
                  </div>
                )}
              </div>

              {/* Pattern */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                <div className="text-sm text-gray-500 mb-1">Mã gai (Pattern)</div>
                <div className="text-2xl font-bold text-gray-900">
                  {result.pattern || <span className="text-gray-400">—</span>}
                </div>
                {result.pattern_ocr && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <ConfidenceBadge label="OCR" value={result.pattern_ocr.ocr_confidence} />
                    <ConfidenceBadge label="YOLO" value={result.pattern_ocr.yolo_confidence} />
                  </div>
                )}
              </div>
            </div>

            {result.detections_count > 0 && (
              <p className="text-sm text-gray-500 text-center">
                Phát hiện {result.detections_count} vùng thông tin trên lốp
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}