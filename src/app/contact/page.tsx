'use client';


import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Share2, 
  Video, 
  ShoppingBag,
  Globe,
  ExternalLink
} from 'lucide-react';

const ContactPage = () => {
  const contactInfo = [
    {
      icon: <MapPin className="text-red-600" size={24} />,
      title: "Địa chỉ",
      content: "409 Trường Chinh, An Khê, Thanh Khê, TP.Đà Nẵng",
      link: "https://www.google.com/maps/dir/?api=1&destination=409+Tr%C6%B0%E1%BB%9Dng+Chinh+An+Kh%C3%AA+%C4%90%C3%A0+N%E1%BA%B5ng"
    },
    {
      icon: <Phone className="text-red-600" size={24} />,
      title: "Hotline",
      content: "0905 033 776",
      link: "tel:0905033776"
    },
    {
      icon: <Mail className="text-red-600" size={24} />,
      title: "Email",
      content: "minhphat.ltd@gmail.com",
      link: "mailto:minhphat.ltd@gmail.com"
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
            <div className="w-full h-full rounded-[34px] overflow-hidden relative group">
              <iframe
                src="https://www.google.com/maps?q=409+Tr%C6%B0%E1%BB%9Dng+Chinh+An+Kh%C3%AA+%C4%90%C3%A0+N%E1%BA%B5ng&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '500px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ DRC"
              />
              {/* Decorative Elements */}
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-lg z-10">
                DRC HEADQUARTERS
              </div>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=409+Tr%C6%B0%E1%BB%9Dng+Chinh+An+Kh%C3%AA+%C4%90%C3%A0+N%E1%BA%B5ng"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg border border-gray-50 text-red-600 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 z-10"
              >
                Chỉ đường <ExternalLink size={14} />
              </a>
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

    </div>
  );
};

export default ContactPage;
