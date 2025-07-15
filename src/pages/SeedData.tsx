import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { Loader2, Database, Users, Building, Package, ShoppingCart } from 'lucide-react';
import { seedAdmin, seedClients, seedSuppliers, seedOrders, seedAll } from '@/api/seed';

export function SeedData() {
  const [loading, setLoading] = useState({
    admin: false,
    clients: false,
    suppliers: false,
    orders: false,
    all: false,
  });
  const { toast } = useToast();

  const handleSeedAdmin = async () => {
    setLoading(prev => ({ ...prev, admin: true }));
    try {
      const result = await seedAdmin();
      toast({
        title: 'Success',
        description: result.message,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, admin: false }));
    }
  };

  const handleSeedClients = async () => {
    setLoading(prev => ({ ...prev, clients: true }));
    try {
      const result = await seedClients();
      toast({
        title: 'Success',
        description: result.message,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  };

  const handleSeedSuppliers = async () => {
    setLoading(prev => ({ ...prev, suppliers: true }));
    try {
      const result = await seedSuppliers();
      toast({
        title: 'Success',
        description: result.message,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, suppliers: false }));
    }
  };

  const handleSeedOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }));
    try {
      const result = await seedOrders();
      toast({
        title: 'Success',
        description: result.message,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const handleSeedAll = async () => {
    setLoading(prev => ({ ...prev, all: true }));
    try {
      const result = await seedAll();
      toast({
        title: 'Success',
        description: result.message,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Database Seeding</h1>
        <p className="text-muted-foreground">
          Initialize your database with sample data for testing and development.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Admin User
            </CardTitle>
            <CardDescription>
              Create initial admin user (admin@example.com / admin123)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSeedAdmin} 
              disabled={loading.admin}
              className="w-full"
            >
              {loading.admin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Seed Admin User
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Sample Clients
            </CardTitle>
            <CardDescription>
              Create sample client companies with contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSeedClients} 
              disabled={loading.clients}
              className="w-full"
            >
              {loading.clients && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Seed Clients
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Sample Suppliers
            </CardTitle>
            <CardDescription>
              Create sample supplier companies for sourcing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSeedSuppliers} 
              disabled={loading.suppliers}
              className="w-full"
            >
              {loading.suppliers && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Seed Suppliers
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Sample Orders
            </CardTitle>
            <CardDescription>
              Create sample orders linked to existing clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSeedOrders} 
              disabled={loading.orders}
              className="w-full"
            >
              {loading.orders && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Seed Orders
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Seed All Data
            </CardTitle>
            <CardDescription>
              Create all sample data in the correct order (admin → clients → suppliers → orders)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSeedAll} 
              disabled={loading.all}
              className="w-full"
              variant="default"
            >
              {loading.all && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Seed All Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            1. <strong>Admin User:</strong> Creates admin@example.com with password "admin123"
          </p>
          <p className="text-sm text-muted-foreground">
            2. <strong>Clients:</strong> Creates 5 sample client companies with contact details
          </p>
          <p className="text-sm text-muted-foreground">
            3. <strong>Suppliers:</strong> Creates 6 sample supplier companies
          </p>
          <p className="text-sm text-muted-foreground">
            4. <strong>Orders:</strong> Creates 5 sample orders linked to existing clients
          </p>
          <p className="text-sm text-muted-foreground">
            5. <strong>Seed All:</strong> Runs all seeding operations in the correct sequence
          </p>
        </CardContent>
      </Card>
    </div>
  );
}