// ─────────────────────────────────────────────
// @unkora/types — Complete shared type definitions
// ─────────────────────────────────────────────

// ── ENUMS ────────────────────────────────────

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  VENDOR = "VENDOR",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
}

export enum ProductStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  PACKED = "PACKED",
  HANDED_TO_COURIER = "HANDED_TO_COURIER",
  SHIPPED = "SHIPPED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURN_REQUESTED = "RETURN_REQUESTED",
  RETURN_APPROVED = "RETURN_APPROVED",
  RETURN_RECEIVED = "RETURN_RECEIVED",
  REFUNDED = "REFUNDED",
}

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
  PARTIAL = "PARTIAL",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}

export enum PaymentMethod {
  SSLCOMMERZ = "SSLCOMMERZ",
  BKASH = "BKASH",
  NAGAD = "NAGAD",
  CARD = "CARD",
  COD = "COD",
}

export enum PaymentGateway {
  SSLCOMMERZ = "SSLCOMMERZ",
  BKASH = "BKASH",
  NAGAD = "NAGAD",
  CARD = "CARD",
  COD = "COD",
}

export enum CourierProvider {
  PATHAO = "PATHAO",
  STEADFAST = "STEADFAST",
  REDX = "REDX",
  SA_PARIBAHAN = "SA_PARIBAHAN",
  SUNDARBAN = "SUNDARBAN",
  MANUAL = "MANUAL",
}

export enum DeliveryMethod {
  STANDARD = "STANDARD",
  EXPRESS = "EXPRESS",
}

export enum DeliveryStatus {
  PENDING_PICKUP = "PENDING_PICKUP",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  FAILED_ATTEMPT = "FAILED_ATTEMPT",
  RETURNED_TO_SENDER = "RETURNED_TO_SENDER",
  CANCELLED = "CANCELLED",
}

export enum CouponType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  FREE_SHIPPING = "FREE_SHIPPING",
}

export enum NotificationType {
  ORDER_STATUS = "ORDER_STATUS",
  PAYMENT = "PAYMENT",
  PROMO = "PROMO",
  SYSTEM = "SYSTEM",
  REVIEW = "REVIEW",
  LOYALTY = "LOYALTY",
}

export enum LoyaltyTier {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
}

export enum VendorStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
  REJECTED = "REJECTED",
}

export enum BannerPosition {
  HERO = "HERO",
  CATEGORY = "CATEGORY",
  SIDEBAR = "SIDEBAR",
  POPUP = "POPUP",
  FLASH_SALE = "FLASH_SALE",
}

export enum ProductCategory {
  BOOKS = "BOOKS",
  LEATHER = "LEATHER",
  BABY_PRODUCTS = "BABY_PRODUCTS",
  ISLAMIC_LIFESTYLE = "ISLAMIC_LIFESTYLE",
  ORGANIC_FOODS = "ORGANIC_FOODS",
}

export enum Language {
  EN = "EN",
  BN = "BN",
}

export enum Division {
  DHAKA = "DHAKA",
  CHITTAGONG = "CHITTAGONG",
  SYLHET = "SYLHET",
  RAJSHAHI = "RAJSHAHI",
  KHULNA = "KHULNA",
  BARISAL = "BARISAL",
  RANGPUR = "RANGPUR",
  MYMENSINGH = "MYMENSINGH",
}

// ── MULTILINGUAL & SEO ───────────────────────

export interface MultilingualText {
  en: string;
  bn: string;
}

export interface SEOFields {
  meta_title?: string | null;
  meta_title_bn?: string | null;
  meta_description?: string | null;
  meta_description_bn?: string | null;
  slug: string;
  og_image?: string | null;
  canonical_url?: string | null;
  keywords?: string[] | null;
}

