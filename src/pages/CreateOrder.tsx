import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createOrder, CreateOrderData } from "@/api/orders"
import { getClients, createClient, Client, CreateClientData } from "@/api/clients"
import { useToast } from "@/hooks/useToast"
import { useNavigate } from "react-router-dom"
import { CalendarIcon, Plus, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useEffect } from 'react'

export function CreateOrder() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [workflowType, setWorkflowType] = useState<'fast-track' | 'standard'>('fast-track')
  const [expectedDelivery, setExpectedDelivery] = useState<Date>()
  const [loading, setLoading] = useState(false)
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateOrderData>()
  const { register: registerClient, handleSubmit: handleClientSubmit, formState: { errors: clientErrors }, reset: resetClient } = useForm<CreateClientData>()

  useEffect(() => {
    const fetchClients = async () => {
      try {
        console.log('Fetching clients for order creation...')
        const response = await getClients() as { clients: Client[] }
        setClients(response.clients)
        console.log('Clients loaded successfully:', response.clients.length)
      } catch (error) {
        console.error('Error fetching clients:', error)
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive",
        })
      }
    }

    fetchClients()
  }, [toast])

  const onSubmit = async (data: CreateOrderData) => {
    if (!selectedClient) {
      toast({
        title: "Error",
        description: "Please select a client",
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

    setLoading(true)
    try {
      console.log('Creating new order...')
      const orderData = {
        ...data,
        clientId: selectedClient,
        workflowType,
        expectedDelivery: expectedDelivery.toISOString(),
      }

      const response = await createOrder(orderData) as { order: { _id: string } }
      console.log('Order created successfully')
      toast({
        title: "Success",
        description: "Order created successfully",
      })
      // Redirect to the newly created order
      navigate(`/orders/${response.order._id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onCreateClient = async (data: CreateClientData) => {
    try {
      console.log('Creating new client...')
      const response = await createClient(data) as { client: Client }
      setClients(prev => [...prev, response.client])
      setSelectedClient(response.client._id)
      setClientDialogOpen(false)
      resetClient()
      console.log('Client created successfully')
      toast({
        title: "Success",
        description: "Client created successfully",
      })
    } catch (error) {
      console.error('Error creating client:', error)
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/orders')} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create New Order</h1>
          <p className="text-slate-600 dark:text-slate-400">Set up a new order for your client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-slate-900">Order Information</CardTitle>
            <CardDescription>Basic information about the order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <div className="flex space-x-2">
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl">
                    {clients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.companyName} - {client.contactPerson}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      New Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/95 backdrop-blur-xl">
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                      <DialogDescription>Create a new client for this order</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleClientSubmit(onCreateClient)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          {...registerClient('companyName', { required: 'Company name is required' })}
                          placeholder="Enter company name"
                        />
                        {clientErrors.companyName && (
                          <p className="text-sm text-red-600">{clientErrors.companyName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input
                          {...registerClient('contactPerson')}
                          placeholder="Enter contact person name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          {...registerClient('email')}
                          type="email"
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          {...registerClient('phone')}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select onValueChange={(value) => setValue('country', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-xl">
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="CN">China</SelectItem>
                            <SelectItem value="JP">Japan</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setClientDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600">
                          Save Client
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Workflow Type */}
            <div className="space-y-3">
              <Label>Workflow Type *</Label>
              <RadioGroup value={workflowType} onValueChange={(value) => setWorkflowType(value as 'fast-track' | 'standard')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fast-track" id="fast-track" />
                  <Label htmlFor="fast-track" className="cursor-pointer">
                    <div>
                      <div className="font-medium">Fast Track</div>
                      <div className="text-sm text-slate-500">Urgent orders, known suppliers</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="cursor-pointer">
                    <div>
                      <div className="font-medium">Standard Track</div>
                      <div className="text-sm text-slate-500">Complex projects, quotations needed</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                {...register('projectName', { required: 'Project name is required' })}
                placeholder="Enter project name"
              />
              {errors.projectName && (
                <p className="text-sm text-red-600">{errors.projectName.message}</p>
              )}
            </div>

            {/* Expected Delivery */}
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

            {/* Currency and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select onValueChange={(value) => setValue('currency', value)} defaultValue="USD">
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl">
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select onValueChange={(value) => setValue('priority', value as any)} defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Commission Rate */}
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                {...register('commissionRate', { 
                  required: 'Commission rate is required',
                  min: { value: 0, message: 'Commission rate must be positive' },
                  max: { value: 100, message: 'Commission rate cannot exceed 100%' }
                })}
                type="number"
                step="0.1"
                placeholder="Enter commission rate"
              />
              {errors.commissionRate && (
                <p className="text-sm text-red-600">{errors.commissionRate.message}</p>
              )}
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements & Specifications *</Label>
              <Textarea
                {...register('requirements', { required: 'Requirements are required' })}
                placeholder="Enter detailed requirements and specifications"
                rows={4}
              />
              {errors.requirements && (
                <p className="text-sm text-red-600">{errors.requirements.message}</p>
              )}
            </div>

            {/* Special Instructions */}
            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                {...register('specialInstructions')}
                placeholder="Enter any special instructions or notes"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/orders')}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            {loading ? 'Creating...' : 'Save & Continue'}
          </Button>
        </div>
      </form>
    </div>
  )
}