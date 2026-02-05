import axios from 'axios';
import { EscrowBackendConfig } from '@/config/config';
import {
  AdminUser,
  AdminUserDetails,
  AdminGig,
  AdminJob,
  AdminJobDetails,
  AdminConversation,
  AdminConversationDetails,
  AdminDashboardStats,
  AdminSystemSettings,
  Pagination,
} from '@/types/admin';
import { decodeToken } from './jwt';

const adminApi = axios.create({
  baseURL: EscrowBackendConfig.baseURL,
});

// Add admin token to requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin Login
export const adminLogin = async (email: string, password: string) => {
  try {
    const response = await adminApi.post('/admin/login', { email, password });
    const token = response.data.data;
    const decodedToken = decodeToken(token);

    if (!decodedToken || decodedToken.role !== 'admin') {
      return { success: false, error: 'Invalid admin credentials' };
    }

    localStorage.setItem('adminToken', token);
    return {
      success: true,
      data: {
        id: decodedToken.id,
        email: decodedToken.email || '',
        role: decodedToken.role,
        display_name: decodedToken.display_name || 'Admin',
        image_id: decodedToken.image_id || 'default.jpg',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Login failed',
    };
  }
};

// Get Dashboard Stats
export const getAdminDashboardStats = async () => {
  try {
    const response = await adminApi.get('/admin/stats');
    return {
      success: true,
      data: response.data.data as AdminDashboardStats,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to get stats',
    };
  }
};

// Get All Users
export const getAdminUsers = async (params?: { page?: number; limit?: number; search?: string }) => {
  try {
    const response = await adminApi.get('/admin/users', { params });
    return {
      success: true,
      data: response.data.data as AdminUser[],
      pagination: response.data.pagination as Pagination,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to get users',
    };
  }
};

// Get User Details
export const getAdminUserDetails = async (userId: string) => {
  try {
    const response = await adminApi.get(`/admin/users/${userId}`);
    return {
      success: true,
      data: response.data.data as AdminUserDetails,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to get user details',
    };
  }
};

// Get All Gigs
export const getAdminGigs = async (params?: { page?: number; limit?: number; search?: string }) => {
  try {
    const response = await adminApi.get('/admin/gigs', { params });
    return {
      success: true,
      data: response.data.data as AdminGig[],
      pagination: response.data.pagination as Pagination,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to get gigs',
    };
  }
};

// Get Gig Details
export const getAdminGigDetails = async (gigId: string) => {
  try {
    const response = await adminApi.get(`/admin/gigs/${gigId}`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to get gig details',
    };
  }
};

// Get All Jobs
export const getAdminJobs = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  try {
    const response = await adminApi.get('/admin/jobs', { params });
    return {
      success: true,
      data: response.data.data as AdminJob[],
      pagination: response.data.pagination as Pagination,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to get jobs',
    };
  }
};

// Get Job Details
export const getAdminJobDetails = async (jobId: string) => {
  try {
    const response = await adminApi.get(`/admin/jobs/${jobId}`);
    return {
      success: true,
      data: response.data.data as AdminJobDetails,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to get job details',
    };
  }
};

// Get All Conversations
export const getAdminConversations = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  try {
    const response = await adminApi.get('/admin/conversations', { params });
    return {
      success: true,
      data: response.data.data as AdminConversation[],
      pagination: response.data.pagination as Pagination,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to get conversations',
    };
  }
};

// Get Conversation Details
export const getAdminConversationDetails = async (conversationId: string) => {
  try {
    const response = await adminApi.get(`/admin/conversations/${conversationId}`);
    return {
      success: true,
      data: response.data.data as AdminConversationDetails,
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to get conversation details',
    };
  }
};

// Get System Settings
export const getAdminSystemSettings = async () => {
  try {
    const response = await adminApi.get('/admin/settings');
    return {
      success: true,
      data: response.data.data as AdminSystemSettings,
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to get system settings',
    };
  }
};

// Update System Settings
export const updateAdminSystemSettings = async (payload: {
  buyer_fee_bps?: number;
  vendor_fee_bps?: number;
  dispute_fee_bps?: number;
  reward_rate_bps?: number;
  reward_rate_per_1_e_18?: string;
  arbiter_address?: string;
  fee_recipient_address?: string;
}) => {
  try {
    const response = await adminApi.put('/admin/settings', payload);
    return {
      success: true,
      data: response.data.data as AdminSystemSettings,
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to update system settings',
    };
  }
};

// Resolve dispute (arbiter)
export const resolveDispute = async (job_milestone_id: string, favorBuyer: boolean, chainId: number) => {
  try {
    const response = await adminApi.post(`/contract/escrow/${job_milestone_id}/dispute/resolve`, { favorBuyer, chainId });
    return {
      success: true,
      data: response.data.data,
    };
  }
  catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to resolve dispute',
    };
  }
};