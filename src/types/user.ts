export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  status?: 'active' | 'inactive';
  note?: string;
  created_at: string;
  updated_at: string;
}