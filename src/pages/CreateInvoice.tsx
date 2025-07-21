import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { createInvoice, CreateInvoiceData, InvoiceItem } from "@/api/invoices"
import { getOrderById, Order } from "@/api/orders"
import { PurchaseOrder } from "@/api/purchaseOrders"
import { ImagePlaceholder } from "@/components/ImagePlaceholder"
import { useToast } from "@/hooks/useToast"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CalendarIcon, FileText, Save } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function CreateInvoice() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({})
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({})
  const [itemPrices, setItemPrices] = useState<{ [key: string]: number }>({})
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date>()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const { register, handleSubmit, setValue, watch } = useForm<CreateInvoiceData>({
    defaultValues: {
      paymentTerms: 'Net 30'
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        console.log('Fetching order and purchase orders for invoice creation...')
        const response = await getOrderById(id)
        
        console.log('Order:', response.order)
        console.log('Purchase Orders:', response.order.purchaseOrders)

        if (!response.order) {
          throw new Error('Order not found')
        }

        setOrder(response.order)
        setPurchaseOrders(response.order.purchaseOrders || [])
        
        // Initialize quantities and prices
        const initialQuantities: { [key: string]: number } = {}
        const initialPrices: { [key: string]: number } = {}
        const initialSelected: { [key: string]: boolean } = {}
        
        response.purchaseOrders?.forEach(po => {
          po.items?.forEach(item => {
            const key = `${po._id}_${item._id}`
            initialQuantities[key] = item.quantity
            initialPrices[key] = item.unitPrice
            initialSelected[key] = true // Select all items by default
          })
        })
        
        setItemQuantities(initialQuantities)
        setItemPrices(initialPrices)
        setSelectedItems(initialSelected)
        
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load order data",
          variant: "destructive",
        })
        navigate(`/orders/${id}`)
      }
    }

    fetchData()
  }, [id, toast, navigate])

  const handleItemSelection = (key: string, checked: boolean) => {
    setSelectedItems(prev => ({ ...prev, [key]: checked }))
  }

  const handleQuantityChange = (key: string, quantity: number) => {
    setItemQuantities(prev => ({ ...prev, [key]: quantity }))
  }

  const handlePriceChange = (key: string, price: number) => {
    setItemPrices(prev => ({ ...prev, [key]: price }))
  }

  const getSelectedInvoiceItems = (): InvoiceItem[] => {
    const items: InvoiceItem[] = []
    
    purchaseOrders.forEach(po => {
      po.items?.forEach(item => {
        const key = `${po._id}_${item._id}`
        if (selectedItems[key]) {
          const quantity = itemQuantities[key] || item.quantity
          const unitPrice = itemPrices[key] || item.unitPrice
          items.push({
            _id: item._id,
            itemCode: item.itemCode,
            description: item.description,
            quantity,
            unitPrice,
            total: quantity * unitPrice,
            photo: item.photo
          })
        }
      })
    })
    
    return items
  }

  const calculateTotals = () => {
    const items = getSelectedInvoiceItems()
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const commissionFee = subtotal * ((order?.commissionRate || 0) / 100)
    const total = subtotal + commissionFee
    
    return { subtotal, commissionFee, total }
  }

  const onSubmit = async (data: CreateInvoiceData) => {
    if (!id || !order) return

    const selectedInvoiceItems = getSelectedInvoiceItems()
    
    if (selectedInvoiceItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one item for the invoice",
        variant: "destructive",
      })
      return
    }

    if (!dueDate) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const invoiceData = {
        ...data,
        orderId: id,
        items: selectedInvoiceItems,
        invoiceDate: invoiceDate.toISOString(),
        dueDate: dueDate.toISOString(),
      }

      await createInvoice(invoiceData)
      toast({
        title: "Success",
        description: "Sales invoice generated successfully",
      })
      navigate(`/orders/${id}`)
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!order) {
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

  const { subtotal, commissionFee, total } = calculateTotals()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(`/orders/${id}`)} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Generate Sales Invoice</h1>
          <p className="text-slate-600 dark:text-slate-400">Order #{id} - {order.projectName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-slate-900">Invoice Information</CardTitle>
            <CardDescription>Basic information for this sales invoice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Master Order</Label>
                <Input value={`#${order._id} - ${order.projectName}`} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Client</Label>
                <Input value={order.clientName} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Commission Rate</Label>
                <Input value={`${order.commissionRate}%`} disabled className="bg-slate-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items from Purchase Orders */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-slate-900">Items from Purchase Orders</CardTitle>
            <CardDescription>Select and modify items to include in the sales invoice</CardDescription>
          </CardHeader>
          <CardContent>
            {purchaseOrders && purchaseOrders.length > 0 ? (
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
                    {purchaseOrders.map(po => 
                      po.items?.map((item, itemIndex) => {
                        const key = `${po._id}_${item._id || itemIndex}`
                        const quantity = itemQuantities[key] || item.quantity
                        const sellPrice = itemPrices[key] || item.unitPrice
                        const itemTotal = quantity * sellPrice
                        
                        return (
                          <TableRow key={key}>
                            <TableCell>
                              <Checkbox
                                checked={selectedItems[key] || false}
                                onCheckedChange={(checked) => handleItemSelection(key, checked as boolean)}
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
                                onChange={(e) => handleQuantityChange(key, parseInt(e.target.value) || 0)}
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
                                onChange={(e) => handlePriceChange(key, parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>${itemTotal.toFixed(2)}</TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No purchase orders found for this order.</p>
                <Button onClick={() => navigate(`/orders/${id}/purchase-order`)} variant="outline">
                  Create Purchase Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-slate-900">Invoice Details</CardTitle>
            <CardDescription>Set invoice dates and payment terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !invoiceDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {invoiceDate ? format(invoiceDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl">
                    <Calendar
                      mode="single"
                      selected={invoiceDate}
                      onSelect={setInvoiceDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select onValueChange={(value) => setValue('paymentTerms', value)} defaultValue="Net 30">
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

            {/* Totals */}
            <div className="border-t pt-6">
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Commission Fee ({order.commissionRate}%):</span>
                    <span className="font-medium">${commissionFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/orders/${id}`)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || purchaseOrders.length === 0}
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