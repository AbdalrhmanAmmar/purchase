import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"

export function Invoices() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Invoices</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage sales invoices and billing</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Generate Invoice
        </Button>
      </div>

      {/* Coming Soon */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
        <CardContent className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Invoice Management</h3>
          <p className="text-slate-600 mb-4">
            Invoice management features are coming soon. You can generate invoices from individual orders.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}