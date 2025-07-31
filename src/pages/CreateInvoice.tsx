import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useToast } from "@/hooks/useToast"
import { useNavigate, useParams } from "react-router-dom"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ArrowLeft, CalendarIcon, FileText, Save } from "lucide-react"

// API functions
import { createInvoice, CreateInvoiceData, InvoiceItem } from "@/api/invoices"
import { getPurchaseOrdersByOrderId, PurchaseOrder } from "@/api/purchaseOrders"
import { getOrderById, Order } from '@/api/orders'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ImagePlaceholder } from "@/components/ImagePlaceholder"

export function CreateInvoice() {
  const { id: orderId } = useParams<{ id: string }>()
  const { toast } = useToast()
  const navigate = useNavigate()
  
  // State management
  const [order, setOrder] = useState<Order | null>(null)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({})
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({})
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date>()
  const [loading, setLoading] = useState(false)

  // Form handling
  const { register, handleSubmit, setValue, watch } = useForm<CreateInvoiceData>({
    defaultValues: {
      paymentTerms: 'Net 30'
    }
  })

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) return
      
      try {
        const response = await getOrderById(orderId)
        if (response.data) {
          setOrder(response.data)
          setValue('clientName', response.data.order.clientName)
          setValue('commissionRate', response.data.order.commissionRate)
          setValue('projectName', response.data.projectName)
          setValue('requirements', response.data.requirements)
          setValue('specialInstructions', response.data.specialInstructions)
          setValue('paymentTerms', response.data.paymentTerms || 'Net 30')
        }
      } catch (error) {
        toast({ 
          title: "Error", 
          description: "Failed to load order data", 
          variant: "destructive" 
        })
      }
    }

    fetchOrderData()
  }, [orderId, setValue, toast])

  // Fetch purchase orders
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      if (!orderId) return
      
      try {
        const response = await getPurchaseOrdersByOrderId(orderId)
        if (response.purchaseOrder?.data?.purchaseOrders) {
          setPurchaseOrders(response.purchaseOrder.data.purchaseOrders)
          
          // Initialize quantities, prices and selection state
          const initialQuantities: Record<string, number> = {}
          const initialPrices: Record<string, number> = {}
          const initialSelected: Record<string, boolean> = {}
          
          response.purchaseOrder.data.purchaseOrders.forEach(po => {
            po.items?.forEach(item => {
              const key = item._id || Math.random().toString()
              initialQuantities[key] = item.quantity
              initialPrices[key] = item.unitPrice
              initialSelected[key] = true
            })
          })
          
          setItemQuantities(initialQuantities)
          setItemPrices(initialPrices)
          setSelectedItems(initialSelected)
        }
      } catch (error) {
        toast({ 
          title: "Error", 
          description: "Failed to load purchase orders", 
          variant: "destructive" 
        })
      }
    }
    
    fetchPurchaseOrders()
  }, [orderId, toast])

  // Item selection handlers
  const handleItemSelection = (key: string, checked: boolean) => {
    setSelectedItems(prev => ({ ...prev, [key]: checked }))
  }

  const handleQuantityChange = (key: string, quantity: number) => {
    setItemQuantities(prev => ({ ...prev, [key]: quantity }))
  }

  const handlePriceChange = (key: string, price: number) => {
    setItemPrices(prev => ({ ...prev, [key]: price }))
  }

  // Get selected items for invoice
  const getSelectedInvoiceItems = (): InvoiceItem[] => {
    const items: InvoiceItem[] = []
    
    purchaseOrders.forEach(po => {
      po.items?.forEach(item => {
        if (selectedItems[item._id || '']) {
          const quantity = itemQuantities[item._id || ''] || item.quantity
          const unitPrice = itemPrices[item._id || ''] || item.unitPrice
          
          items.push({
            ...item,
            quantity,
            unitPrice,
            total: quantity * unitPrice
          })
        }
      })
    })
    
    return items
  }

  // Calculate invoice totals
  const calculateTotals = () => {
    const items = getSelectedInvoiceItems()
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const commissionRate = order?.order.commissionRate || 5
    const commissionFee = subtotal * (commissionRate / 100)
    const total = subtotal + commissionFee
    
    return { subtotal, commissionFee, total, commissionRate }
  }

  // Form submission
