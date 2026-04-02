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
      const { data } = await api.post('/inspect', formData);
      setResult(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  return { inspectTire, loading, result };
}