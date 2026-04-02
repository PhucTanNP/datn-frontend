'use client';

export default function UsersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Quản lý người dùng</h2>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p>CRUD users, role management</p>
        <div className="mt-6 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          DataTable users
        </div>
      </div>
    </div>
  );
}