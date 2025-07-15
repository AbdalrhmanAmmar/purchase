import api from './api';

export interface Supplier {
  _id: string;
  supplierName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierData {
  supplierName: string;
}

export interface UpdateSupplierData {
  supplierName: string;
}

export interface SupplierTransaction {
  _id: string;
  type: 'purchase_order' | 'payment' | 'credit' | 'debit';
  description: string;
  amount: number;
  date: string;
  orderId?: string;
  purchaseOrderId?: string;
  reference?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface SupplierPurchaseOrder {
  _id: string;
  orderId: string;
  projectName: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received';
  totalAmount: number;
  paymentTerms: string;
  deliveryDate: string;
  createdAt: string;
}

export interface SupplierShipment {
  _id: string;
  orderId: string;
  purchaseOrderId: string;
  trackingNumber: string;
  shippingCompany: string;
  status: 'draft' | 'sent' | 'in_transit' | 'delivered';
  expectedDelivery: string;
  totalCost: number;
  createdAt: string;
}

export interface SupplierStatement {
  supplier: Supplier;
  totalPurchased: number;
  totalPaid: number;
  outstandingBalance: number;
  transactions: SupplierTransaction[];
  purchaseOrders: SupplierPurchaseOrder[];
  shipments: SupplierShipment[];
}

// Description: Get all suppliers
// Endpoint: GET /api/suppliers
// Request: {}
// Response: { suppliers: Supplier[] }
export const getSuppliers = async () => {
  try {
    const response = await api.get('/api/suppliers');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Create a new supplier
// Endpoint: POST /api/suppliers
// Request: CreateSupplierData
// Response: { supplier: Supplier, message: string }
export const createSupplier = async (data: CreateSupplierData) => {
  try {
    const response = await api.post('/api/suppliers', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get a single supplier by ID
// Endpoint: GET /api/suppliers/:id
// Request: {}
// Response: { supplier: Supplier }
export const getSupplierById = async (supplierId: string) => {
  try {
    const response = await api.get(`/api/suppliers/${supplierId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Update a supplier
// Endpoint: PUT /api/suppliers/:id
// Request: UpdateSupplierData
// Response: { supplier: Supplier, message: string }
export const updateSupplier = async (supplierId: string, data: UpdateSupplierData) => {
  try {
    const response = await api.put(`/api/suppliers/${supplierId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Delete a supplier
// Endpoint: DELETE /api/suppliers/:id
// Request: {}
// Response: { message: string }
export const deleteSupplier = async (supplierId: string) => {
  try {
    const response = await api.delete(`/api/suppliers/${supplierId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get supplier statement with transactions, purchase orders, and shipments
// Endpoint: GET /api/suppliers/:id/statement
// Request: {}
// Response: { statement: SupplierStatement }
export const getSupplierStatement = async (supplierId: string) => {
  try {
    const response = await api.get(`/api/suppliers/${supplierId}/statement`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};