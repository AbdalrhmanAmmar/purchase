import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { getAccounts, createAccount, Account, CreateAccountData } from "@/api/accounting"
import { useToast } from "@/hooks/useToast"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Search, Calculator, TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react"
import { useForm } from 'react-hook-form'

export function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CreateAccountData>()

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        console.log('Fetching chart of accounts...')
        const response = await getAccounts() as { accounts: Account[] }
        setAccounts(response.accounts)
        console.log('Accounts loaded successfully:', response.accounts.length)
      } catch (error) {
        console.error('Error fetching accounts:', error)
        toast({
          title: "Error",
          description: "Failed to load accounts",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [toast])

  const onSubmit = async (data: CreateAccountData) => {
    try {
      console.log('Creating new account...')
      const response = await createAccount(data) as { account: Account }
      setAccounts(prev => [...prev, response.account])
      setDialogOpen(false)
      reset()
      console.log('Account created successfully')
      toast({
        title: "Success",
        description: "Account created successfully",
      })
    } catch (error) {
      console.error('Error creating account:', error)
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      })
    }
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'asset':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'liability':
        return <CreditCard className="w-4 h-4 text-red-600" />
      case 'equity':
        return <DollarSign className="w-4 h-4 text-blue-600" />
      case 'revenue':
        return <TrendingUp className="w-4 h-4 text-purple-600" />
      case 'expense':
        return <TrendingDown className="w-4 h-4 text-orange-600" />
      default:
        return <Calculator className="w-4 h-4 text-slate-600" />
    }
  }

  const getAccountTypeBadge = (type: string) => {
    const variants = {
      asset: 'bg-green-100 text-green-800 border-green-200',
      liability: 'bg-red-100 text-red-800 border-red-200',
      equity: 'bg-blue-100 text-blue-800 border-blue-200',
      revenue: 'bg-purple-100 text-purple-800 border-purple-200',
      expense: 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return variants[type as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.accountNumber.includes(searchTerm)
    const matchesType = typeFilter === 'all' || account.accountType === typeFilter
    return matchesSearch && matchesType && account.isActive
  })

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
                <div key={i} className="h-12 bg-slate-200 rounded animate-pulse"></div>
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
        <Button variant="ghost" onClick={() => navigate('/accounting')} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Chart of Accounts</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your accounting structure and account balances</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
              <DialogDescription>Create a new account in your chart of accounts</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    {...register('accountNumber', { required: 'Account number is required' })}
                    placeholder="e.g., 1000"
                  />
                  {errors.accountNumber && (
                    <p className="text-sm text-red-600">{errors.accountNumber.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type *</Label>
                  <Select onValueChange={(value) => setValue('accountType', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl">
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.accountType && (
                    <p className="text-sm text-red-600">{errors.accountType.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name *</Label>
                <Input
                  {...register('accountName', { required: 'Account name is required' })}
                  placeholder="Enter account name"
                />
                {errors.accountName && (
                  <p className="text-sm text-red-600">{errors.accountName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Balance *</Label>
                <Input
                  {...register('balance', { required: 'Balance is required' })}
                  placeholder="Enter account balance"
                  type="number"
                />
                {errors.balance && (
                  <p className="text-sm text-red-600">{errors.balance.message}</p>
                )}
              </div>
    
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  {...register('description')}
                  placeholder="Enter account description (optional)"
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600">
                  Create Account
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search accounts by name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="asset">Assets</SelectItem>
                <SelectItem value="liability">Liabilities</SelectItem>
                <SelectItem value="equity">Equity</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-slate-900">Accounts ({filteredAccounts.length})</CardTitle>
          <CardDescription>Your chart of accounts with current balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account #</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account._id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">{account.accountNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getAccountTypeIcon(account.accountType)}
                        <span>{account.accountName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAccountTypeBadge(account.accountType)}>
                        {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${Math.abs(account.balance).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">
                      {account.description || 'No description'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {['asset', 'liability', 'equity', 'revenue', 'expense'].map((type) => {
          const typeAccounts = filteredAccounts.filter(acc => acc.accountType === type)
          const totalBalance = typeAccounts.reduce((sum, acc) => sum + acc.balance, 0)
          
          return (
            <Card key={type} className="bg-white/80 backdrop-blur-sm border-slate-200/50">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  {getAccountTypeIcon(type)}
                  <CardTitle className="text-sm font-medium capitalize">{type}s</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  ${Math.abs(totalBalance).toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {typeAccounts.length} account{typeAccounts.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}