// stores/invoiceStore.ts
import { create } from 'zustand';
import { Invoice } from '@/api/invoices';


interface InvoiceStore {
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  updateInvoice: (id: string, updatedInvoice: Partial<Invoice>) => void;
  addInvoice: (invoice: Invoice) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  invoices: [],
  setInvoices: (invoices) => set({ invoices }),
  updateInvoice: (id, updatedInvoice) => 
    set((state) => ({
      invoices: state.invoices.map(inv => 
        inv._id === id ? { ...inv, ...updatedInvoice } : inv
      )
    })),
  addInvoice: (invoice) => 
    set((state) => ({ invoices: [...state.invoices, invoice] }))
}));