import { HashRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardLayout } from "./components/DashboardLayout"
import { Dashboard } from "./pages/Dashboard"
import { Orders } from "./pages/Orders"
import { OrderDetail } from "./pages/OrderDetail"
import { CreateOrder } from "./pages/CreateOrder"
import { Clients } from "./pages/Clients"
import { CustomerDetail } from "./pages/CustomerDetail"
import { Suppliers } from "./pages/Suppliers"
import { SupplierDetail } from "./pages/SupplierDetail"
import { Invoices } from "./pages/Invoices"
import { Shipping } from "./pages/Shipping"
import { Reports } from "./pages/Reports"
import { Settings } from "./pages/Settings"
import { CreatePurchaseOrder } from "./pages/CreatePurchaseOrder"
import { CreateInvoice } from "./pages/CreateInvoice"
import { CreateShipping } from "./pages/CreateShipping"
import { Accounting } from "./pages/Accounting"
import { ChartOfAccounts } from "./pages/ChartOfAccounts"
import { JournalEntries } from "./pages/JournalEntries"
import { TrialBalance } from "./pages/TrialBalance"
import { FinancialStatements } from "./pages/FinancialStatements"
import { Banking } from "./pages/Banking"
import { BlankPage } from "./pages/BlankPage"
import { SeedData } from "./pages/SeedData"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/new" element={<CreateOrder />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="orders/:id/purchase-order" element={<CreatePurchaseOrder />} />
              <Route path="orders/:id/invoice" element={<CreateInvoice />} />
              <Route path="orders/:id/shipping" element={<CreateShipping />} />
              <Route path="clients" element={<Clients />} />
              <Route path="clients/:id" element={<CustomerDetail />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="suppliers/:id" element={<SupplierDetail />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="shipping" element={<Shipping />} />
              <Route path="reports" element={<Reports />} />
              <Route path="accounting" element={<Accounting />} />
              <Route path="accounting/accounts" element={<ChartOfAccounts />} />
              <Route path="accounting/transactions" element={<JournalEntries />} />
              <Route path="accounting/trial-balance" element={<TrialBalance />} />
              <Route path="accounting/statements" element={<FinancialStatements />} />
              <Route path="banking" element={<Banking />} />
              <Route path="seed-data" element={<SeedData />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<BlankPage />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App