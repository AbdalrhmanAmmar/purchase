import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCustomerStatement, CustomerStatement } from "@/api/clients"
import { useToast } from "@/hooks/useToast"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  ShoppingCart,
  Truck,
  Eye,
  Calendar,
  CreditCard,
  Receipt
} from "lucide-react"

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const [statement, setStatement] = useState<CustomerStatement | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCustomerStatement = async () => {
      if (!id) return

      try {
        console.log('Fetching customer statement...')
        const response = await getCustomerStatement(id) as { statement: CustomerStatement }
        setStatement(response.statement)
        console.log('Customer statement loaded successfully')
      } catch (error) {
        console.error('Error fetching customer statement:', error)
        toast({
          title: "Error",
          description: "Failed to load customer statement",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerStatement()
  }, [id, toast])

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      sent: 'bg-blue-100 text-blue-800 border-blue-200',
      in_transit: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200'
    }
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <FileText className="w-4 h-4 text-blue-600" />
      case 'payment':
        return <CreditCard className="w-4 h-4 text-green-600" />
      case 'credit':
        return <TrendingDown className="w-4 h-4 text-green-600" />
      case 'debit':
        return <TrendingUp className="w-4 h-4 text-red-600" />
      default:
        return <Receipt className="w-4 h-4 text-slate-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!statement) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/clients')} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Customer Not Found</h1>
        </div>
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Customer not found</h3>
            <p className="text-slate-600 mb-4">The requested customer could not be found.</p>
            <Button onClick={() => navigate('/clients')} className="bg-gradient-to-r from-blue-500 to-indigo-600">
              Back to Clients
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/clients')} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{statement.client.companyName}</h1>
          <p className="text-slate-600 dark:text-slate-400">Customer Statement & Account Overview</p>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl text-slate-900">{statement.client.companyName}</CardTitle>
              <CardDescription className="text-lg">{statement.client.contactPerson}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statement.client.email && (
            <div className="flex items-center space-x-2 text-slate-600">
              <Mail className="w-4 h-4" />
              <span>{statement.client.email}</span>
            </div>
          )}
          {statement.client.phone && (
            <div className="flex items-center space-x-2 text-slate-600">
              <Phone className="w-4 h-4" />
              <span>{statement.client.phone}</span>
            </div>
          )}
          {statement.client.country && (
            <div className="flex items-center space-x-2 text-slate-600">
              <Globe className="w-4 h-4" />
              <span>{statement.client.country}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Invoiced</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${statement.totalInvoiced.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${statement.totalPaid.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Received payments</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Outstanding Balance</CardTitle>
            <DollarSign className={`h-4 w-4 ${statement.outstandingBalance > 0 ? 'text-red-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${statement.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${Math.abs(statement.outstandingBalance).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {statement.outstandingBalance > 0 ? 'Amount due' : 'Credit balance'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {statement.orders.filter(order => order.status !== 'completed' && order.status !== 'cancelled').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-slate-900">Transaction History</CardTitle>
              <CardDescription>All financial transactions for this customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement.transactions.map((transaction) => (
                      <TableRow key={transaction._id} className="hover:bg-slate-50/50">
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                        <TableCell>{transaction.reference || '-'}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          transaction.amount > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(transaction.status)}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-slate-900">Customer Orders</CardTitle>
              <CardDescription>All orders placed by this customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement.orders.map((order) => (
                      <TableRow key={order._id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">#{order._id}</TableCell>
                        <TableCell>{order.projectName}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(order.status)}>
                            {order.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${order.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>{order.commissionRate}%</TableCell>
                        <TableCell>{new Date(order.expectedDelivery).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/orders/${order._id}`)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-slate-900">Customer Shipments</CardTitle>
              <CardDescription>All shipments for this customer's orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Tracking Number</TableHead>
                      <TableHead>Shipping Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement.shipments.map((shipment) => (
                      <TableRow key={shipment._id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">#{shipment._id}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-blue-600 hover:text-blue-700"
                            onClick={() => navigate(`/orders/${shipment.orderId}`)}
                          >
                            #{shipment.orderId}
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{shipment.trackingNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Truck className="w-4 h-4 text-slate-500" />
                            <span>{shipment.shippingCompany}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(shipment.status)}>
                            {shipment.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span>{new Date(shipment.expectedDelivery).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${shipment.totalCost.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}