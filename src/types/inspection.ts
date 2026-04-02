import { Product } from './product';

export type WearLevel = 'new' | 'good' | 'warning' | 'critical';
export type CrackSeverity = 'none' | 'minor' | 'major';

export interface CrackLocation {
  x: number;
  y: number;
  confidence: number;
}

export interface TireInspection {
  id: string;
  user_id: string;
  image_cloudinary_id?: string;
  image_url: string;
  wear_level: WearLevel;
  wear_percentage: number;
  tire_type_detected?: string;
  crack_detected: boolean;
  crack_severity: CrackSeverity;
  crack_locations?: CrackLocation[];
  ai_confidence: number;
  ai_raw_result?: Record<string, unknown>;
  recommendation: string;
  suggested_products?: string[];
  created_at: string;
  products?: Product[];
}

export interface InspectionRequest {
  image: File;
}
