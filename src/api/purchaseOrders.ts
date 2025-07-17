import api from './api';

export interface PurchaseOrderItem {
  _id?: string;
  itemCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  photo?: string;
}

export interface PurchaseOrderPayment {
  _id?: string;
  paymentType: 'advance' | 'down_payment' | 'full_payment';
  amount: number;
  paymentDate: string;
  paymentMethod: 'bank_transfer' | 'wire' | 'ach' | 'check' | 'cash';
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
}

export interface PurchaseOrder {
  _id: string;
  orderId: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  paymentTerms: string;
  deliveryDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  payments: PurchaseOrderPayment[];
  status: 'draft' | 'sent' | 'confirmed' | 'received';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderData {
  orderId: string;
  supplierId: string;
  items: PurchaseOrderItem[];
  paymentTerms: string;
  deliveryDate: string;
  payment?: {
    paymentType: 'advance' | 'down_payment';
    amount: number;
    paymentMethod: 'bank_transfer' | 'wire' | 'ach' | 'check' | 'cash';
    reference?: string;
    description?: string;
  };
}

export interface CreatePurchaseOrderPaymentData {
  purchaseOrderId: string;
  paymentType: 'advance' | 'down_payment' | 'full_payment';
  amount: number;
  paymentMethod: 'bank_transfer' | 'wire' | 'ach' | 'check' | 'cash';
  reference?: string;
  description?: string;
}

// Description: Get purchase orders for an order
// Endpoint: GET /api/orders/:orderId/purchase-orders
// Request: {}
// Response: { success: boolean, data: { purchaseOrders: PurchaseOrder[] } }
export const getPurchaseOrdersByOrderId = async (orderId: string) => {
  try {
    const response = await api.get(`/api/orders/${orderId}/purchase-orders`);
    
    console.log('Raw API Response:', response); // لفحص هيكل البيانات الكامل
    
    // الحل الأكثر أماناً للتعامل مع مختلف هياكل البيانات
    let purchaseOrders = [];
    
    if (Array.isArray(response.data)) {
      // إذا كانت البيانات مصفوفة مباشرة
      purchaseOrders = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      // إذا كانت البيانات داخل خاصية data
      purchaseOrders = response.data.data;
    } else if (response.data.purchaseOrders && Array.isArray(response.data.purchaseOrders)) {
      // إذا كانت البيانات داخل خاصية purchaseOrders
      purchaseOrders = response.data.purchaseOrders;
    } else if (response.data) {
      // إذا كانت البيانات كائن مفرد (نحوله لمصفوفة)
      purchaseOrders = [response.data];
    }
    
    return { 
      success: true,
      purchaseOrders: purchaseOrders || [] // تأكد من عدم إرجاع undefined
    };
    
  } catch (error: any) {
    console.error('Error fetching purchase orders:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch purchase orders');
  }
};

// Description: Get all purchase orders with pagination and filtering
// Endpoint: GET /api/purchase-orders
// Request: { page?: number, limit?: number, status?: string, supplierId?: string, orderId?: string }
// Response: { success: boolean, data: { purchaseOrders: PurchaseOrder[], total: number, page: number, totalPages: number, hasNext: boolean, hasPrev: boolean } }
export const getPurchaseOrders = async (filters: {
  page?: number;
  limit?: number;
  status?: string;
  supplierId?: string;
  orderId?: string;
} = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.supplierId) params.append('supplierId', filters.supplierId);
    if (filters.orderId) params.append('orderId', filters.orderId);

    const response = await api.get(`/api/purchase-orders?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get single purchase order by ID
// Endpoint: GET /api/purchase-orders/:id
// Request: {}
// Response: { success: boolean, data: { purchaseOrder: PurchaseOrder } }


// Description: Create a new purchase order
// Endpoint: POST /api/purchase-orders
// Request: CreatePurchaseOrderData
// Response: { success: boolean, message: string, data: { purchaseOrder: PurchaseOrder } }
export const createPurchaseOrder = async (data: CreatePurchaseOrderData) => {
  try {
    const response = await api.post('/api/purchase-orders', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating purchase order:', error.response?.data || error.message);
    throw error;
  }
};
// Description: Update purchase order
// Endpoint: PUT /api/purchase-orders/:id
// Request: Partial<CreatePurchaseOrderData>
// Response: { success: boolean, message: string, data: { purchaseOrder: PurchaseOrder } }
export const updatePurchaseOrder = async (purchaseOrderId: string, data: Partial<CreatePurchaseOrderData>) => {
  try {
    const response = await api.put(`/api/purchase-orders/${purchaseOrderId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Update purchase order status
// Endpoint: PUT /api/purchase-orders/:id/status
// Request: { status: string }
// Response: { success: boolean, message: string, data: { purchaseOrder: PurchaseOrder } }
export const updatePurchaseOrderStatus = async (purchaseOrderId: string, status: string) => {
  try {
    const response = await api.put(`/api/purchase-orders/${purchaseOrderId}/status`, { status });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Delete purchase order
// Endpoint: DELETE /api/purchase-orders/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deletePurchaseOrder = async (purchaseOrderId: string) => {
  try {
    const response = await api.delete(`/api/purchase-orders/${purchaseOrderId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Create a payment for a purchase order
// Endpoint: POST /api/purchase-orders/:id/payments
// Request: CreatePurchaseOrderPaymentData
// Response: { success: boolean, message: string, data: { payment: PurchaseOrderPayment, purchaseOrder: PurchaseOrder } }
export const createPurchaseOrderPayment = async (data: CreatePurchaseOrderPaymentData) => {
  try {
    const response = await api.post(`/api/purchase-orders/${data.purchaseOrderId}/payments`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};