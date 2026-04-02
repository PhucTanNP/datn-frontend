import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface CartSummaryProps {
  onCheckout?: () => void;
}

export function CartSummary({ onCheckout }: CartSummaryProps) {
  const { getTotal } = useCartStore();
  const total = getTotal();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
      <h3 className="text-xl font-bold">Tóm tắt đơn hàng</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-lg">
          <span>Tạm tính:</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span>Phí ship:</span>
          <span>30.000đ</span>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between text-2xl font-bold">
            <span>Tổng:</span>
            <span>{formatCurrency(total + 30000)}</span>
          </div>
        </div>
      </div>
      <Button onClick={onCheckout} className="w-full bg-green-600 hover:bg-green-700 text-lg h-12">
        Thanh toán MoMo
      </Button>
    </div>
  );
}