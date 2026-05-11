/**
 * Centralized TypeScript types matching Prisma schema enums
 * All enum values must be UPPERCASE
 */

// User enums
export type Role = "STUDENT" | "TEACHER" | "STAFF" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";

// Book enums
export type BookStatus = "AVAILABLE" | "BORROWED" | "RESERVED" | "MAINTENANCE";
export type BookCondition = "NEW" | "GOOD" | "FAIR" | "DAMAGED";

// Transaction enums
export type TransactionType = "BORROW" | "RETURN";
export type TransactionStatus = "ACTIVE" | "COMPLETED" | "OVERDUE";

// Reservation enums
export type ReservationStatus = "WAITING" | "READY" | "EXPIRED" | "CANCELLED";

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  rfidTag: string;
  role: Role;
  status: UserStatus;
  grade?: string;
  password?: string;
  maxBooks: number;
  emailNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
  transactions?: { id: string }[];
}

// Book type
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  rfidTag: string;
  publisher?: string;
  category: string;
  quantity: number;
  location: string;
  status: BookStatus;
  condition: string;
  borrowCount: number;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  transactions: Transaction[];
  user: User[];
}

// Transaction type
export interface Transaction {
  id: string;
  userId: string;
  bookId: string;
  type: TransactionType;
  status: TransactionStatus;
  borrowDate: Date;
  dueDate: Date;
  returnedAt?: Date;
  renewalCount: number;
  notes?: string;
  user?: User;
  book?: Book;
  createdAt: Date;
}

// Reservation type
export interface Reservation {
  id: string;
  userId: string;
  bookId: string;
  status: ReservationStatus;
  queuePosition?: number;
  expiresAt?: Date;
  notifiedAt?: Date;
  user?: User;
  book?: Book;
  createdAt: Date;
}

// Constants for UI
export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "TEACHER", label: "Teacher" },
  { value: "ADMIN", label: "Admin" },
];

export const USER_STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
];

export const BOOK_STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "BORROWED", label: "Borrowed" },
  { value: "RESERVED", label: "Reserved" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

export const BOOK_CONDITION_OPTIONS: { value: BookCondition; label: string }[] =
  [
    { value: "NEW", label: "New" },
    { value: "GOOD", label: "Good" },
    { value: "FAIR", label: "Fair" },
    { value: "DAMAGED", label: "Damaged" },
  ];

export const TRANSACTION_TYPE_OPTIONS: {
  value: TransactionType;
  label: string;
}[] = [
  { value: "BORROW", label: "Borrow" },
  { value: "RETURN", label: "Return" },
];

export const TRANSACTION_STATUS_OPTIONS: {
  value: TransactionStatus;
  label: string;
}[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "OVERDUE", label: "Overdue" },
];

export const RESERVATION_STATUS_OPTIONS: {
  value: ReservationStatus;
  label: string;
}[] = [
  { value: "WAITING", label: "Waiting" },
  { value: "READY", label: "Ready for Pickup" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Default max books by role
export const MAX_BOOKS_BY_ROLE: Record<Role, number> = {
  STUDENT: 3,
  TEACHER: 5,
  STAFF: 5,
  ADMIN: 10,
};

// Color mapping for status badges
export const STATUS_COLOR_MAP: Record<string, string> = {
  // User statuses
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-blue-100 text-green-800",
  SUSPENDED: "bg-yellow-100 text-red-800",
  BANNED: "bg-red-100 text-red-800",

  // Book statuses
  AVAILABLE: "bg-green-100 text-green-800",
  BORROWED: "bg-blue-100 text-blue-800",
  RESERVED: "bg-yellow-100 text-yellow-800",
  MAINTENANCE: "bg-orange-100 text-orange-800",

  // Transaction statuses
  COMPLETED: "bg-gray-100 text-gray-800",
  OVERDUE: "bg-red-100 text-red-800",

  // Reservation statuses
  WAITING: "bg-yellow-100 text-yellow-800",
  READY: "bg-green-100 text-green-800",
  EXPIRED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",

  // Roles
  STUDENT: "bg-green-100 text-green-800",
  TEACHER: "bg-blue-100 text-blue-800",
  STAFF: "bg-yellow-100 text-yellow-800",
  ADMIN: "bg-orange-100 text-orange-800",
};
