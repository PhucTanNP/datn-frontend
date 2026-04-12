'use client';

export default function AnalyticsPage() {
  return (
    <div className="animate-in fade-in space-y-10">
      <h2 className="text-4xl font-black uppercase mb-10 italic tracking-tighter">Phân tích <span className="text-red-600">Thị trường</span></h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-12 rounded-[50px] shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-black uppercase text-xl italic tracking-tighter">Sản lượng lốp tiêu thụ</h3>
            <div className="flex gap-2">
              {['Tuần', 'Tháng', 'Năm'].map(p => <button key={p} className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${p === 'Tháng' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400 hover:text-gray-900'}`}>{p}</button>)}
            </div>
          </div>
          <div className="h-80 flex items-end justify-between gap-3 px-2 border-b-2 border-gray-100 pb-2">
             {[60, 40, 85, 30, 95, 55, 75, 45, 80, 50, 90, 100].map((h, i) => (
               <div key={i} className="flex-1 bg-gradient-to-t from-red-600 to-red-400 rounded-2xl relative group transition-all hover:scale-105 shadow-xl shadow-red-100" style={{ height: `${h}%` }}>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-black">T.{i+1}</div>
               </div>
             ))}
          </div>
        </div>
        <div className="bg-white p-12 rounded-[50px] shadow-xl border border-gray-100">
          <h3 className="font-black uppercase text-xl italic tracking-tighter mb-10 text-center">Cơ cấu dòng lốp</h3>
          <div className="relative w-full aspect-square flex items-center justify-center mb-10">
             <div className="w-full h-full rounded-full border-[30px] border-red-600 relative">
                <div className="absolute inset-[-30px] border-[30px] border-gray-900 rounded-full" style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 50%)' }}></div>
                <div className="absolute inset-[-30px] border-[30px] border-blue-500 rounded-full" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' }}></div>
             </div>
             <div className="absolute text-center">
               <p className="text-4xl font-black tracking-tighter">100%</p>
               <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">DRC Core</p>
             </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest"><span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-600 rounded-full"></span> Lốp Ô tô</span><span>45%</span></div>
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest"><span className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-900 rounded-full"></span> Xe Máy</span><span>30%</span></div>
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest"><span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> Đặc chủng</span><span>25%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}