export interface TimestampFields {
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

// ── BANGLADESH DISTRICTS ─────────────────────

export interface BangladeshDistrict {
  id: number;
  name_en: string;
  name_bn: string;
  division: Division;
  division_bn: string;
}

export const BANGLADESH_DISTRICTS: BangladeshDistrict[] = [
  { id: 1, name_en: "Dhaka", name_bn: "ঢাকা", division: Division.DHAKA, division_bn: "ঢাকা" },
  { id: 2, name_en: "Faridpur", name_bn: "ফরিদপুর", division: Division.DHAKA, division_bn: "ঢাকা" },
  { id: 3, name_en: "Gazipur", name_bn: "গাজীপুর", division: Division.DHAKA, division_bn: "ঢাকা" },
  { id: 4, name_en: "Gopalganj", name_bn: "গোপালগঞ্জ", division: Division.DHAKA, division_bn: "ঢাকা" },
  { id: 5, name_en: "Kishoreganj", name_bn: "কিশোরগঞ্জ", division: Division.DHAKA, division_bn: "ঢাকা" },
  { id: 6, name_en: "Madaripur", name_bn: "মাদারীপুর", division: Division.DHAKA, division_bn: "ঢাকা" },
  { id: 7, name_en: "Manikganj", name_bn: "মানিকগঞ্জ", division: Division.DHAKA, division_bn: "ঢাকা" },
  { id: 8, name_en: "Munshiganj", name_bn: "মুন্সিগঞ্জ", division: Division.DHAKA, division_bn: "ঢাকা" },
  { id: 9, name_en: "Narayanganj", name_bn: "নারায়ণগঞ্জ", division: Division.DHAKA, division_bn: "ঢাকা" },
  { id: 10, name_en: "Narsingdi", name_bn: "নরসিংদী", division: Division.DHAKA, division_bn: "ঢাকা" },
  { id: 11, name_en: "Rajbari", name_bn: "রাজবাড়ী", division: Division.DHAKA, division_bn: "ঢাকা" },
  { id: 12, name_en: "Shariatpur", name_bn: "শরীয়তপুর", division: Division.DHAKA, division_bn: "ঢাকা" },
  { id: 13, name_en: "Tangail", name_bn: "টাঙ্গাইল", division: Division.DHAKA, division_bn: "ঢাকা" },
  { id: 14, name_en: "Bandarban", name_bn: "বান্দরবান", division: Division.CHITTAGONG, division_bn: "চট্টগ্রাম" },
  { id: 15, name_en: "Brahmanbaria", name_bn: "ব্রাহ্মণবাড়িয়া", division: Division.CHITTAGONG, division_bn: "চট্টগ্রাম" },
  { id: 16, name_en: "Chandpur", name_bn: "চাঁদপুর", division: Division.CHITTAGONG, division_bn: "চট্টগ্রাম" },
  { id: 17, name_en: "Chittagong", name_bn: "চট্টগ্রাম", division: Division.CHITTAGONG, division_bn: "চট্টগ্রাম" },
  { id: 18, name_en: "Comilla", name_bn: "কুমিল্লা", division: Division.CHITTAGONG, division_bn: "চট্টগ্রাম" },
  { id: 19, name_en: "Cox's Bazar", name_bn: "কক্সবাজার", division: Division.CHITTAGONG, division_bn: "চট্টগ্রাম" },
  { id: 20, name_en: "Feni", name_bn: "ফেনী", division: Division.CHITTAGONG, division_bn: "চট্টগ্রাম" },
  { id: 21, name_en: "Khagrachhari", name_bn: "খাগড়াছড়ি", division: Division.CHITTAGONG, division_bn: "চট্টগ্রাম" },
  { id: 22, name_en: "Lakshmipur", name_bn: "লক্ষ্মীপুর", division: Division.CHITTAGONG, division_bn: "চট্টগ্রাম" },
  { id: 23, name_en: "Noakhali", name_bn: "নোয়াখালী", division: Division.CHITTAGONG, division_bn: "চট্টগ্রাম" },
  { id: 24, name_en: "Rangamati", name_bn: "রাঙ্গামাটি", division: Division.CHITTAGONG, division_bn: "চট্টগ্রাম" },
  { id: 25, name_en: "Habiganj", name_bn: "হবিগঞ্জ", division: Division.SYLHET, division_bn: "সিলেট" },
  { id: 26, name_en: "Moulvibazar", name_bn: "মৌলভীবাজার", division: Division.SYLHET, division_bn: "সিলেট" },
  { id: 27, name_en: "Sunamganj", name_bn: "সুনামগঞ্জ", division: Division.SYLHET, division_bn: "সিলেট" },
  { id: 28, name_en: "Sylhet", name_bn: "সিলেট", division: Division.SYLHET, division_bn: "সিলেট" },
  { id: 29, name_en: "Bogura", name_bn: "বগুড়া", division: Division.RAJSHAHI, division_bn: "রাজশাহী" },
  { id: 30, name_en: "Chapainawabganj", name_bn: "চাঁপাইনবাবগঞ্জ", division: Division.RAJSHAHI, division_bn: "রাজশাহী" },
  { id: 31, name_en: "Joypurhat", name_bn: "জয়পুরহাট", division: Division.RAJSHAHI, division_bn: "রাজশাহী" },
  { id: 32, name_en: "Naogaon", name_bn: "নওগাঁ", division: Division.RAJSHAHI, division_bn: "রাজশাহী" },
  { id: 33, name_en: "Natore", name_bn: "নাটোর", division: Division.RAJSHAHI, division_bn: "রাজশাহী" },
  { id: 34, name_en: "Pabna", name_bn: "পাবনা", division: Division.RAJSHAHI, division_bn: "রাজশাহী" },
  { id: 35, name_en: "Rajshahi", name_bn: "রাজশাহী", division: Division.RAJSHAHI, division_bn: "রাজশাহী" },
  { id: 36, name_en: "Sirajganj", name_bn: "সিরাজগঞ্জ", division: Division.RAJSHAHI, division_bn: "রাজশাহী" },
  { id: 37, name_en: "Bagerhat", name_bn: "বাগেরহাট", division: Division.KHULNA, division_bn: "খুলনা" },
  { id: 38, name_en: "Chuadanga", name_bn: "চুয়াডাঙ্গা", division: Division.KHULNA, division_bn: "খুলনা" },
  { id: 39, name_en: "Jessore", name_bn: "যশোর", division: Division.KHULNA, division_bn: "খুলনা" },
  { id: 40, name_en: "Jhenaidah", name_bn: "ঝিনাইদহ", division: Division.KHULNA, division_bn: "খুলনা" },
  { id: 41, name_en: "Khulna", name_bn: "খুলনা", division: Division.KHULNA, division_bn: "খুলনা" },
  { id: 42, name_en: "Kushtia", name_bn: "কুষ্টিয়া", division: Division.KHULNA, division_bn: "খুলনা" },
  { id: 43, name_en: "Magura", name_bn: "মাগুরা", division: Division.KHULNA, division_bn: "খুলনা" },
  { id: 44, name_en: "Meherpur", name_bn: "মেহেরপুর", division: Division.KHULNA, division_bn: "খুলনা" },
  { id: 45, name_en: "Narail", name_bn: "নড়াইল", division: Division.KHULNA, division_bn: "খুলনা" },
  { id: 46, name_en: "Satkhira", name_bn: "সাতক্ষীরা", division: Division.KHULNA, division_bn: "খুলনা" },
  { id: 47, name_en: "Barguna", name_bn: "বরগুনা", division: Division.BARISAL, division_bn: "বরিশাল" },
  { id: 48, name_en: "Barisal", name_bn: "বরিশাল", division: Division.BARISAL, division_bn: "বরিশাল" },
  { id: 49, name_en: "Bhola", name_bn: "ভোলা", division: Division.BARISAL, division_bn: "বরিশাল" },
  { id: 50, name_en: "Jhalokathi", name_bn: "ঝালকাঠি", division: Division.BARISAL, division_bn: "বরিশাল" },
  { id: 51, name_en: "Patuakhali", name_bn: "পটুয়াখালী", division: Division.BARISAL, division_bn: "বরিশাল" },
  { id: 52, name_en: "Pirojpur", name_bn: "পিরোজপুর", division: Division.BARISAL, division_bn: "বরিশাল" },
  { id: 53, name_en: "Dinajpur", name_bn: "দিনাজপুর", division: Division.RANGPUR, division_bn: "রংপুর" },
  { id: 54, name_en: "Gaibandha", name_bn: "গাইবান্ধা", division: Division.RANGPUR, division_bn: "রংপুর" },
  { id: 55, name_en: "Kurigram", name_bn: "কুড়িগ্রাম", division: Division.RANGPUR, division_bn: "রংপুর" },
  { id: 56, name_en: "Lalmonirhat", name_bn: "লালমনিরহাট", division: Division.RANGPUR, division_bn: "রংপুর" },
  { id: 57, name_en: "Nilphamari", name_bn: "নীলফামারী", division: Division.RANGPUR, division_bn: "রংপুর" },
  { id: 58, name_en: "Panchagarh", name_bn: "পঞ্চগড়", division: Division.RANGPUR, division_bn: "রংপুর" },
  { id: 59, name_en: "Rangpur", name_bn: "রংপুর", division: Division.RANGPUR, division_bn: "রংপুর" },
  { id: 60, name_en: "Thakurgaon", name_bn: "ঠাকুরগাঁও", division: Division.RANGPUR, division_bn: "রংপুর" },
  { id: 61, name_en: "Jamalpur", name_bn: "জামালপুর", division: Division.MYMENSINGH, division_bn: "ময়মনসিংহ" },
  { id: 62, name_en: "Mymensingh", name_bn: "ময়মনসিংহ", division: Division.MYMENSINGH, division_bn: "ময়মনসিংহ" },
  { id: 63, name_en: "Netrokona", name_bn: "নেত্রকোনা", division: Division.MYMENSINGH, division_bn: "ময়মনসিংহ" },
  { id: 64, name_en: "Sherpur", name_bn: "শেরপুর", division: Division.MYMENSINGH, division_bn: "ময়মনসিংহ" },
];

// ── USER ─────────────────────────────────────

export interface User extends TimestampFields {
  id: string;
  email?: string | null;
  phone?: string | null;
  password_hash?: string | null;
  pin_hash?: string | null;
  name_en: string;
  name_bn?: string | null;
  avatar?: string | null;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_secret?: string | null;
  loyalty_points: number;
  loyalty_tier: LoyaltyTier;
  referral_code: string;
  referred_by?: string | null;
  last_login_at?: Date | null;
  addresses?: Address[];
  orders?: Order[];
}

export interface UserSession {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name?: string | null;
  ip_address: string;
  user_agent: string;
  is_trusted: boolean;
  last_active: Date;
  expires_at: Date;
  created_at: Date;
}

// ── ADDRESS ──────────────────────────────────

export interface Address extends TimestampFields {
  id: string;
  user_id: string;
  label: "HOME" | "WORK" | "OTHER";
  recipient_name: string;
  phone: string;
  division: Division;
  district: string;
  upazila: string;
  union?: string | null;
  street: string;
  postal_code?: string | null;
  is_default: boolean;
}

// ── CATEGORY ─────────────────────────────────

export interface Category extends TimestampFields, SEOFields {
  id: string;
  name_en: string;
  name_bn: string;
  parent_id?: string | null;
  parent?: Category | null;
  children?: Category[];
  icon?: string | null;
  image?: string | null;
  banner_image?: string | null;
  is_active: boolean;
  sort_order: number;
  product_count?: number;
  main_category: ProductCategory;
}

// ── BRAND ────────────────────────────────────

export interface Brand extends TimestampFields {
  id: string;
  name: string;
  name_bn?: string | null;
  slug: string;
  logo?: string | null;
  country_of_origin?: string | null;
  is_verified: boolean;
  description?: string | null;
  product_count?: number;
}

// ── PRODUCT ──────────────────────────────────

export interface Product extends TimestampFields, SEOFields {
  id: string;
  sku: string;
  name_en: string;
  name_bn: string;
  short_description_en?: string | null;
  short_description_bn?: string | null;
  description_en: string;
  description_bn: string;
  category_id: string;
  category?: Category;
  brand_id?: string | null;
  brand?: Brand | null;
  vendor_id?: string | null;
  vendor?: Vendor | null;
  base_price: number;
  sale_price?: number | null;
  cost_price?: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  weight_grams?: number | null;
  is_active: boolean;
  is_featured: boolean;
  is_halal_certified: boolean;
  is_organic_certified: boolean;
  publish_status: ProductStatus;
  views_count: number;
  sales_count: number;
  rating_average: number;
  rating_count: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
  book_detail?: BookDetail | null;
  leather_detail?: LeatherDetail | null;
  baby_product_detail?: BabyProductDetail | null;
  islamic_product_detail?: IslamicProductDetail | null;
  organic_food_detail?: OrganicFoodDetail | null;
  tags?: string[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string | null;
  alt_text_bn?: string | null;
  sort_order: number;
  is_primary: boolean;
  width?: number | null;
  height?: number | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  name_bn?: string | null;
  attributes: Record<string, string>;
  price_modifier: number;
  stock_quantity: number;
  image?: string | null;
  is_active: boolean;
}

// ── CATEGORY-SPECIFIC DETAILS ────────────────

export interface BookDetail {
  id: string;
  product_id: string;
  isbn?: string | null;
  author_en: string;
  author_bn?: string | null;
  publisher_en?: string | null;
  publisher_bn?: string | null;
  edition?: string | null;
  pages?: number | null;
  language: "EN" | "BN" | "ARABIC" | "URDU";
  genre?: string | null;
  publication_year?: number | null;
  is_islamic_book: boolean;
  subject?: string | null;
  binding_type?: "HARDCOVER" | "PAPERBACK" | "BOARD_BOOK" | null;
}

export interface LeatherDetail {
  id: string;
  product_id: string;
  leather_type: "GENUINE" | "FULL_GRAIN" | "TOP_GRAIN" | "BONDED" | "SYNTHETIC";
  color: string;
  color_bn?: string | null;
  dimensions?: string | null;
  care_instructions_en?: string | null;
  care_instructions_bn?: string | null;
  hardware_material?: string | null;
  lining_material?: string | null;
  warranty_months?: number | null;
}

export interface BabyProductDetail {
  id: string;
  product_id: string;
  age_range_min_months: number;
  age_range_max_months?: number | null;
  material_en?: string | null;
  material_bn?: string | null;
  safety_certifications?: string[];
  choking_hazard: boolean;
  bpa_free: boolean;
  color_options?: string[];
  washing_instructions?: string | null;
  max_weight_kg?: number | null;
}

export interface IslamicProductDetail {
  id: string;
  product_id: string;
  arabic_name?: string | null;
  halal_certificate_no?: string | null;
  halal_certifying_body?: string | null;
  country_of_origin: string;
  usage_instructions_en?: string | null;
  usage_instructions_bn?: string | null;
  usage_instructions_ar?: string | null;
  fragrance_notes?: string | null;
  bead_count?: number | null;
  material?: string | null;
  size?: string | null;
}

export interface NutritionalInfo {
  serving_size_grams: number;
  calories: number;
  protein_grams: number;
  carbohydrates_grams: number;
  fat_grams: number;
  fiber_grams?: number;
  sugar_grams?: number;
  sodium_mg?: number;
}

export interface OrganicFoodDetail {
  id: string;
  product_id: string;
  organic_certified: boolean;
  certificate_no?: string | null;
  certifying_body?: string | null;
  origin_region?: string | null;
  origin_region_bn?: string | null;
  ingredients_en?: string | null;
  ingredients_bn?: string | null;
  nutritional_info?: NutritionalInfo | null;
  expiry_months?: number | null;
  storage_instructions_en?: string | null;
  storage_instructions_bn?: string | null;
  net_weight_grams?: number | null;
  allergens?: string[];
}

// ── CART ─────────────────────────────────────

export interface Cart extends TimestampFields {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  items: CartItem[];
  coupon_code?: string | null;
  coupon?: Coupon | null;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  total: number;
  item_count: number;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product?: Product;
  variant_id?: string | null;
  variant?: ProductVariant | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// ── ORDER ────────────────────────────────────

export interface ShippingAddress {
  recipient_name: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  union?: string | null;
  street: string;
  postal_code?: string | null;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  note?: string | null;
  actor_id?: string | null;
  actor_role?: UserRole;
  timestamp: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string | null;
  product_name_en: string;
  product_name_bn?: string | null;
  product_image: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  vendor_id?: string | null;
}

export interface VendorSubOrder {
  id: string;
  order_id: string;
  vendor_id: string;
  vendor?: Vendor;
  items: OrderItem[];
  subtotal: number;
  commission_amount: number;
  vendor_payout: number;
  status: OrderStatus;
}

export interface Order extends TimestampFields {
  id: string;
  order_number: string;
  user_id: string;
  user?: User;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  shipping_address: ShippingAddress;
  delivery_method: DeliveryMethod;
  estimated_delivery_date?: Date | null;
  actual_delivery_date?: Date | null;
  tracking_number?: string | null;
  courier?: CourierProvider | null;
  notes?: string | null;
  admin_notes?: string | null;
  coupon_code?: string | null;
  status_history?: OrderStatusHistory[];
  payment?: Payment | null;
  delivery?: Delivery | null;
  vendor_sub_orders?: VendorSubOrder[];
  fraud_score?: number | null;
}

// ── PAYMENT ──────────────────────────────────

export interface Payment extends TimestampFields {
  id: string;
  order_id: string;
  transaction_id: string;
  gateway_transaction_id?: string | null;
  gateway: PaymentGateway;
  amount: number;
  currency: "BDT";
  status: PaymentStatus;
  gateway_response?: Record<string, unknown> | null;
  refund_amount?: number | null;
  refund_reason?: string | null;
  refunded_at?: Date | null;
  idempotency_key: string;
}

// ── DELIVERY ─────────────────────────────────

export interface TrackingEvent {
  timestamp: Date;
  status: DeliveryStatus;
  location?: string | null;
  description: string;
  description_bn?: string | null;
}

export interface Delivery extends TimestampFields {
  id: string;
  order_id: string;
  courier: CourierProvider;
  consignment_id?: string | null;
  tracking_url?: string | null;
  status: DeliveryStatus;
  pickup_date?: Date | null;
  shipped_date?: Date | null;
  expected_delivery_date?: Date | null;
  actual_delivery_date?: Date | null;
  delivery_attempts: number;
  last_attempt_at?: Date | null;
  failure_reason?: string | null;
  proof_of_delivery_image?: string | null;
  agent_name?: string | null;
  agent_phone?: string | null;
  tracking_events?: TrackingEvent[];
}

export interface DeliveryZone {
  id: string;
  division: Division;
  district: string;
  upazila?: string | null;
  standard_days: number;
  express_days: number;
  standard_cost: number;
  express_cost: number;
  is_serviceable: boolean;
  cod_available: boolean;
  couriers_available: CourierProvider[];
}

// ── REVIEW ───────────────────────────────────

export interface Review extends TimestampFields {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string | null;
  body: string;
  images?: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  admin_reply?: string | null;
  admin_reply_at?: Date | null;
  user?: Pick<User, "id" | "name_en" | "avatar">;
}

// ── COUPON ───────────────────────────────────

export interface Coupon extends TimestampFields {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order_amount?: number | null;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  per_user_limit: number;
  used_count: number;
  valid_from: Date;
  valid_until: Date;
  applicable_categories?: string[];
  applicable_products?: string[];
  excluded_products?: string[];
  is_active: boolean;
  is_auto_apply: boolean;
  description?: string | null;
}

// ── NOTIFICATION ─────────────────────────────

export interface Notification extends TimestampFields {
  id: string;
  user_id: string;
  type: NotificationType;
  title_en: string;
  title_bn: string;
  body_en: string;
  body_bn: string;
  is_read: boolean;
  read_at?: Date | null;
  action_url?: string | null;
  image?: string | null;
  data?: Record<string, unknown> | null;
}

// ── VENDOR ───────────────────────────────────

export interface VendorDocument {
  type: "TRADE_LICENSE" | "NID" | "TIN" | "BANK_STATEMENT" | "OTHER";
  url: string;
  verified: boolean;
  uploaded_at: Date;
}

export interface Vendor extends TimestampFields {
  id: string;
  user_id: string;
  user?: User;
  shop_name_en: string;
  shop_name_bn?: string | null;
  slug: string;
  description_en?: string | null;
  description_bn?: string | null;
  logo?: string | null;
  banner?: string | null;
  phone: string;
  email: string;
  address: string;
  division: Division;
  district: string;
  trade_license_no?: string | null;
  tin?: string | null;
  nid?: string | null;
  bank_name?: string | null;
  bank_account_no?: string | null;
  bank_account_name?: string | null;
  bank_branch?: string | null;
  bkash_number?: string | null;
  commission_rate: number;
  status: VendorStatus;
  rejection_reason?: string | null;
  rating: number;
  total_orders: number;
  total_revenue: number;
  pending_payout: number;
  documents?: VendorDocument[];
}

// ── LOYALTY ──────────────────────────────────

export interface LoyaltyTransaction extends TimestampFields {
  id: string;
  user_id: string;
  points: number;
  type:
    | "EARNED_PURCHASE"
    | "EARNED_REVIEW"
    | "EARNED_REFERRAL"
    | "REDEEMED"
    | "EXPIRED"
    | "BONUS"
    | "ADJUSTED";
  reference_id?: string | null;
  description: string;
  description_bn: string;
  balance_after: number;
  expires_at?: Date | null;
}

export interface LoyaltyTierConfig {
  tier: LoyaltyTier;
  min_points: number;
  max_points?: number;
  discount_percentage: number;
  free_shipping: boolean;
  priority_support: boolean;
  birthday_bonus_points: number;
  name_en: string;
  name_bn: string;
  color: string;
  icon: string;
}

// ── FRAUD DETECTION ──────────────────────────

export interface FraudFlag {
  type: string;
  description: string;
  points: number;
}

export interface FraudScore {
  order_id: string;
  score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  flags: FraudFlag[];
  recommendation: "APPROVE" | "REVIEW" | "REQUIRE_PREPAYMENT" | "REJECT";
}

export interface Blacklist extends TimestampFields {
  id: string;
  type: "PHONE" | "EMAIL" | "ADDRESS" | "IP" | "DEVICE";
  value: string;
  reason: string;
  added_by: string;
  is_active: boolean;
}

// ── FLASH SALE ───────────────────────────────

export interface FlashSaleItem {
  id: string;
  flash_sale_id: string;
  product_id: string;
  product?: Product;
  discount_percentage: number;
  sale_price: number;
  max_quantity: number;
  sold_count: number;
  remaining: number;
}

export interface FlashSale extends TimestampFields {
  id: string;
  name_en: string;
  name_bn: string;
  start_time: Date;
  end_time: Date;
  banner_image?: string | null;
  is_active: boolean;
  items?: FlashSaleItem[];
}

// ── BANNER ───────────────────────────────────

export interface Banner extends TimestampFields {
  id: string;
  title_en: string;
  title_bn?: string | null;
  image_url: string;
  mobile_image_url?: string | null;
  link?: string | null;
  position: BannerPosition;
  start_date?: Date | null;
  end_date?: Date | null;
  is_active: boolean;
  sort_order: number;
  click_count: number;
}

// ── API RESPONSE ─────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
  message_bn?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  message_bn?: string;
  errors?: ValidationError[];
  meta?: PaginationMeta;
  code?: string;
}

// ── MARKETING ────────────────────────────────

export interface MarketingCampaign extends TimestampFields {
  id: string;
  name: string;
  type: "SMS" | "EMAIL" | "PUSH" | "ALL";
  segment_id: string;
  subject?: string | null;
  message_en: string;
  message_bn: string;
  scheduled_at?: Date | null;
  sent_at?: Date | null;
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  unsubscribed_count: number;
}
