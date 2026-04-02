'use client';

import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';
import { useState } from 'react';

export function MoMoButton({ amount, orderInfo }: { amount: number; orderInfo: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/momo', { amount, orderInfo });
      window.location.href = data.payUrl;
    } catch (error) {
      console.error('Payment error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePay} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600">
      {loading ? 'Đang tạo...' : 'Thanh toán MoMo'}
    </Button>
  );
}