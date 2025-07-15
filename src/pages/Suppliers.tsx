import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getSuppliers, createSupplier, deleteSupplier, Supplier, CreateSupplierData } from "@/api/suppliers"
import { useToast } from "@/hooks/useToast"
import { Plus, Search, Building2, Factory, Eye, MoreVertical, Trash2, Edit } from "lucide-react"
import { useForm } from 'react-hook-form'
import { useNavigate } from "react-router-dom"

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateSupplierData>()

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        console.log('Fetching suppliers...')
        const response = await getSuppliers() as { suppliers: Supplier[] }
        setSuppliers(response.suppliers)
        console.log('Suppliers loaded successfully:', response.suppliers.length)
      } catch (error) {
        console.error('Error fetching suppliers:', error)
        toast({
          title: "Error",
          description: "Failed to load suppliers",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [toast])

  const onSubmit = async (data: CreateSupplierData) => {
    try {
      console.log('Creating new supplier...')
      const response = await createSupplier(data) as { supplier: Supplier }
      setSuppliers(prev => [...prev, response.supplier])
      setDialogOpen(false)
      reset()
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

  const handleDeleteSupplier = async (supplierId: string, supplierName: string) => {
    setDeletingId(supplierId)
    try {
      console.log('Deleting supplier...')
      await deleteSupplier(supplierId)
      setSuppliers(prev => prev.filter(supplier => supplier._id !== supplierId))
      console.log('Supplier deleted successfully')
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-slate-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Suppliers</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your supplier network</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>Create a new supplier profile</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier Name *</Label>
                <Input
                  {...register('supplierName', { required: 'Supplier name is required' })}
                  placeholder="Enter supplier name"
                />
                {errors.supplierName && (
                  <p className="text-sm text-red-600">{errors.supplierName.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
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

      {/* Search */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search suppliers by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier._id} className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Factory className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">{supplier.supplierName}</CardTitle>
                    <CardDescription>Supplier</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/suppliers/${supplier._id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white/95 backdrop-blur-xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{supplier.supplierName}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSupplier(supplier._id, supplier.supplierName)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deletingId === supplier._id}
                          >
                            {deletingId === supplier._id ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <p className="text-xs text-slate-500">
                  Added {new Date(supplier.createdAt).toLocaleDateString()}
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate(`/suppliers/${supplier._id}`)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && !loading && (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardContent className="text-center py-12">
            <Factory className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No suppliers found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm ? 'No suppliers match your search criteria.' : 'Get started by adding your first supplier.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-blue-500 to-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Supplier
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}