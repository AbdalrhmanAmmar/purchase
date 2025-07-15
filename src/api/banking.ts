import api from './api';

export interface BankAccount {
  _id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'business';
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountData {
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'business';
  balance: number;
  currency: string;
}

export interface BankTransaction {
  _id: string;
  accountId: string;
  accountName: string;
  transactionType: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  balance: number;
  description: string;
  reference?: string;
  paymentMethod?: string;
  recipientName?: string;
  recipientAccount?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  category: 'customer_payment' | 'supplier_payment' | 'refund' | 'other';
  linkedOrderId?: string;
  linkedInvoiceId?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMoneyData {
  accountId: string;
  recipientType: 'customer' | 'supplier';
  recipientId: string;
  amount: number;
  description: string;
  reference?: string;
  paymentMethod: 'bank_transfer' | 'wire' | 'ach' | 'check';
  linkedOrderId?: string;
  linkedInvoiceId?: string;
}

export interface ReceiveMoneyData {
  accountId: string;
  customerId: string;
  amount: number;
  description: string;
  reference?: string;
  paymentMethod: 'bank_transfer' | 'wire' | 'ach' | 'check' | 'cash';
  linkedOrderId?: string;
  linkedInvoiceId?: string;
}

export interface CustomerBalance {
  _id: string;
  customerId: string;
  customerName: string;
  outstandingBalance: number;
  totalPaid: number;
  totalInvoiced: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

export interface SupplierBalance {
  _id: string;
  supplierId: string;
  supplierName: string;
  outstandingBalance: number;
  totalPaid: number;
  totalInvoiced: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

// Description: Get all bank accounts
// Endpoint: GET /api/banking/accounts
// Request: {}
// Response: { accounts: BankAccount[] }
export const getBankAccounts = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        accounts: [
          {
            _id: '1',
            accountName: 'Business Checking',
            accountNumber: '****1234',
            bankName: 'Chase Bank',
            accountType: 'business',
            balance: 125000,
            currency: 'USD',
            isActive: true,
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z'
          },
          {
            _id: '2',
            accountName: 'Business Savings',
            accountNumber: '****5678',
            bankName: 'Chase Bank',
            accountType: 'savings',
            balance: 75000,
            currency: 'USD',
            isActive: true,
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/banking/accounts');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create a new bank account
// Endpoint: POST /api/banking/accounts
// Request: CreateBankAccountData
// Response: { account: BankAccount, message: string }
export const createBankAccount = (data: CreateBankAccountData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        account: {
          _id: Date.now().toString(),
          ...data,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        message: 'Bank account created successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/banking/accounts', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get bank transactions for an account
// Endpoint: GET /api/banking/accounts/:accountId/transactions
// Request: { page?: number, limit?: number, type?: string, dateFrom?: string, dateTo?: string }
// Response: { transactions: BankTransaction[], total: number, page: number, totalPages: number }
export const getBankTransactions = (accountId: string, params?: { page?: number; limit?: number; type?: string; dateFrom?: string; dateTo?: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        transactions: [
          {
            _id: '1',
            accountId,
            accountName: 'Business Checking',
            transactionType: 'deposit',
            amount: 5000,
            balance: 125000,
            description: 'Payment received from Acme Corporation',
            reference: 'INV-001',
            paymentMethod: 'bank_transfer',
            recipientName: 'Acme Corporation',
            status: 'completed',
            category: 'customer_payment',
            linkedOrderId: '1',
            linkedInvoiceId: '1',
            transactionDate: '2024-01-20T10:00:00Z',
            createdAt: '2024-01-20T10:00:00Z',
            updatedAt: '2024-01-20T10:00:00Z'
          },
          {
            _id: '2',
            accountId,
            accountName: 'Business Checking',
            transactionType: 'withdrawal',
            amount: 2500,
            balance: 120000,
            description: 'Payment to Shanghai Industrial Co.',
            reference: 'PO-001',
            paymentMethod: 'wire',
            recipientName: 'Shanghai Industrial Co.',
            status: 'completed',
            category: 'supplier_payment',
            linkedOrderId: '1',
            transactionDate: '2024-01-19T14:30:00Z',
            createdAt: '2024-01-19T14:30:00Z',
            updatedAt: '2024-01-19T14:30:00Z'
          },
          {
            _id: '3',
            accountId,
            accountName: 'Business Checking',
            transactionType: 'deposit',
            amount: 3200,
            balance: 122500,
            description: 'Payment received from Global Tech Solutions',
            reference: 'INV-002',
            paymentMethod: 'ach',
            recipientName: 'Global Tech Solutions',
            status: 'completed',
            category: 'customer_payment',
            linkedOrderId: '2',
            linkedInvoiceId: '2',
            transactionDate: '2024-01-18T09:15:00Z',
            createdAt: '2024-01-18T09:15:00Z',
            updatedAt: '2024-01-18T09:15:00Z'
          }
        ],
        total: 3,
        page: 1,
        totalPages: 1
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/banking/accounts/${accountId}/transactions`, { params });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Send money to customer or supplier
// Endpoint: POST /api/banking/send-money
// Request: SendMoneyData
// Response: { transaction: BankTransaction, message: string }
export const sendMoney = (data: SendMoneyData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        transaction: {
          _id: Date.now().toString(),
          accountId: data.accountId,
          accountName: 'Business Checking',
          transactionType: 'withdrawal',
          amount: data.amount,
          balance: 125000 - data.amount,
          description: data.description,
          reference: data.reference,
          paymentMethod: data.paymentMethod,
          recipientName: data.recipientType === 'customer' ? 'Customer Name' : 'Supplier Name',
          status: 'pending',
          category: data.recipientType === 'customer' ? 'refund' : 'supplier_payment',
          linkedOrderId: data.linkedOrderId,
          linkedInvoiceId: data.linkedInvoiceId,
          transactionDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        message: 'Payment initiated successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/banking/send-money', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Record received money from customer
// Endpoint: POST /api/banking/receive-money
// Request: ReceiveMoneyData
// Response: { transaction: BankTransaction, customerBalance: CustomerBalance, message: string }
export const receiveMoney = (data: ReceiveMoneyData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        transaction: {
          _id: Date.now().toString(),
          accountId: data.accountId,
          accountName: 'Business Checking',
          transactionType: 'deposit',
          amount: data.amount,
          balance: 125000 + data.amount,
          description: data.description,
          reference: data.reference,
          paymentMethod: data.paymentMethod,
          recipientName: 'Customer Name',
          status: 'completed',
          category: 'customer_payment',
          linkedOrderId: data.linkedOrderId,
          linkedInvoiceId: data.linkedInvoiceId,
          transactionDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        customerBalance: {
          _id: '1',
          customerId: data.customerId,
          customerName: 'Customer Name',
          outstandingBalance: 5000 - data.amount,
          totalPaid: data.amount,
          totalInvoiced: 5000,
          lastPaymentDate: new Date().toISOString(),
          lastPaymentAmount: data.amount
        },
        message: 'Payment recorded successfully and customer balance updated'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/banking/receive-money', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get customer balances
// Endpoint: GET /api/banking/customer-balances
// Request: {}
// Response: { balances: CustomerBalance[] }
export const getCustomerBalances = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        balances: [
          {
            _id: '1',
            customerId: '1',
            customerName: 'Acme Corporation',
            outstandingBalance: 2500,
            totalPaid: 7500,
            totalInvoiced: 10000,
            lastPaymentDate: '2024-01-20T10:00:00Z',
            lastPaymentAmount: 5000
          },
          {
            _id: '2',
            customerId: '2',
            customerName: 'Global Tech Solutions',
            outstandingBalance: 1800,
            totalPaid: 3200,
            totalInvoiced: 5000,
            lastPaymentDate: '2024-01-18T09:15:00Z',
            lastPaymentAmount: 3200
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/banking/customer-balances');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get supplier balances
// Endpoint: GET /api/banking/supplier-balances
// Request: {}
// Response: { balances: SupplierBalance[] }
export const getSupplierBalances = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        balances: [
          {
            _id: '1',
            supplierId: '1',
            supplierName: 'Shanghai Industrial Co.',
            outstandingBalance: 0,
            totalPaid: 15000,
            totalInvoiced: 15000,
            lastPaymentDate: '2024-01-19T14:30:00Z',
            lastPaymentAmount: 2500
          },
          {
            _id: '2',
            supplierId: '2',
            supplierName: 'Guangzhou Electronics Ltd.',
            outstandingBalance: 3500,
            totalPaid: 8500,
            totalInvoiced: 12000,
            lastPaymentDate: '2024-01-15T11:20:00Z',
            lastPaymentAmount: 4000
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/banking/supplier-balances');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};