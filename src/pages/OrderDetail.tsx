import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getOrderById, Order } from "@/api/orders"
import { getPurchaseOrdersByOrderId, PurchaseOrder, updatePurchaseOrder } from "@/api/purchaseOrders"
import { getInvoicesByPurchaseId, Invoice, updateInvoice } from "@/api/invoices"
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
  Building2,
  Save,
  X,
  Edit,
  Loader2
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
import { getShippingInvoice, updateShippingInvoice } from '@/api/shipping'

export function OrderDetail() {
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);

  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [shippingInvoices, setShippingInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Invoice> | Partial<PurchaseOrder>>({})
  const [editingShippingInvoice, setEditingShippingInvoice] = useState<any | null>(null);

  const { toast } = useToast()
  const navigate = useNavigate()

useEffect(() => {
  const fetchOrderData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // 1. جلب بيانات الطلب وأوامر الشراء معاً
      const response = await getOrderById(id);
      const order = response.data.order; 
      const purchaseOrders = response.data.purchaseOrders || [];

      if (!order) {
        throw new Error('Order not found');
      }

      // 2. جلب الفواتير لكل أمر شراء (إذا وجدت)
      let allInvoices = [];
      if (purchaseOrders.length > 0) {
        const invoicesPromises = purchaseOrders.map(po => 
          getInvoicesByPurchaseId(po._id).then(res => res.data || [])
        );
        const invoicesArrays = await Promise.all(invoicesPromises);
        allInvoices = invoicesArrays.flat();
      }

      // 3. جلب بيانات الشحن
      let shippingData = [];
      try {
        const shippingResponse = await getShippingInvoice(id);
        shippingData = shippingResponse.data?.invoices || [];
        console.log('Shipping data loaded:', shippingData); // للتأكد من البيانات
      } catch (shippingError) {
        console.error('Failed to load shipping data:', shippingError);
      }
      
      // 4. تحديث الحالة مرة واحدة بجميع البيانات
      setOrder(order);
      setPurchaseOrders(purchaseOrders);
      setInvoices(allInvoices);
      setShippingInvoices(shippingData); // استخدم shippingData بدلاً من shippingInvoices

    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  fetchOrderData();
}, [id, toast]);


useEffect(() => {
console.log("shippingInvoices", shippingInvoices)
}, [shippingInvoices])


//handle editing shipping
const handleEditShipping = (shippingInvoice: any) => {
  setEditingShippingInvoice(shippingInvoice);
  setEditFormData({
    ...shippingInvoice,
    expectedDelivery: shippingInvoice.expectedDelivery.substring(0, 10) // تنسيق التاريخ
  });
};

const handleSaveShipping = async () => {
  if (!editingShippingInvoice || !id) return;

  try {
    setIsSaving(true);
    
    const response = await updateShippingInvoice(editingShippingInvoice._id, editFormData);
    
    setShippingInvoices(prev => prev.map(si => 
      si._id === editingShippingInvoice._id ? response.data.invoice : si
    ));
    
    toast({
      title: "Success",
      description: "Shipping invoice updated successfully",
      variant: "default",
    });
    
    setEditingShippingInvoice(null);
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to update shipping invoice",
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
};


  // Handle editing for both invoices and purchase orders
  const handleEdit = (item: Invoice | PurchaseOrder, type: 'invoice' | 'purchaseOrder') => {
    if (type === 'invoice') {
      setEditingInvoice(item as Invoice);
    } else {
      setEditingPurchaseOrder(item as PurchaseOrder);
    }
    setEditFormData({
      ...item,
      items: [...item.items]
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target;

    if (name.startsWith('items.') && index !== undefined) {
      const parts = name.split('.');
      const itemField = parts[2];

      const updatedItems = [...(editFormData.items || [])];

      updatedItems[index] = {
        ...updatedItems[index],
        [itemField]: ['quantity', 'unitPrice', 'total'].includes(itemField)
          ? Number(value)
          : value,
      };

      // Calculate totals if quantity or price changes
      if (itemField === 'quantity' || itemField === 'unitPrice') {
        const quantity = Number(updatedItems[index].quantity) || 0;
        const unitPrice = Number(updatedItems[index].unitPrice) || 0;
        updatedItems[index].total = quantity * unitPrice;
      }

      // Calculate new totals
      const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0);
      
      // For invoices, calculate commission
      if (editingInvoice) {
        const newCommissionRate = (editFormData as Partial<Invoice>).commissionRate || 5.5;
        const newCommissionFee = newSubtotal * (newCommissionRate / 100);
        const newTotal = newSubtotal + newCommissionFee;

        setEditFormData({
          ...editFormData,
          items: updatedItems,
          subtotal: newSubtotal,
          commissionFee: newCommissionFee,
          total: newTotal,
        });
      } else {
        // For purchase orders, just update subtotal
        setEditFormData({
          ...editFormData,
          items: updatedItems,
          totalAmount: newSubtotal,
        });
      }
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value,
      });
    }
  };

  // const handleSave = async () => {
  //   if (!id) return;

  //   try {
  //     if (editingInvoice) {
  //       const response = await updateInvoice(
  //         id,
  //         editingInvoice._id,
  //         editFormData as Partial<Invoice>
  //       );

  //       if (response) {
  //         setInvoices(invoices.map(inv => 
  //           inv._id === editingInvoice._id ? response.invoice : inv
  //         ));
  //         setEditingInvoice(null);
  //         toast({
  //           title: "Success",
  //           description: "Invoice updated successfully",
  //           variant: "default",
  //         });
  //       }
  //     } else if (editingPurchaseOrder) {
  //       const response = await updatePurchaseOrder(
  //         id,
  //         editingPurchaseOrder._id,
  //         editFormData as Partial<PurchaseOrder>
  //       );

  //       if (response) {
  //         setPurchaseOrders(purchaseOrders.map(po => 
  //           po._id === editingPurchaseOrder._id ? response.purchaseOrder : po
  //         ));
  //         setEditingPurchaseOrder(null);
  //         toast({
  //           title: "Success",
  //           description: "Purchase order updated successfully",
  //           variant: "default",
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error updating:', error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to update",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setEditFormData({});
  //   }
  // };

  //edit purchase
const handleEditPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
  setEditingPurchaseOrder(purchaseOrder);
  setEditFormData({
    ...purchaseOrder,
    items: [...purchaseOrder.items]
  });
};
const [isSaving, setIsSaving] = useState(false);

