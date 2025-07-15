import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '@/api/orders';
import { PurchaseOrder } from '@/api/purchaseOrders';
import { Invoice } from '@/api/invoices';
import { ShippingInvoice } from '@/api/shipping';

// Export Order Overview to Excel
export const exportOrderOverviewToExcel = (order: Order) => {
  const data = [
    ['Order ID', order._id],
    ['Client', order.clientName],
    ['Project Name', order.projectName],
    ['Workflow Type', order.workflowType],
    ['Status', order.status],
    ['Priority', order.priority],
    ['Commission Rate', `${order.commissionRate}%`],
    ['Currency', order.currency],
    ['Expected Delivery', new Date(order.expectedDelivery).toLocaleDateString()],
    ['Requirements', order.requirements],
    ['Special Instructions', order.specialInstructions || 'N/A'],
    ['Created At', new Date(order.createdAt).toLocaleDateString()],
    ['Updated At', new Date(order.updatedAt).toLocaleDateString()]
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Order Overview');
  XLSX.writeFile(wb, `Order_${order._id}_Overview.xlsx`);
};

// Export Order Overview to PDF
export const exportOrderOverviewToPDF = (order: Order) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(`Order #${order._id} - Overview`, 20, 20);
  
  const data = [
    ['Order ID', order._id],
    ['Client', order.clientName],
    ['Project Name', order.projectName],
    ['Workflow Type', order.workflowType],
    ['Status', order.status],
    ['Priority', order.priority],
    ['Commission Rate', `${order.commissionRate}%`],
    ['Currency', order.currency],
    ['Expected Delivery', new Date(order.expectedDelivery).toLocaleDateString()],
    ['Created At', new Date(order.createdAt).toLocaleDateString()],
    ['Updated At', new Date(order.updatedAt).toLocaleDateString()]
  ];

  autoTable(doc, {
    head: [['Field', 'Value']],
    body: data,
    startY: 30,
    theme: 'grid'
  });

  // Add requirements and special instructions as text
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(12);
  doc.text('Requirements:', 20, finalY);
  const splitRequirements = doc.splitTextToSize(order.requirements, 170);
  doc.text(splitRequirements, 20, finalY + 10);
  
  if (order.specialInstructions) {
    const reqHeight = splitRequirements.length * 5;
    doc.text('Special Instructions:', 20, finalY + 20 + reqHeight);
    const splitInstructions = doc.splitTextToSize(order.specialInstructions, 170);
    doc.text(splitInstructions, 20, finalY + 30 + reqHeight);
  }

  doc.save(`Order_${order._id}_Overview.pdf`);
};

