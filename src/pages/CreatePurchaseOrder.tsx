import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { createPurchaseOrder, CreatePurchaseOrderData, PurchaseOrderItem } from "@/api/purchaseOrders"
import { getOrderById, Order } from "@/api/orders"
import { getSuppliers, createSupplier, Supplier, CreateSupplierData } from "@/api/suppliers"
import { useToast } from "@/hooks/useToast"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Plus, CalendarIcon, Upload, X, Package, Save, Send, CreditCard } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useDropzone } from 'react-dropzone'

interface PaymentData {
  makePayment: boolean;
  paymentType: 'advance' | 'down_payment';
  amount: number;
  paymentMethod: 'bank_transfer' | 'wire' | 'ach' | 'check' | 'cash';
  reference?: string;
  description?: string;
}

export function CreatePurchaseOrder() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [deliveryDate, setDeliveryDate] = useState<Date>()
  const [loading, setLoading] = useState(false)
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData>({
    makePayment: false,
    paymentType: 'down_payment',
    amount: 0,
    paymentMethod: 'bank_transfer',
    reference: '',
    description: ''
  })
  const { toast } = useToast()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm<CreatePurchaseOrderData>({
    defaultValues: {
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      paymentTerms: 'Net 30'
    }
  })

  const { register: registerSupplier, handleSubmit: handleSupplierSubmit, formState: { errors: supplierErrors }, reset: resetSupplier } = useForm<CreateSupplierData>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  const watchedItems = watch("items")

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        console.log('Fetching order and suppliers for purchase order creation...')
        const [orderResponse, suppliersResponse] = await Promise.all([
          getOrderById(id) as Promise<{ order: Order }>,
          getSuppliers() as Promise<{ suppliers: Supplier[] }>
        ])

        setOrder(orderResponse.order)
        setSuppliers(suppliersResponse.suppliers)
        console.log('Data loaded successfully')
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [id, toast])

  // Calculate totals when items change
  useEffect(() => {
    watchedItems?.forEach((item, index) => {
      const quantity = item.quantity || 0
      const unitPrice = item.unitPrice || 0
      const total = quantity * unitPrice
      setValue(`items.${index}.total`, total)
    })
  }, [watchedItems, setValue])

  const onCreateSupplier = async (data: CreateSupplierData) => {
    try {
      console.log('Creating new supplier...')
      const response = await createSupplier(data) as { supplier: Supplier }
      setSuppliers(prev => [...prev, response.supplier])
      setSelectedSupplier(response.supplier._id)
      setSupplierDialogOpen(false)
      resetSupplier()
      console.log('Supplier created successfully')
      toast({
        title: "Success",
        description: "Supplier created successfully",
      })
    } catch (error) {
      console.error('Error creating supplier:', error)
      toast({
        title: "Error",
        description: "Failed to create supplier",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: CreatePurchaseOrderData, sendToSupplier = false) => {
    // Add debugging logs
    console.log('onSubmit called with selectedSupplier:', selectedSupplier);
    console.log('onSubmit called with deliveryDate:', deliveryDate);
    console.log('onSubmit called with loading state:', loading);

    // Prevent multiple submissions
    if (loading) {
      console.log('Submission blocked - already loading');
      return;
    }

    // Use a small delay to ensure state has been updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('After delay - selectedSupplier:', selectedSupplier);
    console.log('After delay - deliveryDate:', deliveryDate);

    if (!selectedSupplier) {
      console.log('Validation failed - no supplier selected');
      toast({
        title: "Error",
        description: "Please select a supplier",
        variant: "destructive",
      })
      return
    }

    if (!deliveryDate) {
      console.log('Validation failed - no delivery date selected');
      toast({
        title: "Error",
        description: "Please select delivery date",
        variant: "destructive",
      })
      return
    }

    if (paymentData.makePayment && paymentData.amount <= 0) {
      console.log('Validation failed - invalid payment amount');
      toast({
        title: "Error",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      })
      return
    }

    if (paymentData.makePayment && paymentData.amount > totalAmount) {
      console.log('Validation failed - payment amount exceeds total');
      toast({
        title: "Error",
        description: "Payment amount cannot exceed total order amount",
        variant: "destructive",
      })
      return
    }

    if (!id) {
      console.log('Validation failed - no order ID');
      return;
    }

    setLoading(true)
    try {
      console.log('Creating purchase order...')
      console.log('Delivery date:', deliveryDate)
      console.log('Selected supplier:', selectedSupplier)

    const purchaseOrderData = {
  ...data,
  orderId: id,
  supplierId: selectedSupplier,
  supplierName: suppliers.find(s => s._id === selectedSupplier)?.supplierName || 'Unknown Supplier',
  deliveryDate: deliveryDate.toISOString(),
  totalAmount,
  paidAmount: paymentData.makePayment ? paymentData.amount : 0,
  payments: paymentData.makePayment ? [{
    paymentType: paymentData.paymentType,
    amount: paymentData.amount,
    paymentMethod: paymentData.paymentMethod,
    reference: paymentData.reference,
    status: 'completed',
    description: paymentData.description || `${paymentData.paymentType.replace('_', ' ')} payment for PO`,
    paymentDate: new Date().toISOString()
  }] : [],
}


      console.log('FORM: About to call createPurchaseOrder API with data:', JSON.stringify(purchaseOrderData, null, 2));
      const apiResponse = await createPurchaseOrder(purchaseOrderData)
      console.log('FORM: API response received:', JSON.stringify(apiResponse, null, 2));
      console.log('FORM: Purchase order created successfully with ID:', apiResponse?.data?.purchaseOrder?._id);
      
      toast({
        title: "Success",
        description: paymentData.makePayment
          ? `Purchase order created and ${paymentData.paymentType.replace('_', ' ')} payment of $${paymentData.amount} recorded`
          : sendToSupplier ? "Purchase order created and sent to supplier" : "Purchase order saved successfully",
      })
      
      console.log('FORM: About to navigate back to order detail page');
      navigate(`/orders/${id}`)
      console.log('FORM: Navigation completed');
    } catch (error) {
      console.error('FORM: Error creating purchase order:', error)
      console.error('FORM: Error details:', error);
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      console.log('FORM: Loading state set to false');
    }
  }

  const PhotoUpload = ({ index }: { index: number }) => {
    const [photo, setPhoto] = useState<string>('')

    const onDrop = (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          setPhoto(result)
          setValue(`items.${index}.photo`, result)
        }
        reader.readAsDataURL(file)
      }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.webp']
      },
      maxFiles: 1,
      maxSize: 5 * 1024 * 1024 // 5MB
    })

    return (
      <div className="flex flex-col items-center space-y-2">
        {photo ? (
          <div className="relative">
            <img src={photo} alt="Product" className="w-20 h-20 object-cover rounded-lg border" />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 p-0"
              onClick={() => {
                setPhoto('')
                setValue(`items.${index}.photo`, '')
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors",
              isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-6 h-6 text-slate-400" />
          </div>
        )}
      </div>
    )
  }

  const totalAmount = watchedItems?.reduce((sum, item) => sum + (item.total || 0), 0) || 0

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(`/orders/${id}`)} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Purchase Order</h1>
          <p className="text-slate-600 dark:text-slate-400">Order #{id} - {order.projectName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-6">
        {/* Order Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-slate-900">Purchase Order Information</CardTitle>
            <CardDescription>Basic information for this purchase order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Master Order</Label>
                <Input value={`#${order._id} - ${order.projectName}`} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Client</Label>
                <Input value={order.clientName} disabled className="bg-slate-50" />
              </div>
            </div>

            {/* Supplier Selection */}
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <div className="flex space-x-2">
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl">
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier._id} value={supplier._id}>
                        {supplier.supplierName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      New Supplier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/95 backdrop-blur-xl">
                    <DialogHeader>
                      <DialogTitle>Add New Supplier</DialogTitle>
                      <DialogDescription>Create a new supplier for this purchase order</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSupplierSubmit(onCreateSupplier)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="supplierName">Supplier Name *</Label>
                        <Input
                          {...registerSupplier('supplierName', { required: 'Supplier name is required' })}
                          placeholder="Enter supplier name"
                        />
                        {supplierErrors.supplierName && (
                          <p className="text-sm text-red-600">{supplierErrors.supplierName.message}</p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setSupplierDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600">
                          Save Supplier
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900">Product Details</CardTitle>
                <CardDescription>Add products with photos, descriptions, and pricing</CardDescription>
              </div>
              <Button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0, total: 0 })}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Photo</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Qty</TableHead>
                    <TableHead className="w-32">Unit Price</TableHead>
                    <TableHead className="w-32">Total</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <PhotoUpload index={index} />
                      </TableCell>
                      <TableCell>
                        <Input
                          {...register(`items.${index}.description`, { required: 'Description is required' })}
                          placeholder="Enter product description"
                        />
                        {errors.items?.[index]?.description && (
                          <p className="text-sm text-red-600 mt-1">{errors.items[index]?.description?.message}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          {...register(`items.${index}.quantity`, {
                            required: 'Quantity is required',
                            min: { value: 1, message: 'Quantity must be at least 1' }
                          })}
                          type="number"
                          min="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          {...register(`items.${index}.unitPrice`, {
                            required: 'Unit price is required',
                            min: { value: 0, message: 'Price must be positive' }
                          })}
                          type="number"
                          step="0.01"
                          min="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={`$${(watchedItems?.[index]?.total || 0).toFixed(2)}`}
                          disabled
                          className="bg-slate-50"
                        />
                      </TableCell>
                      <TableCell>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Order Terms */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-slate-900">Order Terms</CardTitle>
            <CardDescription>Payment terms and delivery information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="COD">Cash on Delivery</SelectItem>
                    <SelectItem value="Prepaid">Prepaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Delivery Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deliveryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliveryDate ? format(deliveryDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={setDeliveryDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Total Amount */}
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-900">
                    Total Amount: ${totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Payment Options
            </CardTitle>
            <CardDescription>Record a payment for this purchase order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="makePayment"
                checked={paymentData.makePayment}
                onCheckedChange={(checked) => 
                  setPaymentData(prev => ({ ...prev, makePayment: checked as boolean }))
                }
              />
              <Label htmlFor="makePayment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Make a payment with this purchase order
              </Label>
            </div>

            {paymentData.makePayment && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentType">Payment Type *</Label>
                    <Select 
                      value={paymentData.paymentType} 
                      onValueChange={(value) => 
                        setPaymentData(prev => ({ ...prev, paymentType: value as 'advance' | 'down_payment' }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl">
                        <SelectItem value="advance">Advance Payment</SelectItem>
                        <SelectItem value="down_payment">Down Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Payment Amount *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={totalAmount}
                      value={paymentData.amount}
                      onChange={(e) => 
                        setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0.00"
                    />
                    {totalAmount > 0 && (
                      <p className="text-xs text-slate-500">
                        Maximum: ${totalAmount.toFixed(2)} ({((paymentData.amount / totalAmount) * 100).toFixed(1)}% of total)
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select 
                      value={paymentData.paymentMethod} 
                      onValueChange={(value) => 
                        setPaymentData(prev => ({ ...prev, paymentMethod: value as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl">
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="wire">Wire Transfer</SelectItem>
                        <SelectItem value="ach">ACH</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentReference">Reference</Label>
                    <Input
                      value={paymentData.reference}
                      onChange={(e) => 
                        setPaymentData(prev => ({ ...prev, reference: e.target.value }))
                      }
                      placeholder="Payment reference"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDescription">Description</Label>
                  <Input
                    value={paymentData.description}
                    onChange={(e) => 
                      setPaymentData(prev => ({ ...prev, description: e.target.value }))
                    }
                    placeholder={`${paymentData.paymentType.replace('_', ' ')} payment for purchase order`}
                  />
                </div>

                {paymentData.amount > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-green-800 font-medium">
                        Payment Summary: ${paymentData.amount.toFixed(2)} {paymentData.paymentType.replace('_', ' ')} via {paymentData.paymentMethod.replace('_', ' ')}
                      </p>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Remaining balance: ${(totalAmount - paymentData.amount).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/orders/${id}`)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={handleSubmit((data) => onSubmit(data, true))}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Sending...' : 'Save & Send'}
          </Button>
        </div>
      </form>
    </div>
  )
}