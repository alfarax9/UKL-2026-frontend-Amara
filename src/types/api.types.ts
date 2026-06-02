// ---- Standard response envelope used by Amara API ----
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type Role = "ADMIN" | "USER";
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  picture?: string | null;  // Google profile photo (present only for Google-auth sessions)
  authSource?: "amara" | "google"; // "google" = session without Amara JWT
}

export interface AuthData {
  accessToken: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  createdAt?: string;
}

export interface Menu {
  id: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  imageUrl?: string;
  categoryId: string;
  category?: Category;
}

/** Order item as returned by the API (nested under `orderItems`). */
export interface OrderItemResponse {
  id: string;
  quantity: number;
  price: string | number;
  subtotal?: string | number;
  menuId: string;
  menu?: { name: string; imageUrl?: string | null };
}

export interface Order {
  id: string;
  tableNumber: string;
  customerName: string;
  notes?: string | null;
  status: OrderStatus;
  totalPrice?: string | number;
  orderItems?: OrderItemResponse[];
  createdAt?: string;
  updatedAt?: string;
}

/** Pagination metadata returned by the Amara API (verified live). */
export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Paginated payload shape: `{ data: [...], meta: {...} }`. */
export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

// ---- DTOs ----
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface CreateOrderDto {
  tableNumber: string;
  customerName: string;
  notes?: string;
  items: { menuId: string; quantity: number }[];
}

export interface MenuQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isAvailable?: boolean;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  tableNumber?: string;
  status?: OrderStatus;
}
