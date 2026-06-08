import axios, { AxiosRequestConfig, AxiosError } from 'axios';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = 'drc_tires';

export interface CloudinaryUploadResult {
  url: string;
  cloudinaryId: string;
}
export async function uploadImage(file: File): Promise<CloudinaryUploadResult> {
  // Kiểm tra config
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local');
  }

  // Gửi file lên Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    throw new Error(`Upload failed: HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!data.secure_url || !data.public_id) {
    throw new Error('Upload failed: Missing secure_url or public_id');
  }

  // Tối ưu URL
  const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_800/');

  return {
    url: optimizedUrl,
    cloudinaryId: data.public_id,
  };
}
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}