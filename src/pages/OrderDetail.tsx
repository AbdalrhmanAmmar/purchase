import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getOrderById, Order } from "@/api/orders"
import { getPurchaseOrdersByOrderId, PurchaseOrder } from "@/api/purchaseOrders"
import { getInvoicesByOrderId, Invoice } from "@/api/invoices"
import { getShippingInvoicesByOrderId, ShippingInvoice } from "@/api/shipping"
import { ImagePlaceholder } from "@/components/ImagePlaceholder"
import { WorkflowProgress } from "@/components/WorkflowProgress"
import { useToast } from "@/hooks/useToast"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Plus,
  FileText,
  Truck,
  ShoppingCart,
  Download,
  Eye,
  Calendar,
  DollarSign,
  User,
  Building2
} from "lucide-react"
import {
  exportOrderOverviewToExcel,
  exportOrderOverviewToPDF,
  exportPurchaseOrdersToExcel,
  exportPurchaseOrdersToPDF,
  exportInvoicesToExcel,
  exportInvoicesToPDF,
  exportShippingToExcel,
  exportShippingToPDF
} from "@/utils/exportUtils"

export function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [shippingInvoices, setShippingInvoices] = useState<ShippingInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
  console.log('Purchase orders state:', purchaseOrders);
}, [purchaseOrders]);

