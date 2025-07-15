import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getOrders, Order, archiveOrder } from "@/api/orders"
import { WorkflowProgress } from "@/components/WorkflowProgress"
import { useToast } from "@/hooks/useToast"
import { useNavigate } from "react-router-dom"
import { Plus, Search, Filter, Eye, Edit, MoreHorizontal, Archive } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('Fetching orders...')
        const response = await getOrders() as { orders: Order[] }
        setOrders(response.orders)
        console.log('Orders loaded successfully:', response.orders.length)
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [toast])

  const handleArchiveOrder = async (orderId: string, projectName: string) => {
    try {
      console.log('Archiving order:', orderId)
      await archiveOrder(orderId)

      // Remove the archived order from the current list
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId))

      toast({
        title: "Success",
        description: `Order "${projectName}" has been archived`,
      })
    } catch (error: any) {
      console.error('Error archiving order:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to archive order",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return variants[priority as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const getWorkflowSteps = (order: Order) => {
    return [
      {
        name: 'Order Created',
        completed: true,
        optional: false
      },
      {
        name: 'Quotations',
        completed: order.hasQuotations || false,
        optional: true
      },
      {
        name: 'Purchase Orders',
        completed: order.hasPurchaseOrders || false,
        optional: false
      },
      {
        name: 'Sales Invoice',
        completed: order.hasInvoices || false,
        optional: false
      },
      {
        name: 'Shipping',
        completed: order.hasShipping || false,
        optional: false
      }
    ];
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-slate-200 rounded w-24 animate-pulse"></div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Orders</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your orders and track their progress</p>
        </div>
        <Button onClick={() => navigate('/orders/new')} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search orders by project name or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid with Workflow Progress */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order._id} className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <CardTitle className="text-lg text-slate-900">#{order._id} - {order.projectName}</CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-1">
                        <span>{order.clientName}</span>
                        <Badge className={getStatusBadge(order.status)}>
                          {order.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityBadge(order.priority)}>
                          {order.priority}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          Commission: {order.commissionRate}%
                        </span>
                        <span className="text-sm text-slate-500">
                          Due: {new Date(order.expectedDelivery).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl">
                      <DropdownMenuItem onClick={() => navigate(`/orders/${order._id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/orders/${order._id}/purchase-order`)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Purchase Order
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/orders/${order._id}/invoice`)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Generate Invoice
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive Order
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Archive Order</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to archive "{order.projectName}"? This will move the order to the archive and it won't appear in the main orders list. You can restore it later if needed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleArchiveOrder(order._id, order.projectName)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              Archive
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Workflow Progress</h4>
                  <WorkflowProgress steps={getWorkflowSteps(order)} compact={true} />
                </div>
                {order.requirements && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-1">Requirements</h4>
                    <p className="text-sm text-slate-600 line-clamp-2">{order.requirements}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && !loading && (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardContent className="text-center py-12">
            <div className="text-slate-600 mb-4">
              {searchTerm || statusFilter !== 'all' ? 'No orders match your search criteria.' : 'No orders found.'}
            </div>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => navigate('/orders/new')} className="bg-gradient-to-r from-blue-500 to-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Order
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}