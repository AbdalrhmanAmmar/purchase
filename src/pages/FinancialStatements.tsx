import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getFinancialStatements, FinancialStatement } from "@/api/accounting"
import { useToast } from "@/hooks/useToast"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Download, FileText, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

export function FinancialStatements() {
  const [statements, setStatements] = useState<FinancialStatement | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStatements = async () => {
      try {
        console.log('Fetching financial statements...')
        const response = await getFinancialStatements() as { statements: FinancialStatement }
        setStatements(response.statements)
        console.log('Financial statements loaded successfully')
      } catch (error) {
        console.error('Error fetching financial statements:', error)
        toast({
          title: "Error",
          description: "Failed to load financial statements",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStatements()
  }, [toast])

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

  if (!statements) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/accounting')} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Financial Statements</h1>
          <p className="text-slate-600 dark:text-slate-400">Balance Sheet and Profit & Loss Statement</p>
        </div>
        <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${statements.assets.totalAssets.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Liabilities</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${statements.liabilities.totalLiabilities.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Equity</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${statements.equity.totalEquity.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Net Income</CardTitle>
            <FileText className={`h-4 w-4 ${statements.netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${statements.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(statements.netIncome).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Statements Tabs */}
      <Tabs defaultValue="balance-sheet" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
        </TabsList>

        <TabsContent value="balance-sheet" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Assets */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Assets
                </CardTitle>
                <CardDescription>What the company owns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Assets */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Current Assets</h4>
                  <div className="space-y-2">
                    {statements.assets.currentAssets.map((asset, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-slate-600">{asset.accountName}</span>
                        <span className="font-medium">${asset.balance.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed Assets */}
                {statements.assets.fixedAssets.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Fixed Assets</h4>
                    <div className="space-y-2">
                      {statements.assets.fixedAssets.map((asset, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-slate-600">{asset.accountName}</span>
                          <span className="font-medium">${asset.balance.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Assets</span>
                    <span>${statements.assets.totalAssets.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liabilities & Equity */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center">
                  <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                  Liabilities & Equity
                </CardTitle>
                <CardDescription>What the company owes and owns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Liabilities */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Current Liabilities</h4>
                  <div className="space-y-2">
                    {statements.liabilities.currentLiabilities.map((liability, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-slate-600">{liability.accountName}</span>
                        <span className="font-medium">${liability.balance.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Long-term Liabilities */}
                {statements.liabilities.longTermLiabilities.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Long-term Liabilities</h4>
                    <div className="space-y-2">
                      {statements.liabilities.longTermLiabilities.map((liability, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-slate-600">{liability.accountName}</span>
                          <span className="font-medium">${liability.balance.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Liabilities</span>
                    <span>${statements.liabilities.totalLiabilities.toLocaleString()}</span>
                  </div>
                </div>

                {/* Equity */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Equity</h4>
                  <div className="space-y-2">
                    {statements.equity.accounts.map((equity, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-slate-600">{equity.accountName}</span>
                        <span className="font-medium">${equity.balance.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Liabilities & Equity</span>
                    <span>${(statements.liabilities.totalLiabilities + statements.equity.totalEquity).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income-statement" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Profit & Loss Statement
              </CardTitle>
              <CardDescription>Revenue and expenses for the current period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Revenue */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Revenue</h4>
                <div className="space-y-2">
                  {statements.revenue.accounts.map((revenue, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-slate-600">{revenue.accountName}</span>
                      <span className="font-medium text-green-600">${revenue.balance.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Revenue</span>
                    <span className="text-green-600">${statements.revenue.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Expenses</h4>
                <div className="space-y-2">
                  {statements.expenses.accounts.map((expense, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-slate-600">{expense.accountName}</span>
                      <span className="font-medium text-red-600">${expense.balance.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Expenses</span>
                    <span className="text-red-600">${statements.expenses.totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Income */}
              <div className="border-t-2 border-slate-300 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Income</span>
                  <span className={statements.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {statements.netIncome >= 0 ? '+' : '-'}${Math.abs(statements.netIncome).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {statements.netIncome >= 0 ? 'Profit for the period' : 'Loss for the period'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}