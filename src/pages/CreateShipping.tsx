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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getOrderById, Order } from "@/api/orders"
import { getInvoicesByPurchaseId, Invoice } from "@/api/invoices"
import { ImagePlaceholder } from "@/components/ImagePlaceholder"
import { useToast } from "@/hooks/useToast"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Plus, CalendarIcon, Truck, Save, Send } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function CreateShipping() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [expectedDelivery, setExpectedDelivery] = useState<Date>()
  const [loading, setLoading] = useState(false)
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm<CreateShippingInvoiceData>({
    defaultValues: {
      items: [],
      freightCharges: 0,
      insurance: 0,
      handlingFees: 0,
      paymentMethod: 'client_direct'
    }
  })

  const { register: registerCompany, handleSubmit: handleCompanySubmit, formState: { errors: companyErrors }, reset: resetCompany } = useForm<CreateShippingCompanyData>()

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items"
  })

  const watchedItems = watch("items")
  const watchedCharges = watch(["freightCharges", "insurance", "handlingFees"])

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        console.log('Fetching order, invoices, and shipping companies for shipping creation...')
        const [orderResponse, invoicesResponse, companiesResponse] = await Promise.all([
          getOrderById(id) as Promise<{ order: Order }>,
          getInvoicesByPurchaseId(id) as Promise<{ invoices: Invoice[] }>,
          getShippingCompanies() as Promise<{ companies: ShippingCompany[] }>
        ])

        console.log(orderResponse.order)

        setOrder(orderResponse.order)
        setInvoices(invoicesResponse.invoices || [])
        setShippingCompanies(companiesResponse.companies)

        // Auto-populate items from invoices
        if (invoicesResponse.invoices && invoicesResponse.invoices.length > 0) {
          const allItems: ShippingItem[] = []
          invoicesResponse.invoices.forEach(invoice => {
            invoice.items.forEach(item => {
              allItems.push({
                _id: item._id,
                itemCode: item.itemCode,
                description: item.description,
                quantity: item.quantity,
                weight: 0, // Default weight, user can modify
                volume: 0, // Default volume, user can modify
                photo: item.photo
              })
            })
          })
          replace(allItems)
        }

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
  }, [id, toast, replace])

  const onCreateCompany = async (data: CreateShippingCompanyData) => {
    try {
      console.log('Creating new shipping company...')
      const response = await createShippingCompany(data) as { company: ShippingCompany }
      setShippingCompanies(prev => [...prev, response.company])
      setSelectedCompany(response.company._id)
      setCompanyDialogOpen(false)
      resetCompany()
      console.log('Shipping company created successfully')
      toast({
        title: "Success",
        description: "Shipping company created successfully",
      })
    } catch (error) {
      console.error('Error creating shipping company:', error)
      toast({
        title: "Error",
        description: "Failed to create shipping company",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: CreateShippingInvoiceData) => {
    if (!selectedCompany) {
      toast({
        title: "Error",
        description: "Please select a shipping company",
        variant: "destructive",
      })
      return
    }

    if (!expectedDelivery) {
      toast({
        title: "Error",
        description: "Please select expected delivery date",
        variant: "destructive",
      })
      return
    }

    if (!id) return

    setLoading(true)
    try {
      console.log('Creating shipping invoice...')
      const shippingData = {
        ...data,
        orderId: id,
        shippingCompanyId: selectedCompany,
        expectedDelivery: expectedDelivery.toISOString(),
      }

      await createShippingInvoice(shippingData)
      console.log('Shipping invoice created successfully')
      toast({
        title: "Success",
        description: "Shipping invoice created successfully",
      })
      navigate(`/orders/${id}`)
    } catch (error) {
      console.error('Error creating shipping invoice:', error)
      toast({
        title: "Error",
        description: "Failed to create shipping invoice",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalShippingCost = (watchedCharges[0] || 0) + (watchedCharges[1] || 0) + (watchedCharges[2] || 0)

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Shipping Invoice</h1>
          <p className="text-slate-600 dark:text-slate-400">Order #{id} - {order.projectName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-slate-900">Shipping Information</CardTitle>
            <CardDescription>Basic information for this shipping invoice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Related Order</Label>
                <Input value={`#${order._id} - ${order.projectName}`} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Client</Label>
                <Input value={order.clientName} disabled className="bg-slate-50" />
              </div>
            </div>

            {/* Shipping Company Selection */}
            <div className="space-y-2">
              <Label htmlFor="shippingCompany">Shipping Company *</Label>
              <div className="flex space-x-2">
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a shipping company" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl">
                    {shippingCompanies.map((company) => (
                      <SelectItem key={company._id} value={company._id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      New Company
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/95 backdrop-blur-xl">
                    <DialogHeader>
                      <DialogTitle>Add New Shipping Company</DialogTitle>
                      <DialogDescription>Create a new shipping company</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCompanySubmit(onCreateCompany)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Company Name *</Label>
                        <Input
                          {...registerCompany('name', { required: 'Company name is required' })}
                          placeholder="Enter company name"
                        />
                        {companyErrors.name && (
                          <p className="text-sm text-red-600">{companyErrors.name.message}</p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setCompanyDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600">
                          Save Company
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  {...register('trackingNumber')}
                  placeholder="Enter tracking number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingMethod">Shipping Method</Label>
                <Select onValueChange={(value) => setValue('shippingMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shipping method" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl">
                    <SelectItem value="Air Freight">Air Freight</SelectItem>
                    <SelectItem value="Sea Freight">Sea Freight</SelectItem>
                    <SelectItem value="Express">Express</SelectItem>
                    <SelectItem value="Ground">Ground</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expected Delivery *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expectedDelivery && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expectedDelivery ? format(expectedDelivery, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl">
                    <Calendar
                      mode="single"
                      selected={expectedDelivery}
                      onSelect={setExpectedDelivery}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items to Ship */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-slate-900">Items to Ship</CardTitle>
            <CardDescription>Items automatically loaded from sales invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {fields.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Photo</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-24">Quantity</TableHead>
                      <TableHead className="w-24">Weight (kg)</TableHead>
                      <TableHead className="w-24">Volume (m³)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <ImagePlaceholder
                            src={field.photo}
                            alt="Product"
                            className="w-16 h-16 rounded"
                            fallbackText="Product"
                          />
                        </TableCell>
                        <TableCell>{field.description}</TableCell>
                        <TableCell>
                          <Input
                            {...register(`items.${index}.quantity`, {
                              required: 'Quantity is required',
                              min: { value: 1, message: 'Quantity must be at least 1' }
                            })}
                            type="number"
                            min="1"
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            {...register(`items.${index}.weight`)}
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            {...register(`items.${index}.volume`)}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="w-20"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Truck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No items found. Create sales invoices first to populate shipping items.</p>
                <Button onClick={() => navigate(`/orders/${id}/invoice`)} variant="outline">
                  Create Sales Invoice
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-slate-900">Cost Breakdown</CardTitle>
            <CardDescription>Shipping costs and payment method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="freightCharges">Freight Charges ($)</Label>
                <Input
                  {...register('freightCharges', {
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance ($)</Label>
                <Input
                  {...register('insurance', {
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="handlingFees">Handling Fees ($)</Label>
                <Input
                  {...register('handlingFees', {
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup
                defaultValue="client_direct"
                onValueChange={(value) => setValue('paymentMethod', value as any)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client_direct" id="client_direct" />
                  <Label htmlFor="client_direct" className="cursor-pointer">
                    Client pays directly to shipping company
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="agency_bills" id="agency_bills" />
                  <Label htmlFor="agency_bills" className="cursor-pointer">
                    Agency pays and bills client (no markup)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="agency_markup" id="agency_markup" />
                  <Label htmlFor="agency_markup" className="cursor-pointer">
                    Agency pays and bills client (with markup)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prepaid_reimbursed" id="prepaid_reimbursed" />
                  <Label htmlFor="prepaid_reimbursed" className="cursor-pointer">
                    Prepaid by agency, reimbursed by client
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Total Cost */}
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-900">
                    Total Shipping Cost: ${totalShippingCost.toFixed(2)}
                  </p>
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
            disabled={loading || fields.length === 0}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  )
}