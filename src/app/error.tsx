'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h2 className="text-6xl font-bold text-red-600 mb-4">Ối!</h2>
      <p className="text-xl text-gray-600 mb-8 max-w-md text-center">
        Có lỗi xảy ra. Thử lại nhé.
      </p>
      <div className="space-x-4">
        <button onClick={reset} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
          Thử lại
        </button>
        <Link href="/" className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}