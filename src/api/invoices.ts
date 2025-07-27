import api from './api';

export interface InvoiceItem {
  _id?: string;
  itemCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  photo?: string;
}

export interface Invoice {
  _id: string;
  purchaseId: string;
  items: InvoiceItem[];
  subtotal: number;
  commissionFee: number;
  commissionRate: number;
  total: number;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partially_paid' | 'cancelled';
  amountPaid?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceData {
  purchaseId: string;
  items: InvoiceItem[];
  dueDate: string;
  paymentTerms?: string;
  commissionRate?: number;
}

// Description: Get invoices for a purchase order
// Endpoint: GET /api/purchase-orders/:purchaseId/invoices
export const getInvoicesByPurchaseId = async (purchaseId: string) => {
  try {
    const response = await api.get(`/api/purchase-orders/${purchaseId}/invoices`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Create a new invoice
// Endpoint: POST /api/invoices
export const createInvoice = async (data: CreateInvoiceData) => {
  try {
    // Calculate item totals
    const itemsWithTotals = data.items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    }));

    const response = await api.post('/api/invoices', {
      purchaseId: data.purchaseId,
      dueDate: data.dueDate,
      paymentTerms: data.paymentTerms || 'Net 30',
      items: itemsWithTotals,
      commissionRate: data.commissionRate
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Update an existing invoice
// Endpoint: PATCH /api/invoices/:invoiceId
export const updateInvoice = async (
  invoiceId: string,
  updatedData: Partial<Invoice>
) => {
  try {
    // Recalculate if items are being updated
    let itemsWithTotals = updatedData.items;
    if (updatedData.items) {
      itemsWithTotals = updatedData.items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice
      }));
    }

    const response = await api.patch(`/api/invoices/${invoiceId}`, {
      ...updatedData,
      ...(itemsWithTotals && { items: itemsWithTotals })
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Delete an invoice
// Endpoint: DELETE /api/invoices/:invoiceId
export const deleteInvoice = async (invoiceId: string) => {
  try {
    const response = await api.delete(`/api/invoices/${invoiceId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};