import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { 
  Calculator, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  DollarSign,
  PieChart,
  BarChart3,
  Receipt
} from "lucide-react"

export function Accounting() {
  const navigate = useNavigate()

  const accountingModules = [
    {
      title: "Chart of Accounts",
      description: "Manage your accounting structure",
      icon: Calculator,
      color: "from-blue-500 to-indigo-600",
      path: "/accounting/accounts"
    },
    {
      title: "Journal Entries",
      description: "Record financial transactions",
      icon: Receipt,
      color: "from-green-500 to-emerald-600",
      path: "/accounting/transactions"
    },
    {
      title: "Trial Balance",
      description: "View account balances summary",
      icon: BarChart3,
      color: "from-purple-500 to-pink-600",
      path: "/accounting/trial-balance"
    },
    {
      title: "Financial Statements",
      description: "Generate P&L and Balance Sheet",
      icon: FileText,
      color: "from-orange-500 to-red-600",
      path: "/accounting/statements"
    }
  ]

  const quickStats = [
    {
      title: "Total Assets",
      value: "$75,000",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Total Liabilities",
      value: "$15,000",
      icon: CreditCard,
      color: "text-red-600"
    },
    {
      title: "Net Income",
      value: "$33,000",
      icon: DollarSign,
      color: "text-blue-600"
    },
    {
      title: "Cash Balance",
      value: "$50,000",
      icon: PieChart,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Accounting</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your financial records and generate reports</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accounting Modules */}
      <div className="grid gap-6 md:grid-cols-2">
        {accountingModules.map((module, index) => (
          <Card 
            key={index} 
            className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => navigate(module.path)}
          >
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${module.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 group-hover:text-blue-600 transition-colors">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    {module.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full border-slate-200 hover:bg-slate-50 group-hover:border-blue-300 group-hover:text-blue-600 transition-all"
              >
                Open Module
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-slate-900">Recent Transactions</CardTitle>
          <CardDescription>Latest accounting activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Commission received</p>
                  <p className="text-xs text-slate-500">TXN-001 • Jan 15, 2024</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">+$2,500</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Office rent payment</p>
                  <p className="text-xs text-slate-500">TXN-002 • Jan 16, 2024</p>
                </div>
              </div>
              <span className="text-sm font-medium text-red-600">-$1,200</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/accounting/transactions')}
            >
              View All Transactions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}