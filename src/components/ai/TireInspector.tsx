'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface InspectionResult {
  wear_level: string;
  wear_percentage: number;
  tire_type_detected: string;
  crack_detected: boolean;
  crack_locations: Array<{x: number, y: number, confidence: number}>;
  recommendation: string;
  image_url: string;
}

export function TireInspector() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      if (imgRef.current) imgRef.current.src = url;
      setResult(null);
    }
  };

  const handleInspect = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.post('/inspect', formData);
      setResult(data);
      drawCracks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const drawCracks = (result: InspectionResult) => {
    if (!canvasRef.current || !imgRef.current || !result.crack_locations.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imgRef.current.naturalWidth;
    canvas.height = imgRef.current.naturalHeight;

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    result.crack_locations.forEach(({x, y}) => {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.stroke();
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8 space-y-6">
        <h3 className="text-2xl font-bold text-center">AI Tire Inspector</h3>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative">
            <img ref={imgRef} className="max-w-md rounded-xl shadow-lg" />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <Button onClick={handleInspect} disabled={!file || loading} className="w-full">
              Phân tích lốp
            </Button>
          </div>
        </div>
        {result && (
          <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
            <h4 className="font-bold text-xl">Kết quả:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Độ mòn:</strong> {result.wear_level} ({result.wear_percentage}%)</div>
              <div><strong>Loại lốp:</strong> {result.tire_type_detected}</div>
              <div><strong>Vết nứt:</strong> {result.crack_detected ? 'Có' : 'Không'}</div>
              <div><strong>Gợi ý:</strong> {result.recommendation}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}