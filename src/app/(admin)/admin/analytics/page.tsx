'use client';

export default function AnalyticsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Phân tích & Báo cáo</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3>Biểu đồ doanh thu</h3>
          <div className="h-64 bg-gray-100 rounded-lg mt-4 flex items-center justify-center">
            Recharts LineChart (tháng/năm)
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3>Top sản phẩm bán chạy</h3>
          <div className="h-64 bg-gray-100 rounded-lg mt-4 flex items-center justify-center">
            Recharts BarChart
          </div>
        </div>
      </div>
    </div>
  );
}