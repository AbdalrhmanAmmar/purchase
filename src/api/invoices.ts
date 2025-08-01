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
    const response = await api.get(`/api/invoices/${purchaseId}/`);
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
    // 1. التحقق من صحة invoiceId
    if (!invoiceId) {
      throw new Error('Invoice ID is required');
    }

    // 2. حساب القيم الجديدة إذا كانت العناصر متضمنة
    let finalData = { ...updatedData };
    
    if (updatedData.items) {
      const itemsWithTotals = updatedData.items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice
      }));

      const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);
      const commissionRate = updatedData.commissionRate || 5.5; // قيمة افتراضية
      const commissionFee = subtotal * (commissionRate / 100);
      const total = subtotal + commissionFee;

      finalData = {
        ...updatedData,
        items: itemsWithTotals,
        subtotal,
        commissionFee,
        total
      };
    }

    // 3. إرسال الطلب مع بيانات محدثة
    const response = await api.put(`/api/invoices/${invoiceId}`, finalData);

    // 4. التحقق من الاستجابة
    if (!response.data) {
      throw new Error('No data returned from server');
    }

    return response.data;

  } catch (error: any) {
    console.error('Error updating invoice:', {
      invoiceId,
      error: error.response?.data || error.message
    });
    throw new Error(error?.response?.data?.message || error.message || 'Failed to update invoice');
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