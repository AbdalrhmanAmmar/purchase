import api from './api';

export interface Account {
  _id: string;
  accountNumber: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  transactionNumber: string;
  date: string;
  description: string;
  reference?: string;
  entries: TransactionEntry[];
  totalAmount: number;
  status: 'draft' | 'posted' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionEntry {
  _id?: string;
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface CreateAccountData {
  accountNumber: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  description?: string;
}

export interface CreateTransactionData {
  date: string;
  description: string;
  reference?: string;
  entries: Omit<TransactionEntry, '_id' | 'accountName'>[];
}

export interface TrialBalance {
  accountId: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
}

export interface FinancialStatement {
  assets: {
    currentAssets: { accountName: string; balance: number }[];
    fixedAssets: { accountName: string; balance: number }[];
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: { accountName: string; balance: number }[];
    longTermLiabilities: { accountName: string; balance: number }[];
    totalLiabilities: number;
  };
  equity: {
    accounts: { accountName: string; balance: number }[];
    totalEquity: number;
  };
  revenue: {
    accounts: { accountName: string; balance: number }[];
    totalRevenue: number;
  };
  expenses: {
    accounts: { accountName: string; balance: number }[];
    totalExpenses: number;
  };
  netIncome: number;
}

// Description: Get all accounts
// Endpoint: GET /api/accounting/accounts
// Request: {}
// Response: { accounts: Account[] }
export const getAccounts = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        accounts: [
          {
            _id: '1',
            accountNumber: '1000',
            accountName: 'Cash',
            accountType: 'asset',
            balance: 50000,
            description: 'Company cash account',
            isActive: true,
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z'
          },
          {
            _id: '2',
            accountNumber: '1200',
            accountName: 'Accounts Receivable',
            accountType: 'asset',
            balance: 25000,
            description: 'Money owed by customers',
            isActive: true,
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z'
          },
          {
            _id: '3',
            accountNumber: '2000',
            accountName: 'Accounts Payable',
            accountType: 'liability',
            balance: 15000,
            description: 'Money owed to suppliers',
            isActive: true,
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z'
          },
          {
            _id: '4',
            accountNumber: '3000',
            accountName: 'Owner Equity',
            accountType: 'equity',
            balance: 60000,
            description: 'Owner investment',
            isActive: true,
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z'
          },
          {
            _id: '5',
            accountNumber: '4000',
            accountName: 'Commission Revenue',
            accountType: 'revenue',
            balance: 45000,
            description: 'Revenue from commissions',
            isActive: true,
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z'
          },
          {
            _id: '6',
            accountNumber: '5000',
            accountName: 'Operating Expenses',
            accountType: 'expense',
            balance: 12000,
            description: 'General operating expenses',
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
  //   return await api.get('/api/accounting/accounts');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create a new account
// Endpoint: POST /api/accounting/accounts
// Request: CreateAccountData
// Response: { account: Account, message: string }
export const createAccount = (data: CreateAccountData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        account: {
          _id: Date.now().toString(),
          ...data,
          balance: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        message: 'Account created successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/accounting/accounts', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get all transactions
// Endpoint: GET /api/accounting/transactions
// Request: {}
// Response: { transactions: Transaction[] }
export const getTransactions = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        transactions: [
          {
            _id: '1',
            transactionNumber: 'TXN-001',
            date: '2024-01-15',
            description: 'Commission received from Order #123',
            reference: 'ORDER-123',
            entries: [
              {
                _id: '1',
                accountId: '1',
                accountName: 'Cash',
                debit: 2500,
                credit: 0,
                description: 'Commission payment received'
              },
              {
                _id: '2',
                accountId: '5',
                accountName: 'Commission Revenue',
                debit: 0,
                credit: 2500,
                description: 'Commission earned'
              }
            ],
            totalAmount: 2500,
            status: 'posted',
            createdBy: 'user123',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          },
          {
            _id: '2',
            transactionNumber: 'TXN-002',
            date: '2024-01-16',
            description: 'Office rent payment',
            reference: 'RENT-JAN',
            entries: [
              {
                _id: '3',
                accountId: '6',
                accountName: 'Operating Expenses',
                debit: 1200,
                credit: 0,
                description: 'Monthly office rent'
              },
              {
                _id: '4',
                accountId: '1',
                accountName: 'Cash',
                debit: 0,
                credit: 1200,
                description: 'Rent payment'
              }
            ],
            totalAmount: 1200,
            status: 'posted',
            createdBy: 'user123',
            createdAt: '2024-01-16T10:00:00Z',
            updatedAt: '2024-01-16T10:00:00Z'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/accounting/transactions');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create a new transaction
// Endpoint: POST /api/accounting/transactions
// Request: CreateTransactionData
// Response: { transaction: Transaction, message: string }
export const createTransaction = (data: CreateTransactionData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const totalAmount = data.entries.reduce((sum, entry) => sum + Math.max(entry.debit, entry.credit), 0);
      
      resolve({
        transaction: {
          _id: Date.now().toString(),
          transactionNumber: `TXN-${Date.now().toString().slice(-6)}`,
          ...data,
          entries: data.entries.map((entry, index) => ({
            _id: (Date.now() + index).toString(),
            ...entry,
            accountName: 'Account Name' // This would be populated from the account lookup
          })),
          totalAmount,
          status: 'posted',
          createdBy: 'user123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        message: 'Transaction created successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/accounting/transactions', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get trial balance
// Endpoint: GET /api/accounting/trial-balance
// Request: {}
// Response: { trialBalance: TrialBalance[] }
export const getTrialBalance = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        trialBalance: [
          {
            accountId: '1',
            accountNumber: '1000',
            accountName: 'Cash',
            accountType: 'asset',
            debitBalance: 50000,
            creditBalance: 0
          },
          {
            accountId: '2',
            accountNumber: '1200',
            accountName: 'Accounts Receivable',
            accountType: 'asset',
            debitBalance: 25000,
            creditBalance: 0
          },
          {
            accountId: '3',
            accountNumber: '2000',
            accountName: 'Accounts Payable',
            accountType: 'liability',
            debitBalance: 0,
            creditBalance: 15000
          },
          {
            accountId: '4',
            accountNumber: '3000',
            accountName: 'Owner Equity',
            accountType: 'equity',
            debitBalance: 0,
            creditBalance: 60000
          },
          {
            accountId: '5',
            accountNumber: '4000',
            accountName: 'Commission Revenue',
            accountType: 'revenue',
            debitBalance: 0,
            creditBalance: 45000
          },
          {
            accountId: '6',
            accountNumber: '5000',
            accountName: 'Operating Expenses',
            accountType: 'expense',
            debitBalance: 12000,
            creditBalance: 0
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/accounting/trial-balance');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get financial statements
// Endpoint: GET /api/accounting/financial-statements
// Request: {}
// Response: { statements: FinancialStatement }
export const getFinancialStatements = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        statements: {
          assets: {
            currentAssets: [
              { accountName: 'Cash', balance: 50000 },
              { accountName: 'Accounts Receivable', balance: 25000 }
            ],
            fixedAssets: [],
            totalAssets: 75000
          },
          liabilities: {
            currentLiabilities: [
              { accountName: 'Accounts Payable', balance: 15000 }
            ],
            longTermLiabilities: [],
            totalLiabilities: 15000
          },
          equity: {
            accounts: [
              { accountName: 'Owner Equity', balance: 60000 }
            ],
            totalEquity: 60000
          },
          revenue: {
            accounts: [
              { accountName: 'Commission Revenue', balance: 45000 }
            ],
            totalRevenue: 45000
          },
          expenses: {
            accounts: [
              { accountName: 'Operating Expenses', balance: 12000 }
            ],
            totalExpenses: 12000
          },
          netIncome: 33000
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/accounting/financial-statements');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};