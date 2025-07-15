import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getBankAccounts, getBankTransactions, sendMoney, receiveMoney, getCustomerBalances, getSupplierBalances, BankAccount, BankTransaction, SendMoneyData, ReceiveMoneyData, CustomerBalance, SupplierBalance } from "@/api/banking"
import { getClients, Client } from "@/api/clients"
import { getSuppliers, Supplier } from "@/api/suppliers"
import { useToast } from "@/hooks/useToast"
import { useForm } from 'react-hook-form'
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Users,
  Factory,
  Plus,
  Search,
  Filter,
  Eye,
  Send,
  Download
} from "lucide-react"

export function Banking() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [customerBalances, setCustomerBalances] = useState<CustomerBalance[]>([])
  const [supplierBalances, setSupplierBalances] = useState<SupplierBalance[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [sendMoneyDialogOpen, setSendMoneyDialogOpen] = useState(false)
  const [receiveMoneyDialogOpen, setReceiveMoneyDialogOpen] = useState(false)
  const { toast } = useToast()

  const { register: registerSend, handleSubmit: handleSendSubmit, formState: { errors: sendErrors }, reset: resetSend, setValue: setSendValue } = useForm<SendMoneyData>()
  const { register: registerReceive, handleSubmit: handleReceiveSubmit, formState: { errors: receiveErrors }, reset: resetReceive, setValue: setReceiveValue } = useForm<ReceiveMoneyData>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching banking data...')
        const [accountsResponse, customerBalancesResponse, supplierBalancesResponse, clientsResponse, suppliersResponse] = await Promise.all([
          getBankAccounts() as Promise<{ accounts: BankAccount[] }>,
          getCustomerBalances() as Promise<{ balances: CustomerBalance[] }>,
          getSupplierBalances() as Promise<{ balances: SupplierBalance[] }>,
          getClients() as Promise<{ clients: Client[] }>,
          getSuppliers() as Promise<{ suppliers: Supplier[] }>
        ])

        setAccounts(accountsResponse.accounts)
        setCustomerBalances(customerBalancesResponse.balances)
        setSupplierBalances(supplierBalancesResponse.balances)
        setClients(clientsResponse.clients)
        setSuppliers(suppliersResponse.suppliers)

        if (accountsResponse.accounts.length > 0) {
          setSelectedAccount(accountsResponse.accounts[0]._id)
        }

        console.log('Banking data loaded successfully')
      } catch (error) {
        console.error('Error fetching banking data:', error)
        toast({
          title: "Error",
          description: "Failed to load banking data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedAccount) return

      try {
        console.log('Fetching transactions for account:', selectedAccount)
        const response = await getBankTransactions(selectedAccount) as { transactions: BankTransaction[] }
        setTransactions(response.transactions)
        console.log('Transactions loaded successfully')
      } catch (error) {
        console.error('Error fetching transactions:', error)
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive",
        })
      }
    }

    fetchTransactions()
  }, [selectedAccount, toast])

  const onSendMoney = async (data: SendMoneyData) => {
    try {
      console.log('Sending money...')
      await sendMoney({ ...data, accountId: selectedAccount })
      setSendMoneyDialogOpen(false)
      resetSend()
      // Refresh transactions
      const response = await getBankTransactions(selectedAccount) as { transactions: BankTransaction[] }
      setTransactions(response.transactions)
      console.log('Money sent successfully')
      toast({
        title: "Success",
        description: "Payment initiated successfully",
      })
    } catch (error) {
      console.error('Error sending money:', error)
      toast({
        title: "Error",
        description: "Failed to send money",
        variant: "destructive",
      })
    }
  }

  const onReceiveMoney = async (data: ReceiveMoneyData) => {
    try {
      console.log('Recording received money...')
      await receiveMoney({ ...data, accountId: selectedAccount })
      setReceiveMoneyDialogOpen(false)
      resetReceive()
      // Refresh transactions and customer balances
      const [transactionsResponse, balancesResponse] = await Promise.all([
        getBankTransactions(selectedAccount) as Promise<{ transactions: BankTransaction[] }>,
        getCustomerBalances() as Promise<{ balances: CustomerBalance[] }>
      ])
      setTransactions(transactionsResponse.transactions)
      setCustomerBalances(balancesResponse.balances)
      console.log('Money received successfully')
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      })
    } catch (error) {
      console.error('Error recording received money:', error)
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />
      case 'transfer':
        return <Send className="w-4 h-4 text-blue-600" />
      default:
        return <DollarSign className="w-4 h-4 text-slate-600" />
    }
  }

  const selectedAccountData = accounts.find(acc => acc._id === selectedAccount)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-slate-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Banking</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your bank accounts and transactions</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={receiveMoneyDialogOpen} onOpenChange={setReceiveMoneyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                Receive Money
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>Record Received Payment</DialogTitle>
                <DialogDescription>Record a payment received from a customer</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleReceiveSubmit(onReceiveMoney)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer *</Label>
                  <Select onValueChange={(value) => setReceiveValue('customerId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl">
                      {clients.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    {...registerReceive('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Amount must be positive' } })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                  {receiveErrors.amount && (
                    <p className="text-sm text-red-600">{receiveErrors.amount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    {...registerReceive('description', { required: 'Description is required' })}
                    placeholder="Payment description"
                  />
                  {receiveErrors.description && (
                    <p className="text-sm text-red-600">{receiveErrors.description.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select onValueChange={(value) => setReceiveValue('paymentMethod', value as any)}>
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
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    {...registerReceive('reference')}
                    placeholder="Payment reference"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setReceiveMoneyDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600">
                    Record Payment
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={sendMoneyDialogOpen} onOpenChange={setSendMoneyDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">
                <Send className="w-4 h-4 mr-2" />
                Send Money
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>Send Money</DialogTitle>
                <DialogDescription>Send payment to a customer or supplier</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendSubmit(onSendMoney)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientType">Recipient Type *</Label>
                  <Select onValueChange={(value) => setSendValue('recipientType', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl">
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientId">Recipient *</Label>
                  <Select onValueChange={(value) => setSendValue('recipientId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl">
                      {clients.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.companyName} (Customer)
                        </SelectItem>
                      ))}
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier._id} value={supplier._id}>
                          {supplier.supplierName} (Supplier)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    {...registerSend('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Amount must be positive' } })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                  {sendErrors.amount && (
                    <p className="text-sm text-red-600">{sendErrors.amount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    {...registerSend('description', { required: 'Description is required' })}
                    placeholder="Payment description"
                  />
                  {sendErrors.description && (
                    <p className="text-sm text-red-600">{sendErrors.description.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select onValueChange={(value) => setSendValue('paymentMethod', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl">
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="wire">Wire Transfer</SelectItem>
                      <SelectItem value="ach">ACH</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    {...registerSend('reference')}
                    placeholder="Payment reference"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setSendMoneyDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600">
                    Send Payment
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Account Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {accounts.map((account) => (
          <Card
            key={account._id}
            className={`bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer ${
              selectedAccount === account._id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedAccount(account._id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{account.accountName}</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">${account.balance.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">{account.bankName} • {account.accountNumber}</p>
              <Badge variant="outline" className="mt-2 text-xs">
                {account.accountType}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="customers">Customer Balances</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">
                    {selectedAccountData ? `${selectedAccountData.accountName} Transactions` : 'Transactions'}
                  </CardTitle>
                  <CardDescription>Recent transactions for the selected account</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction._id} className="hover:bg-slate-50/50">
                        <TableCell>{new Date(transaction.transactionDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTransactionIcon(transaction.transactionType)}
                            <span className="capitalize">{transaction.transactionType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                        <TableCell>{transaction.reference || '-'}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          transaction.transactionType === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transactionType === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">${transaction.balance.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(transaction.status)}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Customer Balances
              </CardTitle>
              <CardDescription>Outstanding balances and payment history for customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Total Invoiced</TableHead>
                      <TableHead className="text-right">Total Paid</TableHead>
                      <TableHead className="text-right">Outstanding Balance</TableHead>
                      <TableHead>Last Payment</TableHead>
                      <TableHead className="text-right">Last Payment Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerBalances.map((balance) => (
                      <TableRow key={balance._id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-slate-500" />
                            <span className="font-medium">{balance.customerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${balance.totalInvoiced.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-green-600">${balance.totalPaid.toLocaleString()}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          balance.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ${balance.outstandingBalance.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {balance.lastPaymentDate ? new Date(balance.lastPaymentDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {balance.lastPaymentAmount ? `$${balance.lastPaymentAmount.toLocaleString()}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <Factory className="w-5 h-5 mr-2 text-green-600" />
                Supplier Balances
              </CardTitle>
              <CardDescription>Outstanding balances and payment history for suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Total Invoiced</TableHead>
                      <TableHead className="text-right">Total Paid</TableHead>
                      <TableHead className="text-right">Outstanding Balance</TableHead>
                      <TableHead>Last Payment</TableHead>
                      <TableHead className="text-right">Last Payment Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierBalances.map((balance) => (
                      <TableRow key={balance._id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Factory className="w-4 h-4 text-slate-500" />
                            <span className="font-medium">{balance.supplierName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${balance.totalInvoiced.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-green-600">${balance.totalPaid.toLocaleString()}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          balance.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ${balance.outstandingBalance.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {balance.lastPaymentDate ? new Date(balance.lastPaymentDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {balance.lastPaymentAmount ? `$${balance.lastPaymentAmount.toLocaleString()}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}