// Export Purchase Orders to Excel
export const exportPurchaseOrdersToExcel = (purchaseOrders: PurchaseOrder[], orderId: string) => {
  const wb = XLSX.utils.book_new();

  purchaseOrders.forEach((po, index) => {
    const headerData = [
      ['Purchase Order ID', po._id],
      ['Supplier', po.supplierName],
      ['Payment Terms', po.paymentTerms],
      ['Delivery Date', new Date(po.deliveryDate).toLocaleDateString()],
      ['Status', po.status],
      ['Total Amount', `$${po.totalAmount.toFixed(2)}`],
      [''],
      ['Items:'],
      ['Description', 'Quantity', 'Unit Price', 'Total']
    ];

    const itemsData = po.items.map(item => [
      item.description,
      item.quantity,
      `$${item.unitPrice.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ]);

    const allData = [...headerData, ...itemsData];
    const ws = XLSX.utils.aoa_to_sheet(allData);
    XLSX.utils.book_append_sheet(wb, ws, `PO_${index + 1}`);
  });

  XLSX.writeFile(wb, `Order_${orderId}_PurchaseOrders.xlsx`);
};

// Export Purchase Orders to PDF
export const exportPurchaseOrdersToPDF = (purchaseOrders: PurchaseOrder[], orderId: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(`Order #${orderId} - Purchase Orders`, 20, 20);
  
  let currentY = 40;

  purchaseOrders.forEach((po, index) => {
    if (index > 0) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.text(`Purchase Order #${po._id}`, 20, currentY);
    currentY += 10;

    const headerData = [
      ['Supplier', po.supplierName],
      ['Payment Terms', po.paymentTerms],
      ['Delivery Date', new Date(po.deliveryDate).toLocaleDateString()],
      ['Status', po.status],
      ['Total Amount', `$${po.totalAmount.toFixed(2)}`]
    ];

    autoTable(doc, {
      head: [['Field', 'Value']],
      body: headerData,
      startY: currentY,
      theme: 'grid'
    });

    const itemsData = po.items.map(item => [
      item.description,
      item.quantity.toString(),
      `$${item.unitPrice.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Description', 'Quantity', 'Unit Price', 'Total']],
      body: itemsData,
      startY: (doc as any).lastAutoTable.finalY + 10,
      theme: 'grid'
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;
  });

  doc.save(`Order_${orderId}_PurchaseOrders.pdf`);
};

// Export Invoices to Excel
export const exportInvoicesToExcel = (invoices: Invoice[], orderId: string) => {
  const wb = XLSX.utils.book_new();

  invoices.forEach((invoice, index) => {
    const headerData = [
      ['Invoice ID', invoice._id],
      ['Client', invoice.clientName],
      ['Invoice Date', new Date(invoice.invoiceDate).toLocaleDateString()],
      ['Due Date', new Date(invoice.dueDate).toLocaleDateString()],
      ['Payment Terms', invoice.paymentTerms],
      ['Status', invoice.status],
      ['Subtotal', `$${invoice.subtotal.toFixed(2)}`],
      ['Commission Fee', `$${invoice.commissionFee.toFixed(2)}`],
      ['Commission Rate', `${invoice.commissionRate}%`],
      ['Total', `$${invoice.total.toFixed(2)}`],
      [''],
      ['Items:'],
      ['Description', 'Quantity', 'Unit Price', 'Total']
    ];

    const itemsData = invoice.items.map(item => [
      item.description,
      item.quantity,
      `$${item.unitPrice.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ]);

    const allData = [...headerData, ...itemsData];
    const ws = XLSX.utils.aoa_to_sheet(allData);
    XLSX.utils.book_append_sheet(wb, ws, `Invoice_${index + 1}`);
  });

  XLSX.writeFile(wb, `Order_${orderId}_Invoices.xlsx`);
};

// Export Invoices to PDF
export const exportInvoicesToPDF = (invoices: Invoice[], orderId: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(`Order #${orderId} - Sales Invoices`, 20, 20);
  
  let currentY = 40;

  invoices.forEach((invoice, index) => {
    if (index > 0) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.text(`Invoice #${invoice._id}`, 20, currentY);
    currentY += 10;

    const headerData = [
      ['Client', invoice.clientName],
      ['Invoice Date', new Date(invoice.invoiceDate).toLocaleDateString()],
      ['Due Date', new Date(invoice.dueDate).toLocaleDateString()],
      ['Payment Terms', invoice.paymentTerms],
      ['Status', invoice.status],
      ['Commission Rate', `${invoice.commissionRate}%`]
    ];

    autoTable(doc, {
      head: [['Field', 'Value']],
      body: headerData,
      startY: currentY,
      theme: 'grid'
    });

    const itemsData = invoice.items.map(item => [
      item.description,
      item.quantity.toString(),
      `$${item.unitPrice.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Description', 'Quantity', 'Unit Price', 'Total']],
      body: itemsData,
      startY: (doc as any).lastAutoTable.finalY + 10,
      theme: 'grid'
    });

    // Add totals
    const totalsData = [
      ['Subtotal', `$${invoice.subtotal.toFixed(2)}`],
      ['Commission Fee', `$${invoice.commissionFee.toFixed(2)}`],
      ['Total', `$${invoice.total.toFixed(2)}`]
    ];

    autoTable(doc, {
      head: [['', '']],
      body: totalsData,
      startY: (doc as any).lastAutoTable.finalY + 5,
      theme: 'grid'
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;
  });

  doc.save(`Order_${orderId}_Invoices.pdf`);
};

// Export Shipping to Excel
export const exportShippingToExcel = (shippingInvoices: ShippingInvoice[], orderId: string) => {
  const wb = XLSX.utils.book_new();

  shippingInvoices.forEach((shipping, index) => {
    const headerData = [
      ['Shipping ID', shipping._id],
      ['Client', shipping.clientName],
      ['Shipping Company', shipping.shippingCompanyName],
      ['Tracking Number', shipping.trackingNumber],
      ['Shipping Method', shipping.shippingMethod],
      ['Expected Delivery', new Date(shipping.expectedDelivery).toLocaleDateString()],
      ['Payment Method', shipping.paymentMethod.replace('_', ' ')],
      ['Status', shipping.status],
      ['Freight Charges', `$${shipping.freightCharges.toFixed(2)}`],
      ['Insurance', `$${shipping.insurance.toFixed(2)}`],
      ['Handling Fees', `$${shipping.handlingFees.toFixed(2)}`],
      ['Total Shipping Cost', `$${shipping.totalShippingCost.toFixed(2)}`],
      [''],
      ['Items:'],
      ['Description', 'Quantity', 'Weight (kg)', 'Volume (m³)']
    ];

    const itemsData = shipping.items.map(item => [
      item.description,
      item.quantity,
      item.weight || 0,
      item.volume || 0
    ]);

    const allData = [...headerData, ...itemsData];
    const ws = XLSX.utils.aoa_to_sheet(allData);
    XLSX.utils.book_append_sheet(wb, ws, `Shipping_${index + 1}`);
  });

  XLSX.writeFile(wb, `Order_${orderId}_Shipping.xlsx`);
};

// Export Shipping to PDF
export const exportShippingToPDF = (shippingInvoices: ShippingInvoice[], orderId: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(`Order #${orderId} - Shipping Information`, 20, 20);
  
  let currentY = 40;

  shippingInvoices.forEach((shipping, index) => {
    if (index > 0) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.text(`Shipping #${shipping._id}`, 20, currentY);
    currentY += 10;

    const headerData = [
      ['Client', shipping.clientName],
      ['Shipping Company', shipping.shippingCompanyName],
      ['Tracking Number', shipping.trackingNumber],
      ['Shipping Method', shipping.shippingMethod],
      ['Expected Delivery', new Date(shipping.expectedDelivery).toLocaleDateString()],
      ['Payment Method', shipping.paymentMethod.replace('_', ' ')],
      ['Status', shipping.status]
    ];

    autoTable(doc, {
      head: [['Field', 'Value']],
      body: headerData,
      startY: currentY,
      theme: 'grid'
    });

    const itemsData = shipping.items.map(item => [
      item.description,
      item.quantity.toString(),
      (item.weight || 0).toString(),
      (item.volume || 0).toString()
    ]);

    autoTable(doc, {
      head: [['Description', 'Quantity', 'Weight (kg)', 'Volume (m³)']],
      body: itemsData,
      startY: (doc as any).lastAutoTable.finalY + 10,
      theme: 'grid'
    });

    // Add cost breakdown
    const costsData = [
      ['Freight Charges', `$${shipping.freightCharges.toFixed(2)}`],
      ['Insurance', `$${shipping.insurance.toFixed(2)}`],
      ['Handling Fees', `$${shipping.handlingFees.toFixed(2)}`],
      ['Total Shipping Cost', `$${shipping.totalShippingCost.toFixed(2)}`]
    ];

    autoTable(doc, {
      head: [['Cost Item', 'Amount']],
      body: costsData,
      startY: (doc as any).lastAutoTable.finalY + 5,
      theme: 'grid'
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;
  });

  doc.save(`Order_${orderId}_Shipping.pdf`);
};