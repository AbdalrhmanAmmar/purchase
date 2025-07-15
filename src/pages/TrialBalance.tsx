import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTrialBalance, TrialBalance as TrialBalanceType } from "@/api/accounting"
import { useToast } from "@/hooks/useToast"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Download, BarChart3, TrendingUp, TrendingDown } from "lucide-react"

export function TrialBalance() {
  const [trialBalance, setTrialBalance] = useState<TrialBalanceType[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTrialBalance = async () => {
      try {
        console.log('Fetching trial balance...')
        const response = await getTrialBalance() as { trialBalance: TrialBalanceType[] }
        setTrialBalance(response.trialBalance)
        console.log('Trial balance loaded successfully')
      } catch (error) {
        console.error('Error fetching trial balance:', error)
        toast({
          title: "Error",
          description: "Failed to load trial balance",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTrialBalance()
  }, [toast])

  const totalDebits = trialBalance.reduce((sum, account) => sum + account.debitBalance, 0)
  const totalCredits = trialBalance.reduce((sum, account) => sum + account.creditBalance, 0)
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'asset':
      case 'expense':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'liability':
      case 'equity':
      case 'revenue':
        return <TrendingDown className="w-4 h-4 text-blue-600" />
      default:
        return <BarChart3 className="w-4 h-4 text-slate-600" />
    }
  }

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
              {[...Array(8)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Trial Balance</h1>
          <p className="text-slate-600 dark:text-slate-400">Summary of all account balances as of today</p>
        </div>
        <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Balance Status */}
      <Card className={`bg-white/80 backdrop-blur-sm border-slate-200/50 ${isBalanced ? 'border-green-200' : 'border-red-200'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isBalanced ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <BarChart3 className={`w-6 h-6 ${isBalanced ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Trial Balance {isBalanced ? 'Balanced' : 'Unbalanced'}
                </h3>
                <p className={`text-sm ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  {isBalanced
                    ? 'All debits and credits are balanced'
                    : `Difference: $${Math.abs(totalDebits - totalCredits).toFixed(2)}`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">As of</div>
              <div className="font-medium text-slate-900">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trial Balance Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-slate-900">Account Balances</CardTitle>
          <CardDescription>All accounts with their debit and credit balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account #</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Debit Balance</TableHead>
                  <TableHead className="text-right">Credit Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalance.map((account) => (
                  <TableRow key={account.accountId} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">{account.accountNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getAccountTypeIcon(account.accountType)}
                        <span>{account.accountName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{account.accountType}</TableCell>
                    <TableCell className="text-right font-medium">
                      {account.debitBalance > 0 ? (
                        <span className="text-slate-900">${account.debitBalance.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {account.creditBalance > 0 ? (
                        <span className="text-slate-900">${account.creditBalance.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Totals Row */}
                <TableRow className="border-t-2 border-slate-300 bg-slate-50/50">
                  <TableCell colSpan={3} className="font-bold text-slate-900">
                    TOTALS
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    ${totalDebits.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    ${totalCredits.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Debits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${totalDebits.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${totalCredits.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className={`bg-white/80 backdrop-blur-sm border-slate-200/50 ${
          isBalanced ? 'border-green-200' : 'border-red-200'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Difference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              isBalanced ? 'text-green-600' : 'text-red-600'
            }`}>
              ${Math.abs(totalDebits - totalCredits).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}