// src/api/shipping.ts
import api from './api'; // Assuming you have an api instance configured

interface CreateShippingData {
  orderId: string;
  shippingCompanyName: string;
  trackingNumber: string;
  expectedDelivery: string;
  totalShippingCost: number;
  items: ShippingItem[];
}

interface ShippingItem {
  itemId: string;
  description: string;
  quantity: number;
  weight: number;
  volume: number;
}

interface UpdateShippingData {
  shippingCompanyName?: string;
  trackingNumber?: string;
  expectedDelivery?: string;
  totalShippingCost?: number;
  status?: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}

// Description: Get shipping invoice by ID
// Endpoint: GET /api/shipping/:id
export const getShippingInvoice = async (id: string) => {
  try {
    const response = await api.get(`/api/shipping/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Create a new shipping invoice
// Endpoint: POST /api/shipping
export const createShippingInvoice = async (data: CreateShippingData) => {
  try {
    // Calculate total shipping cost if not provided
    const totalCost = data.totalShippingCost || calculateDefaultShippingCost(data.items);
    
    const response = await api.post('/api/shipping', {
      orderId: data.orderId,
      shippingCompanyName: data.shippingCompanyName,
      trackingNumber: data.trackingNumber,
      expectedDelivery: data.expectedDelivery,
      totalShippingCost: totalCost,
      items: data.items
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Update shipping invoice
// Endpoint: PUT /api/shipping/:id
export const updateShippingInvoice = async (id: string, data: UpdateShippingData) => {
  try {
    const response = await api.put(`/api/shipping/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get all shipping companies
// Endpoint: GET /api/shipping/companies
export const getShippingCompanies = async () => {
  try {
    const response = await api.get('/api/shipping/companies');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Create new shipping company
// Endpoint: POST /api/shipping/companies
export const createShippingCompany = async (data: { name: string }) => {
  try {
    const response = await api.post('/api/shipping/companies', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Helper function to calculate default shipping cost based on items
function calculateDefaultShippingCost(items: ShippingItem[]): number {
  // Simple calculation based on weight and volume
  return items.reduce((total, item) => {
    const weightCost = item.weight * 0.5; // $0.5 per kg
    const volumeCost = item.volume * 100; // $100 per m³
    return total + Math.max(weightCost, volumeCost);
  }, 0);
}