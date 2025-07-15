import api from './api';

export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
  createdAt: string;
  lastLoginAt: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role?: 'admin' | 'user';
  name?: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface GetUserResponse {
  success: boolean;
  data: User;
}

// Description: Create a new user with role
// Endpoint: POST /api/users
// Request: { email: string, password: string, role?: 'admin' | 'user', name?: string }
// Response: { success: boolean, message: string, data: User }
export const createUser = async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
  try {
    const response = await api.post('/api/users', userData);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get user details by ID
// Endpoint: GET /api/users/{id}
// Request: {}
// Response: { success: boolean, data: User }
export const getUserById = async (id: string): Promise<GetUserResponse> => {
  try {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};