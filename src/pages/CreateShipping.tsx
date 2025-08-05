import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { createShippingCompany, createShippingInvoice, getShippingCompanies } from '@/api/shipping';
import { useInvoiceStore } from "../../store/invoiceStore"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, CalendarIcon, Save } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImagePlaceholder } from '@/components/ImagePlaceholder';

interface ShippingCompany {
  _id: string;
  companyName: string;
}

interface CreateShippingFormData {
  shippingCompanyName: string;
  trackingNumber: string;
  shippingMethod: string;
  expectedDelivery?: Date;
  freightCharges: number;
  insurance: number;
  handlingFees: number;
  paymentMethod: string;
  selectedItems: string[];
}

interface CreateCompanyFormData {
  companyName: string;
}

export function CreateShipping() {
  const { invoices } = useInvoiceStore();
  const { id: orderId } = useParams<{ id: string }>();
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [expectedDelivery, setExpectedDelivery] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue, 
    watch,
  } = useForm<CreateShippingFormData>({
    defaultValues: {
      freightCharges: 0,
      insurance: 0,
      handlingFees: 0,
      paymentMethod: 'client_direct',
      selectedItems: []
    }
  });

  const { 
    register: registerCompany, 
    handleSubmit: handleCompanySubmit, 
    reset: resetCompany,
    formState: { errors: companyErrors }
  } = useForm<CreateCompanyFormData>();

  const watchedCharges = watch(['freightCharges', 'insurance', 'handlingFees']);
  const totalShippingCost = watchedCharges.reduce((sum, charge) => sum + (Number(charge) || 0), 0);

  // Get order-specific invoices and flatten items
  const allInvoiceItems = invoices.flatMap(invoice => 
    invoice.items.map(item => ({
      ...item,
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName
    }))
  );

  console.log(`allInvoiceItems`, allInvoiceItems)

  const handleItemSelect = (invoiceId: string, isChecked: boolean) => {
    setValue('selectedItems', isChecked 
      ? [...watch('selectedItems'), invoiceId]
      : watch('selectedItems').filter(id => id !== invoiceId)
    );
  };

  useEffect(() => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "No order ID provided",
        variant: "destructive",
      });
      navigate('/orders');
      return;
    }

    const fetchCompanies = async () => {
      try {
        const data = await getShippingCompanies();
        setCompanies(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load shipping companies",
          variant: "destructive",
        });
      }
    };
    fetchCompanies();
  }, [orderId, toast, navigate]);

