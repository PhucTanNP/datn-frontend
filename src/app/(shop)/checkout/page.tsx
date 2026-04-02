'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { CartSummary } from '@/components/checkout/CartSummary';
import { MoMoButton } from '@/components/checkout/MoMoButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [step, setStep] = useState<'info' | 'payment'>('info');

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const total = items.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);

  const handlePaymentSuccess = () => {
    clearCart();
    // Redirect to success page
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/cart" className="text-blue-600 hover:underline mb-8 inline-block">
            ← Quay lại giỏ hàng
          </Link>
          <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

          {step === 'info' && (
            <form onSubmit={handleSubmitInfo} className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <Input
                  placeholder="Họ tên đầy đủ"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                <Input
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Địa chỉ giao hàng"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <h3 className="font-bold mb-4">Đơn hàng của bạn</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex justify-between p-3 border-b">
                      <span>{item.product?.name} x{item.quantity}</span>
                      <span>{((item.product?.price || 0) * item.quantity).toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="md:col-span-2">Tiếp tục thanh toán</Button>
            </form>
          )}

          {step === 'payment' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-xl">Xác nhận thông tin</h3>
                <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 rounded-xl">
                  <div><strong>Họ tên:</strong> {formData.fullName}</div>
                  <div><strong>Phone:</strong> {formData.phone}</div>
                  <div className="col-span-2"><strong>Địa chỉ:</strong> {formData.address}</div>
                  {formData.notes && <div className="col-span-2"><strong>Ghi chú:</strong> {formData.notes}</div>}
                </div>
                <MoMoButton amount={total + 30000} orderInfo="Đơn hàng DRC Tires" />
              </div>
              <CartSummary />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}