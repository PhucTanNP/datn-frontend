/**
 * Inspection Service — gọi BE API để kiểm tra lốp
 *
 * Luồng: FE -> BE /api/v1/inspect -> BE upload Cloudinary -> BE gọi AI detect
 *         -> AI trả kết quả -> BE lưu Supabase -> BE trả về FE
 *
 * Scan: FE -> BE /api/v1/inspect/scan (2 file sideA + sideB)
 *         -> BE detect từng mặt qua GraphRag -> merge
 *         -> BE recommend lốp theo size -> trả về FE
 */
import api from '@/lib/api';

export interface CrackLocation {
  x: number;
  y: number;
  confidence: number;
}

export interface InspectionResult {
  id: string;
  user_id: string;
  image_url: string;
  wear_level: string;
  wear_percentage: number;
  tire_type_detected: string;
  crack_detected: boolean;
  crack_severity: string;
  crack_locations: CrackLocation[];
  ai_confidence: number;
  recommendation: string;
  suggested_products?: Array<{
    id: string;
    name: string;
    price: number;
    sale_price?: number;
    slug: string;
  }>;
  created_at: string;
}

// ── Scan types ────────────────────────────────────────────────────────────

export interface OcrDetailField {
  raw_text: string;
  normalized_text: string;
  ocr_confidence: number;
  yolo_confidence: number;
  crop_image?: string;
  ocr_input_image?: string;
}

export interface ScanDetectResult {
  side: string;
  success: boolean;
  brand: string | null;
  size: string | null;
  pattern: string | null;
  brand_ocr?: OcrDetailField;
  size_ocr?: OcrDetailField;
  pattern_ocr?: OcrDetailField;
  ocr_confidence: number;
  detections_count: number;
  steps?: any[];
  error?: string;
}

export interface PatternBenefit {
  code: string;
  loai: string | null;
  loi_ich: string | null;
  phu_hop: string | null;
  dieu_kien_duong: string | null;
}

export interface TireRecommendItem {
  position: string; // "front" | "rear"
  size: string;
  brand: string;
  pattern_code: string;
  sale_price_inc_vat: number | null;
  pattern_benefit: PatternBenefit | null;
  tube_size: string | null;
  tire_type: string | null;
  product_id?: string;
  product_slug?: string;
  product_name?: string;
  image_url?: string;
}

export interface VehicleInfo {
  name: string;
}

export interface ScanProduct {
  id: string;
  brand: string;
  size: string;
  pattern: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  stock_quantity: number;
  has_tube: boolean | null;
  tire_type?: string;
}

export interface ScanRecommendResponse {
  success: boolean;
  vehicle_name: string;
  front_size: string | null;
  rear_size: string | null;
  tires: TireRecommendItem[];
  error?: string;
}

export interface ScanResponse {
  success: boolean;
  merged: ScanDetectResult;
  sides: ScanDetectResult[];
  case_type: 'size_pattern' | 'size_only' | 'pattern_only' | 'none' | null;
  products: ScanProduct[];
  vehicles: VehicleInfo[] | null;
  front_size: string | null;
  rear_size: string | null;
  recommend?: ScanRecommendResponse;
}

/**
 * Gửi ảnh lốp để AI phân tích
 * Yêu cầu authentication (user đăng nhập)
 */
export async function inspectTire(file: File): Promise<InspectionResult> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.post('/api/v1/inspect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

/**
 * Scan: chụp 2 mặt 1 lốp → detect + merge
 * Nếu có vehicle_name → recommend tất cả lốp trước + sau cho xe đó
 * Nếu không có vehicle_name → trả vehicles phù hợp với size detect
 */
export async function scanTire(
  sideA: File,
  sideB?: File | null,
  vehicleName?: string | null
): Promise<ScanResponse> {
  const formData = new FormData();
  formData.append('sideA', sideA);
  if (sideB) formData.append('sideB', sideB);
  if (vehicleName) formData.append('vehicle_name', vehicleName);

  const res = await api.post('/api/v1/inspect/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

/**
 * Lấy lịch sử kiểm tra lốp của user
 */
export async function getInspectionHistory(): Promise<InspectionResult[]> {
  const res = await api.get('/api/v1/inspect/history');
  return res.data.data;
}
