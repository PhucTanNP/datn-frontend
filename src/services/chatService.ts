/**
 * Chat Service — gọi BE API để chat với AI (GraphRag)
 *
 * Luồng: FE -> BE /api/v1/chat -> BE gọi GraphRag /query -> trả về FE
 */
import api from '@/lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  actions?: { label: string; value: string }[];
}

export interface ChatResponse {
  text: string;
  actions?: { label: string; value: string }[];
}

/**
 * Gửi tin nhắn chat tới BE (BE sẽ gọi GraphRag)
 */
export async function sendChatMessage(
  message: string,
  history?: ChatMessage[]
): Promise<ChatResponse> {
  const res = await api.post('/api/v1/chat', {
    message,
    history: history?.slice(-6) ?? [],
  });
  return res.data.data;
}

/**
 * Gửi ảnh để inspect lốp qua chatbot
 * BE nhận ảnh -> upload Cloudinary -> gọi AI detect -> lưu Supabase -> trả về
 */
export async function inspectTire(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.post('/api/v1/chat/inspect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}
