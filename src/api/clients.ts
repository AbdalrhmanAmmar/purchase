import api from './api';

export interface Client {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
}

export interface UpdateClientData {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  country?: string;
}

export interface CustomerTransaction {
  _id: string;
  type: 'invoice' | 'payment' | 'credit' | 'debit';
  description: string;
  amount: number;
  date: string;
  orderId?: string;
  invoiceId?: string;
  reference?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface CustomerOrder {
  _id: string;
  projectName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  totalAmount: number;
  commissionRate: number;
  expectedDelivery: string;
  createdAt: string;
}

export interface CustomerShipment {
  _id: string;
  orderId: string;
  trackingNumber: string;
  shippingCompany: string;
  status: 'draft' | 'sent' | 'in_transit' | 'delivered';
  expectedDelivery: string;
  totalCost: number;
  createdAt: string;
}

export interface CustomerStatement {
  client: Client;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  transactions: CustomerTransaction[];
  orders: CustomerOrder[];
  shipments: CustomerShipment[];
}

// Description: Get all clients
// Endpoint: GET /api/clients
// Request: {}
// Response: { success: boolean, clients: Client[] }
export const getClients = async () => {
  try {
    const response = await api.get('/api/clients');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Create a new client
// Endpoint: POST /api/clients
// Request: CreateClientData
// Response: { success: boolean, client: Client, message: string }
export const createClient = async (data: CreateClientData) => {
  try {
    const response = await api.post('/api/clients', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get client by ID
// Endpoint: GET /api/clients/:id
// Request: {}
// Response: { success: boolean, client: Client }
export const getClientById = async (clientId: string) => {
  try {
    const response = await api.get(`/api/clients/${clientId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Update client
// Endpoint: PUT /api/clients/:id
// Request: UpdateClientData
// Response: { success: boolean, client: Client, message: string }
export const updateClient = async (clientId: string, data: UpdateClientData) => {
  try {
    const response = await api.put(`/api/clients/${clientId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Delete client
// Endpoint: DELETE /api/clients/:id
// Request: {}
// Response: { success: boolean, message: string, client: Client }
export const deleteClient = async (clientId: string) => {
  try {
    const response = await api.delete(`/api/clients/${clientId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get customer statement with transactions, orders, and shipments
// Endpoint: GET /api/clients/:id/statement
// Request: {}
// Response: { success: boolean, statement: CustomerStatement }
export const getCustomerStatement = async (clientId: string) => {
  try {
    const response = await api.get(`/api/clients/${clientId}/statement`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};