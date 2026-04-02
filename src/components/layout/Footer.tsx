import { MapPin, Phone, Share , Play , Globe, Mail, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
      <footer className="bg-gray-900 text-white pt-16 pb-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand & Intro */}
        <div className="space-y-6">
          <div className="flex flex-col">
            <span className="text-4xl font-black text-red-600 leading-none">DRC</span>
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Da Nang Rubber</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed italic">
            Thương hiệu quốc gia với bề dày gần 50 năm kinh nghiệm, đồng hành cùng mọi công trình và những chuyến đi an toàn của người Việt.
          </p>
          <div className="flex gap-4">
            <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-600 transition-all">
              <Share size={18} />
            </button>
            <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-600 transition-all">
              <Play size={18} />
            </button>
            <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-600 transition-all">
              <Globe size={18} />
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-black uppercase mb-6 border-l-4 border-red-600 pl-4">Khám phá</h4>
          <ul className="space-y-4 text-gray-400 text-sm font-medium">
            <li><button className="hover:text-red-500 transition-colors">Trang chủ</button></li>
            <li><button className="hover:text-red-500 transition-colors">Sản phẩm tiêu biểu</button></li>
            <li><button className="hover:text-red-500 transition-colors">Hệ thống phân phối</button></li>
            <li><button className="hover:text-red-500 transition-colors">Chính sách bảo hành</button></li>
            <li><button className="hover:text-red-500 transition-colors">Tuyển dụng</button></li>
          </ul>
        </div>

        {/* Product Categories */}
        <div>
          <h4 className="text-lg font-black uppercase mb-6 border-l-4 border-red-600 pl-4">Dòng sản phẩm</h4>
          <ul className="space-y-4 text-gray-400 text-sm font-medium">
            {/* {CATEGORIES.map(cat => (
              <li key={cat}><button className="hover:text-red-500 transition-colors">{cat}</button></li>
            ))} */}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-black uppercase mb-6 border-l-4 border-red-600 pl-4">Liên hệ</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={20} className="text-red-600 shrink-0" />
              <span>Lô G, Đường số 9, KCN Liên Chiểu, P. Hòa Hiệp Bắc, Q. Liên Chiểu, TP. Đà Nẵng</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={20} className="text-red-600 shrink-0" />
              <span className="font-bold text-white">1900 1234 - (0236) 3771 105</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={20} className="text-red-600 shrink-0" />
              <span>info@drc.com.vn</span>
            </li>
            <li className="mt-6">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <ShieldCheck className="text-green-500" size={32} />
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-500">Chứng nhận</p>
                  <p className="text-xs font-bold text-white uppercase">ISO 9001:2015</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">
        <p>© 2026 CÔNG TY CỔ PHẦN CAO SU ĐÀ NẴNG. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-6">
          <button className="hover:text-white">Điều khoản</button>
          <button className="hover:text-white">Bảo mật</button>
          <button className="hover:text-white">Sơ đồ web</button>
        </div>
      </div>
    </div>
  </footer>
  );
}