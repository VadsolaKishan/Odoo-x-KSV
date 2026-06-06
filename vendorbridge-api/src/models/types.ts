export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'procurement_officer' | 'manager' | 'vendor';
  country?: string;
  phone?: string;
  additional_info?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  gst_number: string;
  contact_name?: string;
  contact_phone: string;
  contact_email?: string;
  address?: string;
  status: 'active' | 'pending' | 'blocked';
  rating: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface RFQ {
  id: string;
  rfq_number: string;
  title: string;
  category: string;
  description?: string;
  deadline: Date;
  status: 'draft' | 'published' | 'closed' | 'awarded';
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface RFQLineItem {
  id: string;
  rfq_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  estimated_unit_price?: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
