/**
 * Inspection Service — gọi BE API để kiểm tra lốp
 *
 * Luồng: FE -> BE /api/v1/inspect -> BE upload Cloudinary -> BE gọi AI detect
 *         -> AI trả kết quả -> BE lưu Supabase -> BE trả về FE
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
 * Lấy lịch sử kiểm tra lốp của user
 */
export async function getInspectionHistory(): Promise<InspectionResult[]> {
  const res = await api.get('/api/v1/inspect/history');
  return res.data.data;
}
