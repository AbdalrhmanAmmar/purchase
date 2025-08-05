// src/api/shipping.ts
import api from './api'; // Assuming you have an api instance configured

interface CreateShippingData {
  InvoiceId: string; // مطلوب في الباك إند
  shippingCompanyName: string; // مطلوب
  trackingNumber: string; // مطلوب
  expectedDelivery: string; // مطلوب (سيتم تحويله لتاريخ في الباك إند)
  freightCharges?: number;
  insurance?: number;
  handlingFees?: number;
  totalShippingCost: number; // مطلوب
  status?: string; // اختياري
  items: ShippingItem[]; // مطلوب
}

interface ShippingItem {
  description: string;
  quantity: number;
  photo?: string;
  weight?: number;
  volume?: number;
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
interface CreateShippingData {
  orderId: string; // أضف هذا الحقل
  InvoiceId: string;
  shippingCompanyName: string;
  trackingNumber: string;
  expectedDelivery: string;
  freightCharges?: number;
  insurance?: number;
  handlingFees?: number;
  totalShippingCost: number;
  status?: string;
  items: Array<{
    description: string;
    quantity: number;
    photo?: string;
    weight?: number;
    volume?: number;
    purchaseOrderId?: string; // إضافة إذا كنت تحتاجها
  }>;
}

export const createShippingInvoice = async (data: CreateShippingData) => {
  try {
    // التحقق من الحقول المطلوبة
    const requiredFields = [
      'orderId', // أضف orderId للحقول المطلوبة
      'InvoiceId',
      'shippingCompanyName',
      'trackingNumber',
      'expectedDelivery',
      'totalShippingCost',
      'items'
    ];
    
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // التحقق من صحة items
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('At least one item is required');
    }

    const response = await api.post('/api/shipping', {
      orderId: data.orderId, // أضف orderId هنا
      InvoiceId: data.InvoiceId,
      shippingCompanyName: data.shippingCompanyName,
      trackingNumber: data.trackingNumber,
      shippingMethod: data.shippingMethod || 'Ground', // قيمة افتراضية
      expectedDelivery: data.expectedDelivery,
      freightCharges: data.freightCharges || 0,
      insurance: data.insurance || 0,
      handlingFees: data.handlingFees || 0,
      totalShippingCost: data.totalShippingCost,
      paymentMethod: data.paymentMethod || 'client_direct', // قيمة افتراضية
      status: data.status || 'pending',
      items: data.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        photo: item.photo || '',
        weight: item.weight || 0,
        volume: item.volume || 0,
        purchaseOrderId: item.purchaseOrderId // إضافة إذا كنت تحتاجها
      }))
    });

    return response.data;
  } catch (error: any) {
    console.error('Error creating shipping invoice:', error);
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
    const response = await api.get('/api/shippingCompany');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Create new shipping company
// Endpoint: POST /api/shipping/companies
export const createShippingCompany = async (data: { name: string }) => {
  try {
    const response = await api.post('/api/shippingCompany', data);
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

export const getShippingInvoicesByOrderId = async (orderId: string) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const response = await api.get(`/api/shipping/${orderId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching shipping invoices by order ID:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};