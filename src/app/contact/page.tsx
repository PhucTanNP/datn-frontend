'use client';


import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Share2, 
  Video, 
  MessageCircle, 
  ShoppingBag,
  Globe,
  Bell,
  ExternalLink
} from 'lucide-react';

const ContactPage = () => {
  const contactInfo = [
    {
      icon: <MapPin className="text-red-600" size={24} />,
      title: "Địa chỉ",
      content: "Lô G, Đường số 6, KCN Hòa Khánh, Liên Chiểu, Đà Nẵng",
      link: "https://maps.google.com"
    },
    {
      icon: <Phone className="text-red-600" size={24} />,
      title: "Hotline",
      content: "1900 1234",
      link: "tel:19001234"
    },
    {
      icon: <Mail className="text-red-600" size={24} />,
      title: "Email",
      content: "info@drc.com.vn",
      link: "mailto:info@drc.com.vn"
    },
    {
      icon: <Clock className="text-red-600" size={24} />,
      title: "Giờ mở cửa",
      content: "Thứ 2 - Thứ 7: 07:30 - 17:00",
      link: null
    }
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      {/* Main Content Area (Tự động lấp đầy chiều cao còn lại) */}
      <main className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col items-center justify-center">
        <div className="max-w-6xl w-full h-full max-h-[700px] flex flex-col lg:flex-row gap-6">
          
          {/* Cột trái: Thông tin dạng Card gọn gàng */}
          <div className="lg:w-5/12 flex flex-col justify-between">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight">Liên hệ</h1>
              <p className="text-gray-500 text-sm italic">Kết nối để nhận hỗ trợ tốt nhất.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
                  <div className="p-3 bg-red-50 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    {info.icon}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-black text-gray-900 text-[10px] uppercase tracking-[0.2em] mb-0.5">{info.title}</h3>
                    {info.link ? (
                      <a href={info.link} className="text-gray-500 text-sm hover:text-red-600 transition-colors font-semibold truncate block">
                        {info.content}
                      </a>
                    ) : (
                      <p className="text-gray-500 text-sm font-semibold truncate">{info.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Connect Gọn gàng */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-4">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mạng xã hội:</span>
               <div className="flex gap-3">
                  <button className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    <Share2 size={18} />
                  </button>
                  <button className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                    <Video size={18} />
                  </button>
               </div>
            </div>
          </div>

          {/* Cột phải: Bản đồ lớn lấp đầy */}
          <div className="lg:w-7/12 h-full bg-white p-2 rounded-[40px] border border-gray-100 shadow-xl relative overflow-hidden">
             <div className="w-full h-full bg-slate-100 rounded-[34px] flex flex-col items-center justify-center text-gray-400 gap-4 border border-dashed border-gray-200 relative group">
                <Globe size={48} className="text-red-100 group-hover:text-red-500 transition-colors duration-500" />
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-900">Bản đồ trụ sở chính DRC</p>
                  <p className="text-[10px] mt-1">KCN Hòa Khánh, Liên Chiểu, Đà Nẵng</p>
                </div>
                <button className="bg-white px-6 py-2.5 rounded-xl text-[10px] font-black shadow-lg border border-gray-50 text-red-600 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
                   Xem Google Maps <ExternalLink size={14} />
                </button>

                {/* Decorative Elements */}
                <div className="absolute top-6 left-6 bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-lg z-10">
                  DRC HEADQUARTERS
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Footer mỏng ở dưới cùng */}
      <footer className="h-10 bg-white border-t border-gray-100 flex items-center justify-center shrink-0">
        <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.4em]">
          DRC Quality Tires &middot; Since 1975
        </p>
      </footer>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 left-6 z-50">
        <button className="w-14 h-14 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-red-500/30">
          <ShoppingBag size={24} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            2
          </span>
        </button>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-blue-500/30">
          <MessageCircle size={24} />
          <span className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </div>
    </div>
  );
};

export default ContactPage;
