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

export interface TechNote {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  thumbnail: string | null;
  tags: string[] | null;
  author_name: string;
  reading_time: number;
  is_active: boolean;
  published_at: string | null;
}

export interface TechNoteDetail {
  article: TechNote;
  related: TechNote[];
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

export type ProductType = "digital" | "subscription" | "service";
export type ProductStatus = "draft" | "published" | "archived";
export type BillingInterval = "monthly" | "yearly";
export type ProductBadge = "new" | "best_seller" | "popular";

export interface ProductFeature {
  id: number;
  product_id: number;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface SubscriptionPlanFeature {
  id: number;
  subscription_plan_id: number;
  feature: string;
  value: string | null;
  sort_order: number;
}

export interface SubscriptionPlan {
  id: number;
  product_id: number;
  name: string;
  description: string | null;
  price: string | null;
  billing_interval: BillingInterval;
  max_users: number | null;
  max_branches: number | null;
  max_products: number | null;
  cta_label: string | null;
  is_highlighted: boolean;
  status: ProductStatus;
  sort_order: number;
  plan_features?: SubscriptionPlanFeature[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  type: ProductType;
  category: string;
  short_description: string;
  description: string | null;
  thumbnail: string | null;
  gallery: string[] | null;
  tags: string[] | null;
  badge: ProductBadge | null;
  price: string | null;
  discount_price: string | null;
  currency: string;
  rating: string | null;
  purchases_count: number;
  demo_url: string | null;
  download_url: string | null;
  has_digital_file: boolean;
  whats_included: string[] | null;
  requirements: string[] | null;
  technology: string[] | null;
  faqs: ProductFaq[] | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  sort_order: number;
  status: ProductStatus;
  published_at: string | null;
  application_id: number | null;
  features?: ProductFeature[];
  plans?: SubscriptionPlan[];
  plans_count?: number;
}

export interface ProductDetail {
  product: Product;
  related: Product[];
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  subscription_plan_id: number | null;
  product_name: string;
  product_type: ProductType;
  price: string;
  quantity: number;
  billing_interval: BillingInterval | null;
  subtotal: string;
  product?: { id: number; name: string; slug: string; thumbnail: string | null; type: ProductType };
  subscription_plan?: { id: number; name: string } | null;
}

export interface Cart {
  id: number;
  user_id: number | null;
  session_id: string | null;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  items_count: number;
  items: CartItem[];
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

export type UserRole = "admin" | "customer";
export type UserStatus = "active" | "inactive" | "suspended";

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: UserRole;
  status: UserStatus;
  created_at?: string;
}

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled" | "expired";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "expired" | "refunded";

export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled";
export type DigitalAccessStatus = "active" | "revoked";

export type ApplicationStatus = "active" | "inactive";
export type ProvisioningStatus = "pending" | "processing" | "completed" | "failed";

export interface Application {
  id: number;
  name: string;
  code: string;
  base_url: string | null;
  status: ApplicationStatus;
}

export interface ApplicationProvisioning {
  id: number;
  subscription_id: number;
  status: ProvisioningStatus;
}

export interface Subscription {
  id: number;
  user_id: number;
  product_id: number | null;
  subscription_plan_id: number | null;
  order_id: number;
  order_item_id: number;
  status: SubscriptionStatus;
  started_at: string | null;
  expires_at: string | null;
  product?: {
    id: number;
    name: string;
    slug: string;
    thumbnail: string | null;
    type: ProductType;
    application_id: number | null;
    application?: Application | null;
  };
  provisioning?: ApplicationProvisioning | null;
}

export interface DigitalProductAccess {
  id: number;
  user_id: number;
  product_id: number | null;
  order_id: number;
  order_item_id: number;
  status: DigitalAccessStatus;
  granted_at: string | null;
  expires_at: string | null;
  download_count: number;
  product?: {
    id: number;
    name: string;
    slug: string;
    thumbnail: string | null;
    type: ProductType;
    has_digital_file: boolean;
    download_url: string | null;
  };
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  subscription_plan_id: number | null;
  product_name: string;
  product_type: ProductType;
  billing_interval: BillingInterval | null;
  quantity: number;
  unit_price: string;
  subtotal: string;
  subscription?: Subscription | null;
  digital_access?: DigitalProductAccess | null;
}

export interface Payment {
  id: number;
  order_id: number;
  provider: string | null;
  payment_method: string | null;
  transaction_id: string | null;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paid_at: string | null;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: OrderStatus;
  currency: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  created_at: string;
  items: OrderItem[];
  payment: Payment | null;
  user?: { id: number; name: string; email: string };
}

export interface MyProducts {
  subscriptions: Subscription[];
  digital: DigitalProductAccess[];
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