const onSubmit = async (data: CreateInvoiceData) => {
  if (!orderId || purchaseOrders.length === 0) return;

  const selectedInvoiceItems = getSelectedInvoiceItems();
  
  if (selectedInvoiceItems.length === 0) {
    toast({
      title: "Error",
      description: "Please select at least one item for the invoice",
      variant: "destructive",
    });
    return;
  }

  if (!dueDate) {
    toast({
      title: "Error",
      description: "Please select a due date",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  try {
    const invoiceData: CreateInvoiceData = {
      purchaseId: purchaseOrders[0]._id, // استخدم معرف أمر الشراء الأول أو اختر المناسب
      orderId, // إذا كنت بحاجة لهذا الحقل أيضاً
      dueDate: dueDate.toISOString(),
      paymentTerms: data.paymentTerms,
      items: selectedInvoiceItems,
      commissionRate: order?.order.commissionRate || 5
    };

    await createInvoice(invoiceData);
    toast({
      title: "Success",
      description: "Invoice created successfully",
    });
    navigate(`/orders/${orderId}`);
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create invoice",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
}

  // Loading state
  if (!order || purchaseOrders.length === 0) {
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

  const { subtotal, commissionFee, total, commissionRate } = calculateTotals()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Generate Sales Invoice</h1>
          <p className="text-slate-600 dark:text-slate-400">Order #{orderId}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Information */}
        <OrderInfoCard 
          orderId={orderId}
          clientName={watch('clientName')}
          commissionRate={watch('commissionRate')}
        />

        {/* Items from Purchase Orders */}
        <ItemsTableCard 
          purchaseOrders={purchaseOrders}
          selectedItems={selectedItems}
          itemQuantities={itemQuantities}
          itemPrices={itemPrices}
          onItemSelect={handleItemSelection}
          onQuantityChange={handleQuantityChange}
          onPriceChange={handlePriceChange}
        />

        {/* Invoice Details */}
        <InvoiceDetailsCard 
          invoiceDate={invoiceDate}
          dueDate={dueDate}
          paymentTerms={watch('paymentTerms')}
          onInvoiceDateChange={setInvoiceDate}
          onDueDateChange={setDueDate}
          onPaymentTermsChange={(value) => setValue('paymentTerms', value)}
          subtotal={subtotal}
          commissionFee={commissionFee}
          total={total}
          commissionRate={commissionRate}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || getSelectedInvoiceItems().length === 0}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Generating...' : 'Generate Invoice'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// Sub-components for better organization

function OrderInfoCard({ orderId, clientName, commissionRate }: {
  orderId: string | undefined;
  clientName: string;
  commissionRate: number;
}) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
      <CardHeader>
        <CardTitle className="text-slate-900">Order Information</CardTitle>
        <CardDescription>Basic information for this sales invoice</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Order Id</Label>
            <Input value={`#${orderId}`} disabled className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label>Client Name</Label>
            <Input value={clientName} disabled className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label>Commission Rate</Label>
            <Input value={`${commissionRate}%`} disabled className="bg-slate-50" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ItemsTableCard({
  purchaseOrders,
  selectedItems,
  itemQuantities,
  itemPrices,
  onItemSelect,
  onQuantityChange,
  onPriceChange
}: {
  purchaseOrders: PurchaseOrder[];
  selectedItems: Record<string, boolean>;
  itemQuantities: Record<string, number>;
  itemPrices: Record<string, number>;
  onItemSelect: (key: string, checked: boolean) => void;
  onQuantityChange: (key: string, quantity: number) => void;
  onPriceChange: (key: string, price: number) => void;
}) {
  const hasItems = purchaseOrders.some(po => po.items && po.items.length > 0)

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
      <CardHeader>
        <CardTitle className="text-slate-900">Items from Purchase Orders</CardTitle>
        <CardDescription>Select and modify items to include in the sales invoice</CardDescription>
      </CardHeader>
      <CardContent>
        {hasItems ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead className="w-20">Photo</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Qty</TableHead>
                  <TableHead className="w-32">Cost</TableHead>
                  <TableHead className="w-32">Sell Price</TableHead>
                  <TableHead className="w-32">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map(po => (
                  po.items?.map(item => {
                    const key = item._id || Math.random().toString()
                    const quantity = itemQuantities[key] || item.quantity
                    const sellPrice = itemPrices[key] || item.unitPrice
                    const itemTotal = quantity * sellPrice
                    
                    return (
                      <TableRow key={key}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems[key] || false}
                            onCheckedChange={(checked) => onItemSelect(key, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <ImagePlaceholder
                            src={item.photo}
                            alt="Product"
                            className="w-16 h-16 rounded"
                            fallbackText="Product"
                          />
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => onQuantityChange(key, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={sellPrice}
                            onChange={(e) => onPriceChange(key, parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>${itemTotal.toFixed(2)}</TableCell>
                      </TableRow>
                    )
                  })
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No items found in the purchase orders.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function InvoiceDetailsCard({
  invoiceDate,
  dueDate,
  paymentTerms,
  onInvoiceDateChange,
  onDueDateChange,
  onPaymentTermsChange,
  subtotal,
  commissionFee,
  total,
  commissionRate
}: {
  invoiceDate: Date;
  dueDate: Date | undefined;
  paymentTerms: string;
  onInvoiceDateChange: (date: Date) => void;
  onDueDateChange: (date: Date | undefined) => void;
  onPaymentTermsChange: (value: string) => void;
  subtotal: number;
  commissionFee: number;
  total: number;
  commissionRate: number;
}) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
      <CardHeader>
        <CardTitle className="text-slate-900">Invoice Details</CardTitle>
        <CardDescription>Set invoice dates and payment terms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DatePicker 
            label="Invoice Date"
            date={invoiceDate}
            onSelect={onInvoiceDateChange}
          />
          
          <DatePicker 
            label="Due Date *"
            date={dueDate}
            onSelect={onDueDateChange}
          />
          
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Select 
              onValueChange={onPaymentTermsChange} 
              value={paymentTerms}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl">
                <SelectItem value="Net 15">Net 15</SelectItem>
                <SelectItem value="Net 30">Net 30</SelectItem>
                <SelectItem value="Net 45">Net 45</SelectItem>
                <SelectItem value="Net 60">Net 60</SelectItem>
                <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <InvoiceTotals 
          subtotal={subtotal}
          commissionFee={commissionFee}
          total={total}
          commissionRate={commissionRate}
        />
      </CardContent>
    </Card>
  )
}

function DatePicker({
  label,
  date,
  onSelect
}: {
  label: string;
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function InvoiceTotals({
  subtotal,
  commissionFee,
  total,
  commissionRate
}: {
  subtotal: number;
  commissionFee: number;
  total: number;
  commissionRate: number;
}) {
  return (
    <div className="border-t pt-6">
      <div className="flex justify-end">
        <div className="w-80 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Commission Fee ({commissionRate}%):</span>
            <span className="font-medium">${commissionFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t pt-2">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}