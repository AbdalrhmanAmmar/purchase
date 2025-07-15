import api from './api';

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  monthlyRevenue: number;
  monthlyCosts: number;
  monthlyProfit: number;
  totalCommissions: number;
  recentActivities: Activity[];
  orderStatusData: { name: string; value: number; color: string }[];
  monthlyData: { month: string; revenue: number; costs: number; profit: number }[];
}

export interface Activity {
  _id: string;
  type: string;
  description: string;
  timestamp: string;
  orderId?: string;
}

// Description: Get dashboard statistics and data
// Endpoint: GET /api/dashboard/stats
// Request: {}
// Response: DashboardStats
export const getDashboardStats = () => {
  // Mocking the response
  return new Promise<DashboardStats>((resolve) => {
    setTimeout(() => {
      resolve({
        totalOrders: 156,
        pendingOrders: 23,
        inProgressOrders: 45,
        completedOrders: 88,
        monthlyRevenue: 245000,
        monthlyCosts: 198000,
        monthlyProfit: 47000,
        totalCommissions: 12250,
        recentActivities: [
          {
            _id: '1',
            type: 'order_created',
            description: 'New order created for Acme Corporation',
            timestamp: '2024-01-20T10:30:00Z',
            orderId: '1'
          },
          {
            _id: '2',
            type: 'invoice_generated',
            description: 'Sales invoice generated for Global Tech Solutions',
            timestamp: '2024-01-20T09:15:00Z',
            orderId: '2'
          },
          {
            _id: '3',
            type: 'order_completed',
            description: 'Order completed for Manufacturing Plus',
            timestamp: '2024-01-19T16:45:00Z',
            orderId: '3'
          },
          {
            _id: '4',
            type: 'purchase_order_created',
            description: 'Purchase order created for supplier Shanghai Industrial Co.',
            timestamp: '2024-01-19T14:20:00Z'
          },
          {
            _id: '5',
            type: 'client_added',
            description: 'New client added: Tech Innovations Ltd.',
            timestamp: '2024-01-19T11:10:00Z'
          }
        ],
        orderStatusData: [
          { name: 'Pending', value: 23, color: '#f59e0b' },
          { name: 'In Progress', value: 45, color: '#3b82f6' },
          { name: 'Completed', value: 88, color: '#10b981' }
        ],
        monthlyData: [
          { month: 'Jan', revenue: 245000, costs: 198000, profit: 47000 },
          { month: 'Dec', revenue: 220000, costs: 185000, profit: 35000 },
          { month: 'Nov', revenue: 198000, costs: 165000, profit: 33000 },
          { month: 'Oct', revenue: 175000, costs: 145000, profit: 30000 },
          { month: 'Sep', revenue: 165000, costs: 140000, profit: 25000 },
          { month: 'Aug', revenue: 155000, costs: 130000, profit: 25000 }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/dashboard/stats');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};