useEffect(() => {
  const fetchOrderData = async () => {
    if (!id) return;

    try {
      console.log('Fetching order details...');
      const [orderResponse, purchaseOrdersResponse, invoicesResponse, shippingResponse] = await Promise.all([
        getOrderById(id),
        getPurchaseOrdersByOrderId(id),
        getInvoicesByOrderId(id),
        getShippingInvoicesByOrderId(id)
      ]);

      console.log('Purchase Orders Response:', purchaseOrdersResponse); // << هنا
      
      setOrder(orderResponse.order);
      setPurchaseOrders(
  Array.isArray(purchaseOrdersResponse.purchaseOrders) 
    ? purchaseOrdersResponse.purchaseOrders 
    : [purchaseOrdersResponse.purchaseOrders] || []
);
      setInvoices(invoicesResponse.invoices || []);
      setShippingInvoices(shippingResponse.shippingInvoices || []);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({ title: "Error", description: "Failed to load order details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  fetchOrderData();
}, [id, toast]);



  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      sent: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const getWorkflowSteps = () => {
    return [
      {
        name: 'Order Created',
        completed: true,
        optional: false
      },
      {
        name: 'Quotations',
        completed: false, // This would need to be implemented when quotations are added
        optional: true
      },
      {
        name: 'Purchase Orders',
        completed: purchaseOrders.length > 0,
        optional: false
      },
      {
        name: 'Sales Invoice',
        completed: invoices.length > 0,
        optional: false
      },
      {
        name: 'Shipping',
        completed: shippingInvoices.length > 0,
        optional: false
      }
    ];
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-slate-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/orders')} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Order Not Found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/orders')} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Order #{id}</h1>
          <p className="text-slate-600 dark:text-slate-400">{order.projectName}</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate(`/orders/${id}/purchase-order`)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Purchase Order
          </Button>
          <Button onClick={() => navigate(`/orders/${id}/invoice`)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Invoice
          </Button>
          <Button onClick={() => navigate(`/orders/${id}/shipping`)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Shipping
          </Button>
        </div>
      </div>

      {/* Workflow Progress */}
      <WorkflowProgress steps={getWorkflowSteps()} />

      {/* Order Overview */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Order Overview</CardTitle>
              <CardDescription>Basic order information and status</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => exportOrderOverviewToExcel(order)}>
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportOrderOverviewToPDF(order)}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">Client</p>
                <p className="font-medium text-slate-900">{order.clientName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">Workflow Type</p>
                <p className="font-medium text-slate-900 capitalize">{order.workflowType.replace('-', ' ')}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">Expected Delivery</p>
                <p className="font-medium text-slate-900">{new Date(order.expectedDelivery).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">Commission Rate</p>
                <p className="font-medium text-slate-900">{order.commissionRate}%</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <Badge className={getStatusBadge(order.status)}>
                {order.status.replace('-', ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600">Priority</p>
              <Badge variant="outline" className="capitalize">
                {order.priority}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders ({purchaseOrders.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="shipping">Shipping ({shippingInvoices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-slate-900">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{order.requirements}</p>
              </CardContent>
            </Card>
            {order.specialInstructions && (
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
                <CardHeader>
                  <CardTitle className="text-slate-900">Special Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{order.specialInstructions}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="purchase-orders" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">Purchase Orders</CardTitle>
                  <CardDescription>Orders placed with suppliers</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => exportPurchaseOrdersToExcel(purchaseOrders, id!)}>
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportPurchaseOrdersToPDF(purchaseOrders, id!)}>
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
            {purchaseOrders.length > 0 ? (
  purchaseOrders.map((po) => (
    <Card key={po._id} className="border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">PO #{po._id}</CardTitle>
            <CardDescription>{po.supplierName}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">${po.totalAmount?.toFixed(2)}</p>
            <Badge className={getStatusBadge(po.status)}>
              {po.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Photo</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">Qty</TableHead>
              <TableHead className="w-32">Unit Price</TableHead>
              <TableHead className="w-32">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {po.items?.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <ImagePlaceholder
                    src={item.photo}
                    alt="Product"
                    className="w-16 h-16 rounded"
                    fallbackText="Product"
                  />
                </TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>${item.unitPrice?.toFixed(2)}</TableCell>
                <TableCell>${item.total?.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  ))
) : (
  <div className="text-center py-8">
    <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
    <p className="text-slate-600 mb-4">No purchase orders created yet.</p>
    <Button onClick={() => navigate(`/orders/${id}/purchase-order`)}>
      <Plus className="w-4 h-4 mr-2" />
      Create Purchase Order
    </Button>
  </div>
)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">Sales Invoices</CardTitle>
                  <CardDescription>Invoices sent to clients</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => exportInvoicesToExcel(invoices, id!)}>
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportInvoicesToPDF(invoices, id!)}>
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <Card key={invoice._id} className="border border-slate-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Invoice #{invoice._id}</CardTitle>
                            <CardDescription>{invoice.clientName}</CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">${invoice.total.toFixed(2)}</p>
                            <Badge className={getStatusBadge(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-600">Invoice Date</p>
                            <p className="font-medium">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Due Date</p>
                            <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-20">Photo</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="w-24">Qty</TableHead>
                              <TableHead className="w-32">Unit Price</TableHead>
                              <TableHead className="w-32">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoice.items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <ImagePlaceholder
                                    src={item.photo}
                                    alt="Product"
                                    className="w-16 h-16 rounded"
                                    fallbackText="Product"
                                  />
                                </TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                                <TableCell>${item.total.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="mt-4 space-y-2 text-right">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${invoice.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Commission Fee ({invoice.commissionRate}%):</span>
                            <span>${invoice.commissionFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>${invoice.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No invoices generated yet.</p>
                  <Button onClick={() => navigate(`/orders/${id}/invoice`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Invoice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">Shipping Information</CardTitle>
                  <CardDescription>Shipment details and tracking</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => exportShippingToExcel(shippingInvoices, id!)}>
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportShippingToPDF(shippingInvoices, id!)}>
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {shippingInvoices.length > 0 ? (
                <div className="space-y-4">
                  {shippingInvoices.map((shipping) => (
                    <Card key={shipping._id} className="border border-slate-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Shipping #{shipping._id}</CardTitle>
                            <CardDescription>{shipping.shippingCompanyName}</CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">${shipping.totalShippingCost.toFixed(2)}</p>
                            <Badge className={getStatusBadge(shipping.status)}>
                              {shipping.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-600">Tracking Number</p>
                            <p className="font-medium font-mono">{shipping.trackingNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Expected Delivery</p>
                            <p className="font-medium">{new Date(shipping.expectedDelivery).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-20">Photo</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="w-24">Qty</TableHead>
                              <TableHead className="w-24">Weight</TableHead>
                              <TableHead className="w-24">Volume</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {shipping.items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <ImagePlaceholder
                                    src={item.photo}
                                    alt="Product"
                                    className="w-16 h-16 rounded"
                                    fallbackText="Product"
                                  />
                                </TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.weight || 0} kg</TableCell>
                                <TableCell>{item.volume || 0} m³</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="mt-4 space-y-2 text-right">
                          <div className="flex justify-between">
                            <span>Freight Charges:</span>
                            <span>${shipping.freightCharges.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Insurance:</span>
                            <span>${shipping.insurance.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Handling Fees:</span>
                            <span>${shipping.handlingFees.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg border-t pt-2">
                            <span>Total Shipping Cost:</span>
                            <span>${shipping.totalShippingCost.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No shipping information available yet.</p>
                  <Button onClick={() => navigate(`/orders/${id}/shipping`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Shipping Invoice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}