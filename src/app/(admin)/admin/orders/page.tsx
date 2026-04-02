'use client';

export default function OrdersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h2>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p>Cập nhật trạng thái, xem chi tiết, hoàn tiền</p>
        {/* DataTable */}
        <div className="mt-6 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          DataTable đơn hàng
        </div>
      </div>
    </div>
  );
}