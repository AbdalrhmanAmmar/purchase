import api from './api';

export interface SeedResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Description: Seed admin user
// Endpoint: POST /api/seed/admin
// Request: {}
// Response: { success: boolean, message: string, data: User }
export const seedAdmin = async (): Promise<SeedResponse> => {
  try {
    const response = await api.post('/api/seed/admin');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Seed sample clients
// Endpoint: POST /api/seed/clients
// Request: {}
// Response: { success: boolean, message: string, data: Client[] | { count: number } }
export const seedClients = async (): Promise<SeedResponse> => {
  try {
    const response = await api.post('/api/seed/clients');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Seed sample suppliers
// Endpoint: POST /api/seed/suppliers
// Request: {}
// Response: { success: boolean, message: string, data: Supplier[] | { count: number } }
export const seedSuppliers = async (): Promise<SeedResponse> => {
  try {
    const response = await api.post('/api/seed/suppliers');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Seed sample orders
// Endpoint: POST /api/seed/orders
// Request: {}
// Response: { success: boolean, message: string, data: Order[] | { count: number } }
export const seedOrders = async (): Promise<SeedResponse> => {
  try {
    const response = await api.post('/api/seed/orders');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Seed all sample data
// Endpoint: POST /api/seed/all
// Request: {}
// Response: { success: boolean, message: string, data: { admin: any, clients: any, suppliers: any, orders: any } }
export const seedAll = async (): Promise<SeedResponse> => {
  try {
    const response = await api.post('/api/seed/all');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};