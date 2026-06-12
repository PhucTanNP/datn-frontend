/**
 * Services — layer gọi API từ FE lên BE
 *
 * Luồng dữ liệu:
 *   FE (services) -> BE (Express) -> AI Service (GraphRag) / Supabase / Cloudinary
 *
 * Chat:      FE -> BE /api/v1/chat        -> BE -> GraphRag /query
 * Inspect:   FE -> BE /api/v1/inspect     -> BE -> Cloudinary -> GraphRag /detect -> BE -> Supabase
 * Auth:      FE -> BE /api/v1/auth/*      -> BE -> Supabase
 * Products:  FE -> BE /api/v1/products/*  -> BE -> Supabase
 * Orders:    FE -> BE /api/v1/orders/*    -> BE -> Supabase
 */

export { sendChatMessage, inspectTire as chatInspectTire } from './chatService';
export type { ChatMessage, ChatResponse } from './chatService';

export { inspectTire, getInspectionHistory } from './inspectionService';
export type { InspectionResult, CrackLocation } from './inspectionService';
