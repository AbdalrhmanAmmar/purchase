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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getTransactions, createTransaction, getAccounts, Transaction, CreateTransactionData, Account, TransactionEntry } from "@/api/accounting"
import { useToast } from "@/hooks/useToast"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Search, CalendarIcon, Receipt, X, DollarSign } from "lucide-react"
import { useForm, useFieldArray } from 'react-hook-form'
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function JournalEntries() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const { toast } = useToast()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, control } = useForm<CreateTransactionData>({
    defaultValues: {
      entries: [
        { accountId: '', debit: 0, credit: 0, description: '' },
        { accountId: '', debit: 0, credit: 0, description: '' }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries"
  })

  const watchedEntries = watch("entries")

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching transactions and accounts...')
        const [transactionsResponse, accountsResponse] = await Promise.all([
          getTransactions() as Promise<{ transactions: Transaction[] }>,
          getAccounts() as Promise<{ accounts: Account[] }>
        ])
        setTransactions(transactionsResponse.transactions)
        setAccounts(accountsResponse.accounts)
        console.log('Data loaded successfully')
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const onSubmit = async (data: CreateTransactionData) => {
    // Validate that debits equal credits
    const totalDebits = data.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0)
    const totalCredits = data.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0)

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      toast({
        title: "Error",
        description: "Total debits must equal total credits",
        variant: "destructive",
      })
      return
    }

    // Validate that each entry has either debit or credit (not both)
    const hasInvalidEntries = data.entries.some(entry =>
      (entry.debit > 0 && entry.credit > 0) || (entry.debit === 0 && entry.credit === 0)
    )

    if (hasInvalidEntries) {
      toast({
        title: "Error",
        description: "Each entry must have either a debit or credit amount (not both or neither)",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('Creating new transaction...')
      const transactionData = {
        ...data,
        date: selectedDate.toISOString().split('T')[0],
      }

      const response = await createTransaction(transactionData) as { transaction: Transaction }
      setTransactions(prev => [response.transaction, ...prev])
      setDialogOpen(false)
      reset()
      setSelectedDate(new Date())
      console.log('Transaction created successfully')
      toast({
        title: "Success",
        description: "Journal entry created successfully",
      })
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast({
        title: "Error",
        description: "Failed to create journal entry",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      posted: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalDebits = watchedEntries?.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0) || 0
  const totalCredits = watchedEntries?.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0) || 0
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Journal Entries</h1>
          <p className="text-slate-600 dark:text-slate-400">Record and manage financial transactions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-xl max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
              <DialogDescription>Record a new financial transaction with debits and credits</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Transaction Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    {...register('reference')}
                    placeholder="e.g., INV-001, ORDER-123"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Enter transaction description"
                  rows={2}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Journal Entries */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Journal Entries</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ accountId: '', debit: 0, credit: 0, description: '' })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-32">Debit</TableHead>
                        <TableHead className="w-32">Credit</TableHead>
                        <TableHead className="w-16">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <Select onValueChange={(value) => setValue(`entries.${index}.accountId`, value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                              <SelectContent className="bg-white/95 backdrop-blur-xl">
                                {accounts.map((account) => (
                                  <SelectItem key={account._id} value={account._id}>
                                    {account.accountNumber} - {account.accountName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              {...register(`entries.${index}.description`)}
                              placeholder="Entry description"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              {...register(`entries.${index}.debit`)}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              {...register(`entries.${index}.credit`)}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                            />
                          </TableCell>
                          <TableCell>
                            {fields.length > 2 && (
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

                {/* Totals */}
                <div className="flex justify-end space-x-8 p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm">
                    <span className="text-slate-600">Total Debits: </span>
                    <span className="font-medium">${totalDebits.toFixed(2)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600">Total Credits: </span>
                    <span className="font-medium">${totalCredits.toFixed(2)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600">Difference: </span>
                    <span className={`font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(totalDebits - totalCredits).toFixed(2)}
                    </span>
                  </div>
                </div>

                {!isBalanced && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Transaction is not balanced. Total debits must equal total credits.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isBalanced}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600"
                >
                  Create Entry
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
              placeholder="Search transactions by description, number, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-slate-900">Journal Entries ({filteredTransactions.length})</CardTitle>
          <CardDescription>All recorded financial transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Entries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction._id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">{transaction.transactionNumber}</TableCell>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                    <TableCell>{transaction.reference || '-'}</TableCell>
                    <TableCell className="font-medium">${transaction.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(transaction.status)}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {transaction.entries.map((entry, index) => (
                          <div key={entry._id} className="text-xs text-slate-600">
                            {entry.accountName}: {entry.debit > 0 ? `Dr $${entry.debit}` : `Cr $${entry.credit}`}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}