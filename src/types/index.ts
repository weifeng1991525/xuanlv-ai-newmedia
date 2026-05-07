export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type MembershipTier = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

export interface Membership {
  id: string;
  userId: string;
  tier: MembershipTier;
  creditsRemaining: number;
  creditsTotal: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  autoRenew: boolean;
}

export interface MembershipPlan {
  id: string;
  tier: MembershipTier;
  name: string;
  price: number;
  creditsPerDay: number;
  features: string[];
  popular?: boolean;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderType = 'SUBSCRIPTION' | 'CREDIT_TOPUP';

export interface Order {
  id: string;
  userId: string;
  type: OrderType;
  amount: number;
  currency: string;
  status: OrderStatus;
  membershipTier?: MembershipTier;
  creditsAdded?: number;
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prompt {
  id: string;
  name: string;
  description: string;
  category: 'COMIC' | 'CUSTOM_IMAGE' | 'GENERAL';
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  model: string;
  temperature: number;
  maxTokens: number;
  isPublished: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export type GenerationType = 'COMIC' | 'CUSTOM_IMAGE';

export interface GenerationLog {
  id: string;
  userId: string;
  type: GenerationType;
  input: string;
  output: string;
  imageUrl?: string;
  tokensUsed: number;
  duration: number;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  target: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface AnalyticsData {
  date: string;
  totalUsers: number;
  newUsers: number;
  totalGenerations: number;
  comicCount: number;
  customImageCount: number;
  revenue: number;
  activeSubscriptions: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsersToday: number;
  totalGenerations: number;
  generationsToday: number;
  totalRevenue: number;
  revenueThisMonth: number;
  activeSubscriptions: number;
  premiumConversionRate: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserPrompt {
  id: string;
  userId: string;
  name: string;
  description: string;
  systemPrompt: string;
  category: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ComicFormData {
  copywriting: string;
  imageCount: number;
  size: string;
  quality: string;
}

export interface CustomImageFormData {
  prompt: string;
  count: number;
  size: string;
  quality: string;
  outputFormat: string;
}
