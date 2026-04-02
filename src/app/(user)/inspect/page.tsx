'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface InspectionResult {
  wear_level: string;
  wear_percentage: number;
  tire_type_detected: string;
  crack_detected: boolean;
  recommendation: string;
}

export default function InspectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInspect = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.post('/inspect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch (error) {
      console.error('Inspect error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Kiểm tra lốp xe bằng AI</h1>
        <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
          <Input
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
          />
          <Button onClick={handleInspect} disabled={!file || loading} className="w-full">
            {loading ? 'Đang phân tích...' : 'Kiểm tra lốp'}
          </Button>
          {result && (
            <div className="p-6 bg-green-50 rounded-xl space-y-4">
              <h3 className="font-bold text-xl">Kết quả AI:</h3>
              <p>Độ mòn: {result.wear_level} ({result.wear_percentage}%)</p>
              <p>Loại lốp: {result.tire_type_detected}</p>
              {result.crack_detected && <p className="text-red-600 font-bold">Phát hiện vết nứt!</p>}
              <p>Gợi ý: {result.recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}