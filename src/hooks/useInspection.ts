import { useState } from 'react';
import api from '@/lib/api';

export function useInspection() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const inspectTire = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      // Gọi BE /api/v1/inspect -> BE gọi AI Service (GraphRag) detect -> BE lưu Supabase -> trả về FE
      const response = await api.post('/api/v1/inspect', formData);
      const resultData = response.data?.data ?? response.data;
      setResult(resultData);
      return resultData;
    } finally {
      setLoading(false);
    }
  };

  return { inspectTire, loading, result };
}