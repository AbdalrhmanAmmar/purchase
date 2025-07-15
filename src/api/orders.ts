import api from './api';

export interface Order {
  _id: string;
  clientId: string;
  clientName: string;
  projectName: string;
  workflowType: 'fast-track' | 'standard';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  expectedDelivery: string;
  currency: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  commissionRate: number;
  requirements: string;
  specialInstructions?: string;
  isArchived: boolean;
  archivedAt?: string;
  archivedBy?: string;
  createdAt: string;
  updatedAt: string;
  // Workflow progress data
  hasPurchaseOrders?: boolean;
  hasInvoices?: boolean;
  hasShipping?: boolean;
  hasQuotations?: boolean;
}

export interface CreateOrderData {
  clientId: string;
  projectName: string;
  workflowType: 'fast-track' | 'standard';
  expectedDelivery: string;
  currency: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  commissionRate: number;
  requirements: string;
  specialInstructions?: string;
}

// Description: Get all orders with filtering and pagination
// Endpoint: GET /api/orders
// Request: { page?: number, limit?: number, status?: string, clientId?: string, includeArchived?: boolean }
// Response: { success: boolean, data: { orders: Order[], total: number, page: number, totalPages: number } }
export const getOrders = async (params?: { page?: number; limit?: number; status?: string; clientId?: string; includeArchived?: boolean }) => {
  try {
    const response = await api.get('/api/orders', { params });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get archived orders
// Endpoint: GET /api/orders/archived
// Request: { page?: number, limit?: number }
// Response: { success: boolean, data: { orders: Order[], total: number, page: number, totalPages: number } }
export const getArchivedOrders = async (params?: { page?: number; limit?: number }) => {
  try {
    const response = await api.get('/api/orders/archived', { params });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get order by ID with purchase orders
// Endpoint: GET /api/orders/:id
// Request: {}
// Response: { success: boolean, data: { order: Order } }
export const getOrderById = async (id: string) => {
  try {
    const response = await api.get(`/api/orders/${id}`);

    // Get stored purchase orders for this order from localStorage (for now)
    const storedPOs = localStorage.getItem(`purchaseOrders_${id}`)
    let purchaseOrders = storedPOs ? JSON.parse(storedPOs) : []

    // Process purchase orders to ensure numeric values
    purchaseOrders = purchaseOrders.map((po: any) => ({
      ...po,
      items: po.items.map((item: any) => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        total: Number(item.total) || 0
      })),
      totalAmount: Number(po.totalAmount) || 0
    }))

    return {
      order: response.data.data.order,
      purchaseOrders
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Create a new order
// Endpoint: POST /api/orders
// Request: CreateOrderData
// Response: { success: boolean, data: { order: Order }, message: string }
export const createOrder = async (data: CreateOrderData) => {
  try {
    const response = await api.post('/api/orders', data);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Update order status
// Endpoint: PUT /api/orders/:id/status
// Request: { status: string }
// Response: { success: boolean, data: { order: Order }, message: string }
export const updateOrderStatus = async (id: string, status: string) => {
  try {
    const response = await api.put(`/api/orders/${id}/status`, { status });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Archive order (soft delete)
// Endpoint: PUT /api/orders/:id/archive
// Request: {}
// Response: { success: boolean, message: string, data: { order: Order } }
export const archiveOrder = async (id: string) => {
  try {
    const response = await api.put(`/api/orders/${id}/archive`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Restore archived order
// Endpoint: PUT /api/orders/:id/restore
// Request: {}
// Response: { success: boolean, message: string, data: { order: Order } }
export const restoreOrder = async (id: string) => {
  try {
    const response = await api.put(`/api/orders/${id}/restore`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Delete order (permanent delete)
// Endpoint: DELETE /api/orders/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteOrder = async (id: string) => {
  try {
    const response = await api.delete(`/api/orders/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Update order
// Endpoint: PUT /api/orders/:id
// Request: Partial<CreateOrderData>
// Response: { success: boolean, data: { order: Order }, message: string }
export const updateOrder = async (id: string, data: Partial<CreateOrderData>) => {
  try {
    const response = await api.put(`/api/orders/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};