import api from './api';

export interface ShippingItem {
  _id?: string;
  itemCode?: string;
  description: string;
  quantity: number;
  weight?: number;
  volume?: number;
  photo?: string;
}

export interface ShippingCompany {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingInvoice {
  _id: string;
  orderId: string;
  clientId: string;
  clientName: string;
  shippingCompanyId: string;
  shippingCompanyName: string;
  trackingNumber: string;
  shippingMethod: string;
  expectedDelivery: string;
  items: ShippingItem[];
  freightCharges: number;
  insurance: number;
  handlingFees: number;
  totalShippingCost: number;
  paymentMethod: 'client_direct' | 'agency_bills' | 'agency_markup' | 'prepaid_reimbursed';
  status: 'draft' | 'sent' | 'in_transit' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingInvoiceData {
  orderId: string;
  shippingCompanyId: string;
  trackingNumber: string;
  shippingMethod: string;
  expectedDelivery: string;
  items: ShippingItem[];
  freightCharges: number;
  insurance: number;
  handlingFees: number;
  paymentMethod: 'client_direct' | 'agency_bills' | 'agency_markup' | 'prepaid_reimbursed';
}

export interface CreateShippingCompanyData {
  name: string;
}

// Description: Get shipping companies
// Endpoint: GET /api/shipping/companies
// Request: {}
// Response: { companies: ShippingCompany[] }
export const getShippingCompanies = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        companies: [
          {
            _id: '1',
            name: 'DHL Express',
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z'
          },
          {
            _id: '2',
            name: 'FedEx International',
            createdAt: '2024-01-02T11:00:00Z',
            updatedAt: '2024-01-02T11:00:00Z'
          },
          {
            _id: '3',
            name: 'UPS Worldwide',
            createdAt: '2024-01-03T12:00:00Z',
            updatedAt: '2024-01-03T12:00:00Z'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/shipping/companies');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create a new shipping company
// Endpoint: POST /api/shipping/companies
// Request: CreateShippingCompanyData
// Response: { company: ShippingCompany, message: string }
export const createShippingCompany = (data: CreateShippingCompanyData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        company: {
          _id: Date.now().toString(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        message: 'Shipping company created successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/shipping/companies', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get shipping invoices for an order
// Endpoint: GET /api/orders/:orderId/shipping
// Request: {}
// Response: { shippingInvoices: ShippingInvoice[] }
export const getShippingInvoicesByOrderId = (orderId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedShipping = localStorage.getItem(`shipping_${orderId}`)
      let shippingInvoices = storedShipping ? JSON.parse(storedShipping) : []

      // Process shipping invoices to ensure numeric values
      shippingInvoices = shippingInvoices.map((shipping: any) => ({
        ...shipping,
        items: shipping.items.map((item: any) => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          weight: Number(item.weight) || 0,
          volume: Number(item.volume) || 0
        })),
        freightCharges: Number(shipping.freightCharges) || 0,
        insurance: Number(shipping.insurance) || 0,
        handlingFees: Number(shipping.handlingFees) || 0,
        totalShippingCost: Number(shipping.totalShippingCost) || 0
      }))

      resolve({
        shippingInvoices
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/orders/${orderId}/shipping`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create a new shipping invoice
// Endpoint: POST /api/shipping/invoices
// Request: CreateShippingInvoiceData
// Response: { shippingInvoice: ShippingInvoice, message: string }
export const createShippingInvoice = (data: CreateShippingInvoiceData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      // Ensure all numeric values are properly converted
      const processedItems = data.items.map(item => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        weight: Number(item.weight) || 0,
        volume: Number(item.volume) || 0
      }));

      const totalShippingCost = Number(data.freightCharges) + Number(data.insurance) + Number(data.handlingFees);

      const newShippingInvoice = {
        _id: Date.now().toString(),
        ...data,
        items: processedItems,
        clientId: '1',
        clientName: 'Acme Corporation',
        shippingCompanyName: 'DHL Express',
        totalShippingCost,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store the shipping invoice in localStorage for the specific order
      const existingShipping = localStorage.getItem(`shipping_${data.orderId}`)
      const shippingInvoices = existingShipping ? JSON.parse(existingShipping) : []
      shippingInvoices.push(newShippingInvoice)
      localStorage.setItem(`shipping_${data.orderId}`, JSON.stringify(shippingInvoices))

      resolve({
        shippingInvoice: newShippingInvoice,
        message: 'Shipping invoice created successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/shipping/invoices', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};