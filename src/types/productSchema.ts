import type { Product } from './product';

// ── Kiểu dữ liệu cho form thông số kỹ thuật ──
// Mapping từ Excel/Neo4j sang form
export interface SpecsFormData {
  // Nhóm — phân loại
  nhom_lop: string;           // Motorcycle, Normal, Electric...
  dong_series: string;        // Dòng series (e.g. D602, X01...)
  cau_truc_lop: string;       // EV, SV, Radial, Bias

  // Kích thước — hình học
  duong_kinh_vanh: string;    // inch — Đường kính vành
  rong_vanh_tieu_chuan: string; // inch — Rộng vành tiêu chuẩn
  rong_vanh_thich_hop: string;  // inch — Rộng vành thích hợp (range)
  duong_kinh_ngoai: string;   // mm — Đường kính ngoài
  chieu_rong_toan_bo: string; // mm — Chiều rộng toàn bộ
  chieu_sau_hoa: string;      // mm — Chiều sâu hoa lốp

  // Tải trọng — áp suất
  phan_loai_tai: string;      // Phân loại tải
  chi_so_tai_toc_do: string;  // Chỉ số tải & tốc độ (e.g. 52P)
  tai_trong_lon_nhat: string; // kg — Tải trọng lớn nhất
  noi_ap_tieu_chuan: string;  // kPa — Nội áp tiêu chuẩn
  toc_do_toi_da: string;      // km/h — Tốc độ tối đa
  so_lop_bo: string;          // 4PR, 6PR — Số lớp bố

  // Săm / van
  van: string;                // Loại van
  trong_luong: string;        // g — Trọng lượng (săm)
}

export const initialSpecs: SpecsFormData = {
  nhom_lop: 'Motorcycle', dong_series: '', cau_truc_lop: 'Millimetric',
  duong_kinh_vanh: '', rong_vanh_tieu_chuan: '', rong_vanh_thich_hop: '',
  duong_kinh_ngoai: '', chieu_rong_toan_bo: '', chieu_sau_hoa: '',
  phan_loai_tai: 'SV', chi_so_tai_toc_do: '', tai_trong_lon_nhat: '',
  noi_ap_tieu_chuan: '', toc_do_toi_da: '', so_lop_bo: '4PR',
  van: '', trong_luong: '',
};

// ── Tự động sinh mô tả từ thông số ──
export function generateAutoDescription(p: Product, specs: SpecsFormData): string {
  const label = p.productType === 'motorcycle_tire' ? 'Lốp xe máy'
    : p.productType === 'bicycle_tire' ? 'Lốp xe đạp'
    : p.productType === 'motorcycle_tube' ? 'Săm xe máy'
    : 'Săm xe đạp';

  const title = `${label} ${p.brand} ${p.size}`;
  const items: string[] = [];

  if (specs.nhom_lop) items.push(`Nhóm: ${specs.nhom_lop}`);
  if (specs.dong_series) items.push(`Series: ${specs.dong_series}`);
  if (specs.cau_truc_lop) items.push(`Cấu trúc: ${specs.cau_truc_lop}`);
  if (specs.duong_kinh_vanh) items.push(`Đường kính vành: ${specs.duong_kinh_vanh}"`);
  if (specs.rong_vanh_tieu_chuan) items.push(`Rộng vành TC: ${specs.rong_vanh_tieu_chuan}"`);
  if (specs.rong_vanh_thich_hop) items.push(`Rộng vành TH: ${specs.rong_vanh_thich_hop}"`);
  if (specs.duong_kinh_ngoai) items.push(`Đường kính ngoài: ${specs.duong_kinh_ngoai} mm`);
  if (specs.chieu_rong_toan_bo) items.push(`Chiều rộng toàn bộ: ${specs.chieu_rong_toan_bo} mm`);
  if (specs.chieu_sau_hoa) items.push(`Chiều sâu hoa: ${specs.chieu_sau_hoa} mm`);
  if (specs.phan_loai_tai) items.push(`Phân loại tải: ${specs.phan_loai_tai}`);
  if (specs.chi_so_tai_toc_do) items.push(`Tải tốc độ: ${specs.chi_so_tai_toc_do}`);
  if (specs.tai_trong_lon_nhat) items.push(`Tải trọng tối đa: ${specs.tai_trong_lon_nhat} kg`);
  if (specs.noi_ap_tieu_chuan) items.push(`Nội áp: ${specs.noi_ap_tieu_chuan} kPa`);
  if (specs.toc_do_toi_da) items.push(`Tốc độ tối đa: ${specs.toc_do_toi_da} km/h`);
  if (specs.so_lop_bo) items.push(`Số lớp: ${specs.so_lop_bo}`);
  if (specs.van) items.push(`Van: ${specs.van}`);
  if (specs.trong_luong) items.push(`Trọng lượng: ${specs.trong_luong} g`);

  if (items.length === 0) return title;
  return title + '\n' + items.join(' | ');
}

// ── Map từ specs JSONB (từ DB) → FormData ──
export function specsToFormData(specs: Record<string, unknown>): SpecsFormData {
  const s = specs as Record<string, string>;
  return {
    nhom_lop: s['nhom_lop'] || '',
    dong_series: s['dong_series'] || '',
    cau_truc_lop: s['cau_truc_lop'] || '',
    duong_kinh_vanh: s['duong_kinh_vanh'] || '',
    rong_vanh_tieu_chuan: s['rong_vanh_tieu_chuan'] || '',
    rong_vanh_thich_hop: s['rong_vanh_thich_hop'] || '',
    duong_kinh_ngoai: s['duong_kinh_ngoai'] || '',
    chieu_rong_toan_bo: s['chieu_rong_toan_bo'] || '',
    chieu_sau_hoa: s['chieu_sau_hoa'] || '',
    phan_loai_tai: s['phan_loai_tai'] || '',
    chi_so_tai_toc_do: s['chi_so_tai_toc_do'] || '',
    tai_trong_lon_nhat: s['tai_trong_lon_nhat'] || '',
    noi_ap_tieu_chuan: s['noi_ap_tieu_chuan'] || '',
    toc_do_toi_da: s['toc_do_toi_da'] || '',
    so_lop_bo: s['so_lop_bo'] || '',
    van: s['van'] || s['valve_type'] || '',
    trong_luong: s['trong_luong'] || s['weight'] || '',
  };
}
