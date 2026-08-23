export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors: Record<string, string[]> | null;
}

export interface Service {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Portfolio {
  id: number;
  title: string;
  slug: string;
  category: string;
  client_name: string | null;
  short_description: string;
  description: string | null;
  technologies: string[] | null;
  image: string | null;
  project_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

export type SiteSettings = Record<string, string>;

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service_id?: number;
  message: string;
}

export interface ContactMessage extends ContactPayload {
  id: number;
  status: "new" | "contacted" | "closed";
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface HomeStats {
  projects_count: number;
  clients_count: number;
}
