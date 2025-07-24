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
  orderId: string;
  clientId: string;
  clientName: string;
  items: InvoiceItem[];
  subtotal: number;
  commissionFee: number;
  commissionRate: number;
  total: number;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceData {
  orderId: string;
  items: InvoiceItem[];
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
}

// Description: Get invoices for an order
// Endpoint: GET /api/orders/:orderId/invoices
// Request: {}
// Response: { invoices: Invoice[] }
export const getInvoicesByOrderId = (orderId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedInvoices = localStorage.getItem(`invoices_${orderId}`)
      let invoices = storedInvoices ? JSON.parse(storedInvoices) : []

      // Process invoices to ensure numeric values
      invoices = invoices.map((invoice: any) => ({
        ...invoice,
        items: invoice.items.map((item: any) => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          total: Number(item.total) || 0
        })),
        subtotal: Number(invoice.subtotal) || 0,
        commissionFee: Number(invoice.commissionFee) || 0,
        commissionRate: Number(invoice.commissionRate) || 0,
        total: Number(invoice.total) || 0
      }))

      resolve({
        invoices
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/orders/${orderId}/invoices`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create a new invoice
// Endpoint: POST /api/invoices
// Request: CreateInvoiceData
// Response: { invoice: Invoice, message: string }
export const createInvoice = (data: CreateInvoiceData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      // Ensure all numeric values are properly converted
      const processedItems = data.items.map(item => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        total: Number(item.total) || 0
      }));

      const subtotal = processedItems.reduce((sum, item) => sum + Number(item.total), 0);
      const commissionRate = 5.5; // This should come from the order
      const commissionFee = subtotal * (commissionRate / 100);
      const total = subtotal + commissionFee;

      const newInvoice = {
        _id: Date.now().toString(),
        ...data,
        items: processedItems,
        clientId: '1',
        clientName: 'Acme Corporation',
        subtotal,
        commissionFee,
        commissionRate,
        total,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store the invoice in localStorage for the specific order
      const existingInvoices = localStorage.getItem(`invoices_${data.orderId}`)
      const invoices = existingInvoices ? JSON.parse(existingInvoices) : []
      invoices.push(newInvoice)
      localStorage.setItem(`invoices_${data.orderId}`, JSON.stringify(invoices))

      resolve({
        invoice: newInvoice,
        message: 'Invoice created successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/invoices', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

export const updateInvoice = (orderId: string, invoiceId: string, updatedData: Partial<Invoice>) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const storedInvoices = localStorage.getItem(`invoices_${orderId}`);
      if (!storedInvoices) return reject(new Error("No invoices found for this order"));

      let invoices: Invoice[] = JSON.parse(storedInvoices);

      const index = invoices.findIndex(inv => inv._id === invoiceId);
      if (index === -1) return reject(new Error("Invoice not found"));

      const oldInvoice = invoices[index];
      const updatedItems = updatedData.items || oldInvoice.items;

      // Recalculate totals if items changed
      const processedItems = updatedItems.map(item => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        total: Number(item.total) || 0,
      }));

      const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
      const commissionRate = oldInvoice.commissionRate || 5.5;
      const commissionFee = subtotal * (commissionRate / 100);
      const total = subtotal + commissionFee;

      const updatedInvoice: Invoice = {
        ...oldInvoice,
        ...updatedData,
        items: processedItems,
        subtotal,
        commissionFee,
        commissionRate,
        total,
        updatedAt: new Date().toISOString()
      };

      invoices[index] = updatedInvoice;
      localStorage.setItem(`invoices_${orderId}`, JSON.stringify(invoices));

      resolve({
        invoice: updatedInvoice,
        message: "Invoice updated successfully"
      });
    }, 500);
  });
};