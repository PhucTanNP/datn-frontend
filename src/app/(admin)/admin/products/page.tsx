'use client';

export default function ProductsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Quản lý sản phẩm</h2>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p>CRUD sản phẩm (danh sách, thêm, sửa, xóa, upload ảnh Cloudinary)</p>
        {/* DataTable placeholder */}
        <div className="mt-6 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          DataTable sản phẩm (Prisma + API)
        </div>
      </div>
    </div>
  );
}