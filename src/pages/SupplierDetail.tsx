import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { getSupplierStatement, deleteSupplier, SupplierStatement } from "@/api/suppliers"
import { useToast } from "@/hooks/useToast"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Factory,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  ShoppingCart,
  Truck,
  Eye,
  Calendar,
  CreditCard,
  Receipt,
  Search,
  Filter,
  Trash2
} from "lucide-react"

export function SupplierDetail() {
  const { id } = useParams<{ id: string }>()
  const [statement, setStatement] = useState<SupplierStatement | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSupplierStatement = async () => {
      if (!id) return

      try {
        console.log('Fetching supplier statement...')
        const response = await getSupplierStatement(id) as { statement: SupplierStatement }
        setStatement(response.statement)
        console.log('Supplier statement loaded successfully')
      } catch (error) {
        console.error('Error fetching supplier statement:', error)
        toast({
          title: "Error",
          description: "Failed to load supplier statement",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSupplierStatement()
  }, [id, toast])

  const handleDeleteSupplier = async () => {
    if (!id || !statement) return

    setDeleting(true)
    try {
      console.log('Deleting supplier...')
      await deleteSupplier(id)
      console.log('Supplier deleted successfully')
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      })
      navigate('/suppliers')
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      received: 'bg-green-100 text-green-800 border-green-200',
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
      case 'purchase_order':
        return <ShoppingCart className="w-4 h-4 text-blue-600" />
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

  const filteredTransactions = statement?.transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || transaction.type === filterType
    return matchesSearch && matchesType
  }) || []

  const filteredPurchaseOrders = statement?.purchaseOrders.filter(po => {
    const matchesSearch = po.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po._id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  }) || []

  const filteredShipments = statement?.shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.shippingCompany.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  }) || []

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
          <Button variant="ghost" onClick={() => navigate('/suppliers')} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Supplier Not Found</h1>
        </div>
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardContent className="text-center py-12">
            <Factory className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Supplier not found</h3>
            <p className="text-slate-600 mb-4">The requested supplier could not be found.</p>
            <Button onClick={() => navigate('/suppliers')} className="bg-gradient-to-r from-blue-500 to-indigo-600">
              Back to Suppliers
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/suppliers')} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{statement.supplier.supplierName}</h1>
            <p className="text-slate-600 dark:text-slate-400">Supplier Statement & Account Overview</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={deleting}>
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white/95 backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{statement.supplier.supplierName}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSupplier}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Supplier Info Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Factory className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl text-slate-900">{statement.supplier.supplierName}</CardTitle>
              <CardDescription className="text-lg">Supplier Account</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Purchased</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${statement.totalPurchased.toLocaleString()}</div>
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
            <p className="text-xs text-slate-500 mt-1">Payments made</p>
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
              {statement.outstandingBalance > 0 ? 'Amount owed' : 'Credit balance'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Orders</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {statement.purchaseOrders.filter(po => po.status !== 'received' && po.status !== 'cancelled').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search transactions, orders, or shipments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions ({filteredTransactions.length})</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders ({filteredPurchaseOrders.length})</TabsTrigger>
          <TabsTrigger value="shipments">Shipments ({filteredShipments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-slate-900">Transaction History</CardTitle>
              <CardDescription>All financial transactions with this supplier</CardDescription>
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
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction._id} className="hover:bg-slate-50/50">
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
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
              <CardTitle className="text-slate-900">Purchase Orders</CardTitle>
              <CardDescription>All purchase orders placed with this supplier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO ID</TableHead>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead>Payment Terms</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchaseOrders.map((order) => (
                      <TableRow key={order._id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">#{order._id}</TableCell>
                        <TableCell>{order.projectName}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${order.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>{order.paymentTerms}</TableCell>
                        <TableCell>{new Date(order.deliveryDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/orders/${order.orderId}`)}
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
              <CardTitle className="text-slate-900">Shipments</CardTitle>
              <CardDescription>All shipments from this supplier</CardDescription>
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
                    {filteredShipments.map((shipment) => (
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