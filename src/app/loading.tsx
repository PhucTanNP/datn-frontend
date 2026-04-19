export const Loading = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="relative flex items-center justify-center">
        {/* Vòng tròn bên ngoài cùng - Xoay chậm */}
        <div className="absolute animate-[spin_3s_linear_infinite] rounded-full h-32 w-32 border-t-4 border-b-4 border-red-600/20"></div>

        {/* Vòng tròn giữa - Xoay ngược lại */}
        <div className="absolute animate-[spin_2s_linear_infinite_reverse] rounded-full h-24 w-24 border-r-4 border-l-4 border-red-600/40"></div>

        {/* Vòng tròn trong cùng - Xoay nhanh */}
        <div className="absolute animate-spin rounded-full h-16 w-16 border-t-4 border-red-600"></div>

        {/* Điểm nhấn ở giữa với hiệu ứng xung lực (Pulse) */}
        <div className="relative flex items-center justify-center h-8 w-8 bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)]">
          <div className="absolute animate-ping inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
        </div>
      </div>

      {/* Phần văn bản loading */}
      <div className="mt-12 flex flex-col items-center">
        <h2 className="text-xl font-bold text-gray-800 tracking-widest uppercase">
          DRC <span className="text-red-600">Loading</span>
        </h2>
        <div className="flex space-x-1 mt-2">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-gray-400 italic">Vui lòng đợi trong giây lát...</p>
      </div>
    </div>
  );
};

export default Loading;