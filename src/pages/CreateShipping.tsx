import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { createShippingCompany, createShippingInvoice } from '@/api/shipping';
import { getOrderById } from '@/api/orders';
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

interface ShippingCompany {
  _id: string;
  name: string;
}

interface CreateShippingFormData {
  shippingCompanyId: string;
  trackingNumber: string;
  shippingMethod: string;
  expectedDelivery: Date;
  freightCharges: number;
  insurance: number;
  handlingFees: number;
  paymentMethod: string;
}

interface CreateCompanyFormData {
  name: string;
}

export function CreateShipping() {
  const { id: orderId } = useParams<{ id: string }>();
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>([]);
  const [expectedDelivery, setExpectedDelivery] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateShippingFormData>({
    defaultValues: {
      freightCharges: 0,
      insurance: 0,
      handlingFees: 0,
      paymentMethod: 'client_direct'
    }
  });

  const { register: registerCompany, handleSubmit: handleCompanySubmit, reset: resetCompany } = useForm<CreateCompanyFormData>();

  const watchedCharges = watch(['freightCharges', 'insurance', 'handlingFees']);
  const totalShippingCost = watchedCharges.reduce((sum, charge) => sum + (charge || 0), 0);

  const onSubmit = async (data: CreateShippingFormData) => {
    if (!expectedDelivery) {
      toast({
        title: "Error",
        description: "Please select expected delivery date",
        variant: "destructive",
      });
      return;
    }

    if (!orderId) return;

    setLoading(true);
    try {
      const shippingData = {
        ...data,
        orderId,
        expectedDelivery: expectedDelivery.toISOString(),
        totalShippingCost
      };

      await createShippingInvoice(shippingData);
      toast({
        title: "Success",
        description: "Shipping invoice created successfully",
      });
      navigate(`/orders/${orderId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shipping invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onCreateCompany = async (data: CreateCompanyFormData) => {
    try {
      const response = await createShippingCompany(data);
      setShippingCompanies(prev => [...prev, response.data]);
      setValue('shippingCompanyId', response.data._id);
      setCompanyDialogOpen(false);
      resetCompany();
      toast({
        title: "Success",
        description: "Shipping company created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shipping company",
        variant: "destructive",
      });
    }
  };

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
                <Select onValueChange={(value) => setValue('shippingCompanyId', value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a shipping company" />
                  </SelectTrigger>
                  <SelectContent>
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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Shipping Company</DialogTitle>
                      <DialogDescription>Create a new shipping company</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCompanySubmit(onCreateCompany)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Company Name *</Label>
                        <Input
                          {...registerCompany('name', { required: true })}
                          placeholder="Enter company name"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setCompanyDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Save Company
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking Number *</Label>
                <Input
                  {...register('trackingNumber', { required: true })}
                  placeholder="Enter tracking number"
                />
                {errors.trackingNumber && (
                  <p className="text-sm text-red-600">Tracking number is required</p>
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
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
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
                  {...register('freightCharges', { min: 0 })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance ($)</Label>
                <Input
                  {...register('insurance', { min: 0 })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="handlingFees">Handling Fees ($)</Label>
                <Input
                  {...register('handlingFees', { min: 0 })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="client_direct"
                    value="client_direct"
                    {...register('paymentMethod')}
                  />
                  <Label htmlFor="client_direct">Client pays directly to shipping company</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="agency_bills"
                    value="agency_bills"
                    {...register('paymentMethod')}
                  />
                  <Label htmlFor="agency_bills">Agency pays and bills client (no markup)</Label>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    Total Shipping Cost: ${totalShippingCost.toFixed(2)}
                  </p>
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
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}