const handleSavePurchaseOrder = async () => {
  if (!editingPurchaseOrder) return;

  try {
        setIsSaving(true);

    // تحضير البيانات للإرسال
    const updateData = {
      ...editFormData,
      items: editFormData.items?.map(item => ({
        description: item.description,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        photo: item.photo || '',
      }))
    };

    // إزالة الحقول التي لا يجب تحديثها
    delete updateData.totalAmount;
    delete updateData.remainingAmount;
    delete updateData._id;

    const response = await updatePurchaseOrder(
      editingPurchaseOrder._id, 
      updateData
    );

    if (response) {
      // تحديث الحالة مع البيانات الجديدة من الباك إند
      setPurchaseOrders(prev => prev.map(po => 
        po._id === editingPurchaseOrder._id ? response : po
      ));
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث أمر الشراء بنجاح",
        variant: "default",
      });
      
      // إغلاق نموذج التحرير
      setEditingPurchaseOrder(null);
      setEditFormData({});
    }
  } catch (error) {
    console.error('Error updating purchase order:', error);
    toast({
      title: "خطأ",
      description: error instanceof Error ? error.message : "فشل في تحديث أمر الشراء",
      variant: "destructive",
    });
  }
  finally{
        setIsSaving(false);

  }
};

const handleSaveInvoice = async () => {
  if (!editingInvoice) return;

  try {
    setIsSavingInvoice(true);

    // تحضير البيانات للإرسال
    const updateData = {
      ...editFormData,
      items: editFormData.items?.map(item => ({
        description: item.description,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        total: Number(item.total) || 0,
        photo: item.photo || '',
      })),
      subtotal: Number(editFormData.subtotal) || 0,
      commissionFee: Number(editFormData.commissionFee) || 0,
      total: Number(editFormData.total) || 0,
      status: editFormData.status || 'draft',
      paymentTerms: editFormData.paymentTerms || '',
      dueDate: editFormData.dueDate || new Date(),
      invoiceDate: editFormData.invoiceDate || new Date(),
    };

    // إزالة الحقول التي لا يجب تحديثها
    delete updateData._id;
    delete updateData.clientName;
    delete updateData.orderId;
    delete updateData.clientId;
    delete updateData.createdAt;

    const response = await updateInvoice(
      editingInvoice._id, 
      updateData as Partial<Invoice>
    );

    if (response) {
      // تحديث الحالة مع البيانات الجديدة
      setInvoices(prev => prev.map(inv => 
        inv._id === editingInvoice._id ? { ...inv, ...response } : inv
      ));
      
      toast({
        title: "Success",
        description: "Invoice updated successfully",
        variant: "default",
      });
      
      // إغلاق نموذج التحرير
      setEditingInvoice(null);
      setEditFormData({});
    }
  } catch (error) {
    console.error('Error updating invoice:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to update invoice",
      variant: "destructive",
    });
  } finally {
    setIsSavingInvoice(false);
  }
};

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      sent: 'bg-blue-100 text-blue-800 border-blue-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200'
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/orders')} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Order #{id}</h1>
            <p className="text-slate-600">{order.projectName}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate(`/orders/${id}/purchase-order`)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Purchase Order
          </Button>
          <Button onClick={() => navigate(`/orders/${id}/invoice`)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Sales
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order Overview</CardTitle>
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
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">Client</p>
                <p className="font-medium">{order.clientName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">Workflow Type</p>
                <p className="font-medium capitalize">{order?.status.replace('-', ' ')}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">Expected Delivery</p>
                <p className="font-medium">{new Date(order.expectedDelivery).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">Commission Rate</p>
                <p className="font-medium">{order.commissionRate}%</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{order.requirements}</p>
              </CardContent>
            </Card>
            {order.specialInstructions && (
              <Card>
                <CardHeader>
                  <CardTitle>Special Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{order.specialInstructions}</p>



                  
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="purchase-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Purchase Orders</CardTitle>
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
                <div className="space-y-4">
                  {purchaseOrders.map((po) => (
                    <Card key={po._id} className="border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">PO #{po._id}</CardTitle>
                            <CardDescription>{po.supplierName}</CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
  onClick={() => handleEditPurchaseOrder(po)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-600">Order Date</p>
                            <p className="font-medium">{new Date(po.orderDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Expected Delivery</p>
                            <p className="font-medium">{new Date(po.expectedDelivery).toLocaleDateString()}</p>
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
                        <div className="mt-4 flex justify-end">
                          <div className="text-right space-y-2">
                            <div className="flex justify-between font-semibold text-lg border-t pt-2">
                              <span>Total:</span>
                              <span>${po.totalAmount?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales Invoices</CardTitle>
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
                    <Card key={invoice._id} className="border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Invoice #{invoice._id}</CardTitle>
                            <CardDescription>{invoice.clientName}</CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(invoice, 'invoice')}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Shipping Information</CardTitle>
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
      <Card key={shipping._id} className="border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Shipping #{shipping._id}</CardTitle>
              <CardDescription>{shipping.shippingCompanyName}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditShipping(shipping)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
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
              <p className="font-medium">
                {new Date(shipping.expectedDelivery).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-600">Freight Charges</p>
              <p className="font-medium">${shipping.freightCharges?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Insurance</p>
              <p className="font-medium">${shipping.insurance?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Handling Fees</p>
              <p className="font-medium">${shipping.handlingFees?.toFixed(2)}</p>
            </div>
          </div>

          {shipping.items?.length > 0 && (
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
          )}

          <div className="mt-4 flex justify-end">
            <div className="text-right space-y-2">
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total Shipping Cost:</span>
                <span>${shipping.totalShippingCost?.toFixed(2)}</span>
              </div>
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

      {/* Edit Modal */}
      {(editingInvoice || editingPurchaseOrder) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Edit {editingInvoice ? 'Invoice' : 'Purchase Order'} #{editingInvoice?._id || editingPurchaseOrder?._id}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setEditingInvoice(null);
                    setEditingPurchaseOrder(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {editingInvoice ? 'Invoice Date' : 'Order Date'}
                    </label>
                    <input
                      type="date"
                      name={editingInvoice ? "invoiceDate" : "orderDate"}
                      value={editFormData.invoiceDate?.toString().substring(0, 10) || 
                            editFormData.orderDate?.toString().substring(0, 10) || ''}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {editingInvoice ? 'Due Date' : 'Expected Delivery'}
                    </label>
                    <input
                      type="date"
                      name={editingInvoice ? "dueDate" : "expectedDelivery"}
                      value={editFormData.dueDate?.toString().substring(0, 10) || 
                            editFormData.expectedDelivery?.toString().substring(0, 10) || ''}
                      onChange={handleEditFormChange}
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={editFormData.status || ''}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
           {editingInvoice && (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Payment Terms
      </label>
      <input
        type="text"
        name="paymentTerms"
        value={editFormData.paymentTerms || ''}
        onChange={handleEditFormChange}
        className="w-full p-2 border border-slate-300 rounded"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Commission Rate (%)
      </label>
      <input
        type="number"
        name="commissionRate"
        value={editFormData.commissionRate || ''}
        onChange={handleEditFormChange}
        className="w-full p-2 border border-slate-300 rounded"
        step="0.1"
      />
    </div>
  </div>
)}
                  </select>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-24">Qty</TableHead>
                        <TableHead className="w-32">Unit Price</TableHead>
                        <TableHead className="w-32">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editFormData.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <input
                              type="text"
                              name={`items.${index}.description`}
                              value={item.description}
                              onChange={(e) => handleEditFormChange(e, index)}
                              className="w-full p-2 border border-slate-300 rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              name={`items.${index}.quantity`}
                              value={item.quantity}
                              onChange={(e) => handleEditFormChange(e, index)}
                              className="w-full p-2 border border-slate-300 rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              name={`items.${index}.unitPrice`}
                              value={item.unitPrice}
                              onChange={(e) => handleEditFormChange(e, index)}
                              className="w-full p-2 border border-slate-300 rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              name={`items.${index}.total`}
                              value={item.total}
                              onChange={(e) => handleEditFormChange(e, index)}
                              className="w-full p-2 border border-slate-300 rounded"
                              readOnly
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 space-y-2 text-right">
                  {editingInvoice && (
                    <>
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${editFormData.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commission Fee ({editFormData.commissionRate}%):</span>
                        <span>${editFormData.commissionFee?.toFixed(2) || '0.00'}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>
                      ${editingInvoice 
                        ? editFormData.total?.toFixed(2) || '0.00'
                        : editFormData.totalAmount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditingInvoice(null);
                      setEditingPurchaseOrder(null);
                    }}
                  >
                    Cancel
                  </Button>
<Button 
  onClick={editingInvoice ? handleSaveInvoice : handleSavePurchaseOrder}
  className="bg-blue-600 hover:bg-blue-700"
  disabled={isSaving || isSavingInvoice}
>
  {(isSaving || isSavingInvoice) ? (
    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  ) : (
    <Save className="w-4 h-4 mr-2" />
  )}
  Save Changes
</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {editingShippingInvoice && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Edit Shipping Invoice #{editingShippingInvoice._id}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setEditingShippingInvoice(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Shipping Company
              </label>
              <input
                type="text"
                name="shippingCompanyName"
                value={editFormData.shippingCompanyName || ''}
                onChange={(e) => setEditFormData({...editFormData, shippingCompanyName: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                name="trackingNumber"
                value={editFormData.trackingNumber || ''}
                onChange={(e) => setEditFormData({...editFormData, trackingNumber: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Expected Delivery
              </label>
              <input
                type="date"
                name="expectedDelivery"
                value={editFormData.expectedDelivery?.toString().substring(0, 10) || ''}
                onChange={(e) => setEditFormData({...editFormData, expectedDelivery: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={editFormData.status || ''}
                onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Freight Charges ($)
              </label>
              <input
                type="number"
                name="freightCharges"
                value={editFormData.freightCharges || 0}
                onChange={(e) => setEditFormData({...editFormData, freightCharges: Number(e.target.value)})}
                className="w-full p-2 border border-slate-300 rounded"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Insurance ($)
              </label>
              <input
                type="number"
                name="insurance"
                value={editFormData.insurance || 0}
                onChange={(e) => setEditFormData({...editFormData, insurance: Number(e.target.value)})}
                className="w-full p-2 border border-slate-300 rounded"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Handling Fees ($)
              </label>
              <input
                type="number"
                name="handlingFees"
                value={editFormData.handlingFees || 0}
                onChange={(e) => setEditFormData({...editFormData, handlingFees: Number(e.target.value)})}
                className="w-full p-2 border border-slate-300 rounded"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Total Shipping Cost ($)
            </label>
            <input
              type="number"
              name="totalShippingCost"
              value={editFormData.totalShippingCost || 0}
              onChange={(e) => setEditFormData({...editFormData, totalShippingCost: Number(e.target.value)})}
              className="w-full p-2 border border-slate-300 rounded"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Qty</TableHead>
                  <TableHead className="w-24">Weight (kg)</TableHead>
                  <TableHead className="w-24">Volume (m³)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editFormData.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <input
                        type="text"
                        name={`items.${index}.description`}
                        value={item.description}
                        onChange={(e) => handleEditFormChange(e, index)}
                        className="w-full p-2 border border-slate-300 rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        name={`items.${index}.quantity`}
                        value={item.quantity}
                        onChange={(e) => handleEditFormChange(e, index)}
                        className="w-full p-2 border border-slate-300 rounded"
                        min="1"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        name={`items.${index}.weight`}
                        value={item.weight}
                        onChange={(e) => handleEditFormChange(e, index)}
                        className="w-full p-2 border border-slate-300 rounded"
                        min="0"
                        step="0.1"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        name={`items.${index}.volume`}
                        value={item.volume}
                        onChange={(e) => handleEditFormChange(e, index)}
                        className="w-full p-2 border border-slate-300 rounded"
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setEditingShippingInvoice(null)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveShipping}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)}
    </div>
  )
}