const onSubmit = async (data: CreateShippingFormData) => {
  try {
    if (!data.selectedItems || data.selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one invoice",
        variant: "destructive",
      });
      return;
    }

    if (!expectedDelivery) {
      toast({
        title: "Error",
        description: "Please select expected delivery date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const selectedInvoicesItems = allInvoiceItems.filter(item => 
      data.selectedItems.includes(item.invoiceId)
    );

    const shippingData = {
       orderId: orderId,
      InvoiceId: data.selectedItems[0],
      shippingCompanyName: data.shippingCompanyName,
      trackingNumber: data.trackingNumber,
      shippingMethod: data.shippingMethod,
      expectedDelivery: expectedDelivery.toISOString(),
      freightCharges: data.freightCharges,
      insurance: data.insurance,
      handlingFees: data.handlingFees,
      totalShippingCost: totalShippingCost,
      paymentMethod: data.paymentMethod,
      items: selectedInvoicesItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        photo: item.photo || '',
        weight: item.weight || 0,
        volume: item.volume || 0,
        unitPrice: item.unitPrice
      }))
    };

    await createShippingInvoice(shippingData);

    toast({ 
      title: "Success", 
      description: "Shipping invoice created successfully" 
    });
    
    // تأخير التوجيه لمدة 2 ثانية للسماح برؤية رسالة النجاح
    setTimeout(() => {
      navigate(`/orders/${orderId}`);
    }, 2000);
    
  } catch (error: any) {
    console.error("Error during submission:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to create shipping invoice",
      variant: "destructive",
    });
    setLoading(false); // تأكد من إعادة تعيين حالة التحميل عند الخطأ
  }
};

  const onCreateCompany = async (data: CreateCompanyFormData) => {
    try {
      const response = await createShippingCompany(data);
      setCompanies(prev => [...prev, response]);
      setValue('shippingCompanyName', response.companyName);
      setCompanyDialogOpen(false);
      resetCompany();
      toast({
        title: "Success",
        description: "Shipping company created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create shipping company",
        variant: "destructive",
      });
    }
  };

  if (!orderId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(`/orders/${orderId}`)} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create Shipping Invoice</h1>
          <p className="text-slate-600">Order #{orderId}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
            <CardDescription>Basic information for this shipping invoice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Shipping Company *</Label>
              <div className="flex space-x-2">
                <Select 
                  onValueChange={(value) => setValue('shippingCompanyName', value)}
                  required
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a shipping company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company._id} value={company.companyName}>
                        {company.companyName}
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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Shipping Company</DialogTitle>
                      <DialogDescription>Create a new shipping company</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCompanySubmit(onCreateCompany)} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Company Name *</Label>
                        <Input
                          {...registerCompany('companyName', { 
                            required: 'Company name is required' 
                          })}
                          placeholder="Enter company name"
                        />
                        {companyErrors.companyName && (
                          <p className="text-sm text-red-600">{companyErrors.companyName.message}</p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save Company</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {errors.shippingCompanyName && (
                <p className="text-sm text-red-600">Please select a shipping company</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking Number *</Label>
                <Input
                  {...register('trackingNumber', { required: 'Tracking number is required' })}
                  placeholder="Enter tracking number"
                />
                {errors.trackingNumber && (
                  <p className="text-sm text-red-600">{errors.trackingNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingMethod">Shipping Method *</Label>
                <Select 
                  onValueChange={(value) => setValue('shippingMethod', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shipping method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Air Freight">Air Freight</SelectItem>
                    <SelectItem value="Sea Freight">Sea Freight</SelectItem>
                    <SelectItem value="Express">Express</SelectItem>
                    <SelectItem value="Ground">Ground</SelectItem>
                  </SelectContent>
                </Select>
                {errors.shippingMethod && (
                  <p className="text-sm text-red-600">Please select a shipping method</p>
                )}
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
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expectedDelivery}
                      onSelect={setExpectedDelivery}
                      initialFocus
                      fromDate={new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices to Ship</CardTitle>
            <CardDescription>Select invoices to include in this shipment</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Photo</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>quantity</TableHead>
                      <TableHead>unitPrice</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
            {allInvoiceItems.map((item) => (
  <TableRow key={`${item.invoiceId}-${item._id}`}>
    <TableCell>
      <Checkbox
        checked={watch('selectedItems').includes(item.invoiceId)}
        onCheckedChange={(checked) => 
          handleItemSelect(item.invoiceId, checked as boolean)
        }
      />
    </TableCell>
    <TableCell className="font-medium">
                <ImagePlaceholder
                                          src={item.photo}
                                          alt="Product"
                                          className="w-16 h-16 rounded"
                                          fallbackText="Product"
                                        />
    </TableCell>
    <TableCell className="font-medium">{item.invoiceId}</TableCell>
    <TableCell>{item.clientName}</TableCell>
    <TableCell>{item.quantity}</TableCell> {/* لأن كل صف يمثل صنف واحد */}
    <TableCell>{item.unitPrice}</TableCell> {/* لأن كل صف يمثل صنف واحد */}
    <TableCell className="text-right">${item.total?.toFixed(2)}</TableCell>
  </TableRow>
))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">No invoices found for this order</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Shipping costs and payment method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="freightCharges">Freight Charges ($)</Label>
                <Input
                  {...register('freightCharges', { 
                    min: { value: 0, message: 'Must be positive number' },
                    valueAsNumber: true
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                {errors.freightCharges && (
                  <p className="text-sm text-red-600">{errors.freightCharges.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance ($)</Label>
                <Input
                  {...register('insurance', { 
                    min: { value: 0, message: 'Must be positive number' },
                    valueAsNumber: true
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                {errors.insurance && (
                  <p className="text-sm text-red-600">{errors.insurance.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="handlingFees">Handling Fees ($)</Label>
                <Input
                  {...register('handlingFees', { 
                    min: { value: 0, message: 'Must be positive number' },
                    valueAsNumber: true
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                {errors.handlingFees && (
                  <p className="text-sm text-red-600">{errors.handlingFees.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Payment Method *</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="client_direct"
                    value="client_direct"
                    {...register('paymentMethod', { required: 'Payment method is required' })}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="client_direct">Client pays directly to shipping company</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="agency_bills"
                    value="agency_bills"
                    {...register('paymentMethod')}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="agency_bills">Agency pays and bills client (no markup)</Label>
                </div>
              </div>
              {errors.paymentMethod && (
                <p className="text-sm text-red-600">{errors.paymentMethod.message}</p>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="text-right space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span>${totalShippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Shipping Cost:</span>
                    <span>${totalShippingCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/orders/${orderId}`)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Shipping Invoice
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}