'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Tổng doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">500.000.000đ</p>
          <p className="text-sm text-green-600">+12% tháng này</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">1,234</p>
          <p className="text-sm">+5% so tuần trước</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">89</p>
          <p className="text-sm">Tồn kho</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">567</p>
          <p className="text-sm">Đăng ký mới</p>
        </CardContent>
      </Card>
    </div>
  );
}