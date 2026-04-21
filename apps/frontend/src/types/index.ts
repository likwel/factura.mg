// types/index.ts

import { LucideIcon } from 'lucide-react';

// ============================================================================
// ENUMS
// ============================================================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  CLIENT = 'CLIENT'
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE'
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum DocumentType {
  DEVIS = 'devis',
  COMMANDE = 'commande',
  FACTURE = 'facture',
  BL = 'bl',
  AVOIR = 'avoir',
  EXPEDITION = 'expedition'
}

export enum PartnerType {
  CLIENT = 'client',
  SUPPLIER = 'supplier'
}

// ============================================================================
// COMPANY TYPES
// ============================================================================

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  logo?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry?: Date;
  maxUsers: number;
  maxArticles: number;
  maxInvoices: number;
  theme?: Record<string, any>;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  permissions?: Record<string, any>;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  companyId: string;
  salary?: number;
  position?: string;
  hireDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  companyId: string;
  position?: string;
  salary?: number;
  hireDate?: Date;
}

export interface UserUpdate {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  position?: string;
  salary?: number;
  isActive?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// ============================================================================
// PARTNER TYPES (Client/Supplier)
// ============================================================================

export interface Partner {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  creditLimit?: number;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerFormData {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  creditLimit?: string;
  type: PartnerType;
}

export interface PartnerCreate {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  creditLimit?: number;
  companyId: string;
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  parent?: Category;
  children?: Category[];
}

export interface CategoryFormData {
  name: string;
  description?: string;
  parentId?: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
  parentId?: string;
  companyId: string;
}

// ============================================================================
// ARTICLE TYPES
// ============================================================================

export interface Article {
  id: string;
  code: string;
  name: string;
  description?: string;
  purchasePrice: number;
  sellingPrice: number;
  stockMin: number;
  stockMax?: number;
  currentStock: number;
  unit?: string;
  barcode?: string;
  image?: string;
  categoryId?: string;
  supplierId?: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface ArticleFormData {
  code: string;
  name: string;
  description?: string;
  purchasePrice: string;
  sellingPrice: string;
  stockMin: string;
  stockMax?: string;
  currentStock: string;
  unit?: string;
  barcode?: string;
  categoryId?: string;
}

export interface ArticleCreate {
  code: string;
  name: string;
  description?: string;
  purchasePrice: number;
  sellingPrice: number;
  stockMin: number;
  stockMax?: number;
  currentStock: number;
  unit?: string;
  barcode?: string;
  categoryId?: string;
  supplierId?: string;
  companyId: string;
}

// ============================================================================
// INVOICE/DOCUMENT TYPES
// ============================================================================

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  articleId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  article?: Article;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId?: string;
  supplierId?: string;
  userId: string;
  companyId: string;
  status: InvoiceStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  dueDate?: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  items: InvoiceItem[];
}

export interface DocumentItemFormData {
  article: string;
  quantity: number;
  price: number;
  discount: number;
}

export interface DocumentFormData {
  number: string;
  partnerId: string;
  date: string;
  dueDate?: string;
  notes?: string;
  discount: number;
  tax: number;
  type: DocumentType;
  partnerType: PartnerType;
  items: DocumentItemFormData[];
}

export interface DocumentCreate {
  invoiceNumber: string;
  clientId?: string;
  supplierId?: string;
  userId: string;
  companyId: string;
  status: InvoiceStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  dueDate?: Date;
  items: {
    articleId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }[];
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
  error?: string;
  disabled?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'purple' | 'warning';
  icon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  iconColor?: string;
}

export interface ToggleOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface ToggleButtonGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
}

export interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

// ============================================================================
// FORM COMPONENT PROPS
// ============================================================================

export interface PartnerFormProps {
  onSubmit?: (data: PartnerFormData) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<PartnerFormData>;
}

export interface ArticleFormProps {
  onSubmit?: (data: ArticleFormData) => void | Promise<void>;
  onCancel?: () => void;
  categories?: SelectOption[];
  initialData?: Partial<ArticleFormData>;
}

export interface CategoryFormProps {
  onSubmit?: (data: CategoryFormData) => void | Promise<void>;
  onCancel?: () => void;
  parentCategories?: SelectOption[];
  initialData?: Partial<CategoryFormData>;
}

export interface DocumentFormProps {
  onSubmit?: (data: DocumentFormData) => void | Promise<void>;
  onCancel?: () => void;
  partners?: SelectOption[];
  articles?: SelectOption[];
  initialData?: Partial<DocumentFormData>;
}

export interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ============================================================================
// VALIDATION ERROR TYPES
// ============================================================================

export interface ValidationErrors {
  [key: string]: string;
}

// ============================================================================
// STOCK MOVEMENT TYPES
// ============================================================================

export interface StockMovement {
  id: string;
  articleId: string;
  warehouseId: string;
  userId: string;
  quantity: number;
  type: string;
  reference?: string;
  notes?: string;
  createdAt: Date;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface Transaction {
  id: string;
  companyId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
  invoiceId?: string;
  date: Date;
  createdAt: Date;
}

// ============================================================================
// WAREHOUSE TYPES
// ============================================================================

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}