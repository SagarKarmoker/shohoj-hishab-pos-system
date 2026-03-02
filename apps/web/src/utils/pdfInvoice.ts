import { jsPDF } from 'jspdf';

const BANGLA_FONT_URL = 'https://fonts.gstatic.com/s/notosansbengali/v8/jizBRFtNs2ka5fXjeivQ4LroWlx-2zIZj1bIkNo.woff2';

let fontLoaded = false;
let fontBase64 = '';

async function loadBanglaFont(): Promise<string> {
  if (fontLoaded && fontBase64) {
    return fontBase64;
  }

  try {
    const response = await fetch(BANGLA_FONT_URL);
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    fontBase64 = btoa(binary);
    fontLoaded = true;
    return fontBase64;
  } catch (error) {
    console.error('Failed to load Bangla font:', error);
    return '';
  }
}

interface InvoiceItem {
  name: string;
  quantity: number;
  price?: number;
  totalPrice: number;
}

interface InvoiceData {
  invoiceNumber: string;
  createdAt: string;
  shop: {
    name: string;
    address?: string;
    phone?: string;
  };
  customer?: {
    name: string;
    phone?: string;
  };
  items: InvoiceItem[];
  totalAmount: number;
  discount?: number;
  paidAmount?: number;
  dueAmount?: number;
}

interface InvoiceOptions {
  isBangla: boolean;
}

export async function generateInvoicePDF(
  data: InvoiceData,
  options: InvoiceOptions
): Promise<void> {
  const { isBangla } = options;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 150],
  });

  if (isBangla) {
    const fontBase64 = await loadBanglaFont();
    if (fontBase64) {
      doc.addFileToVFS('NotoSansBengali-Regular.ttf', fontBase64);
      doc.addFont('NotoSansBengali-Regular.ttf', 'NotoSansBengali', 'normal');
      doc.setFont('NotoSansBengali', 'normal');
    }
  }

  const labels = isBangla ? {
    invoice: 'রসিদ',
    date: 'তারিখ',
    time: 'সময়',
    customer: 'গ্রাহক',
    phone: 'ফোন',
    item: 'পণ্য',
    qty: 'পরিমাণ',
    price: 'মূল্য',
    total: 'মোট',
    discount: 'ছাড়',
    paid: 'প্রদত্ত',
    due: 'বাকি',
    thankYou: 'আমাদের দোকান থেকে কেনার জন্য ধন্যবাদ!',
    poweredBy: 'সহজ হিসাব দ্বারা পরিচালিত',
  } : {
    invoice: 'Invoice',
    date: 'Date',
    time: 'Time',
    customer: 'Customer',
    phone: 'Phone',
    item: 'Item',
    qty: 'Qty',
    price: 'Price',
    total: 'Total',
    discount: 'Discount',
    paid: 'Paid',
    due: 'Due',
    thankYou: 'Thank you for shopping with us!',
    poweredBy: 'Powered by Shohoj Hishab',
  };

  doc.setFontSize(16);
  doc.setFont(isBangla ? 'NotoSansBengali' : 'helvetica', 'bold');
  doc.text(isBangla ? 'সহজ হিসাব' : 'Shohoj Hishab', 40, 8, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont(isBangla ? 'NotoSansBengali' : 'helvetica', 'normal');
  doc.text(data.shop.name, 40, 13, { align: 'center' });
  if (data.shop.address) {
    doc.text(data.shop.address, 40, 17, { align: 'center' });
  }
  if (data.shop.phone) {
    doc.text(data.shop.phone, 40, 21, { align: 'center' });
  }

  doc.setLineWidth(0.3);
  doc.line(5, 25, 75, 25);

  doc.setFontSize(10);
  doc.text(`${labels.invoice}: ${data.invoiceNumber}`, 5, 30);
  doc.text(`${labels.date}: ${new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`, 5, 35);
  doc.text(`${labels.time}: ${new Date(data.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`, 5, 40);

  let customerY = 45;
  if (data.customer) {
    doc.text(`${labels.customer}: ${data.customer.name}`, 5, customerY);
    customerY += 5;
    if (data.customer.phone) {
      doc.text(`${labels.phone}: ${data.customer.phone}`, 5, customerY);
      customerY += 5;
    }
  }

  doc.line(5, customerY, 75, customerY);

  let y = customerY + 4;
  doc.setFontSize(8);
  doc.setFont(isBangla ? 'NotoSansBengali' : 'helvetica', 'bold');
  doc.text(labels.item, 5, y);
  doc.text(labels.qty, 45, y);
  if (data.items[0]?.price !== undefined) {
    doc.text(labels.price, 55, y);
  }
  doc.text(labels.total, 68, y);
  
  doc.setFont(isBangla ? 'NotoSansBengali' : 'helvetica', 'normal');
  y += 5;
  
  if (data.items && data.items.length > 0) {
    data.items.forEach((item) => {
      const name = item.name.length > 18 ? item.name.substring(0, 18) + '..' : item.name;
      doc.text(name, 5, y);
      doc.text(String(item.quantity), 45, y);
      if (item.price !== undefined) {
        doc.text(`৳${item.price}`, 55, y);
      }
      doc.text(`৳${Number(item.totalPrice).toFixed(0)}`, 68, y);
      y += 5;
    });
  } else {
    doc.text('No items', 5, y);
    y += 5;
  }

  doc.line(5, y, 75, y);
  y += 5;
  
  doc.setFont(isBangla ? 'NotoSansBengali' : 'helvetica', 'bold');
  doc.text(`${labels.total}:`, 45, y);
  doc.text(`৳${Number(data.totalAmount).toFixed(0)}`, 68, y);
  y += 5;
  
  if (Number(data.discount) > 0) {
    doc.setFont(isBangla ? 'NotoSansBengali' : 'helvetica', 'normal');
    doc.text(`${labels.discount}:`, 45, y);
    doc.text(`-৳${Number(data.discount).toFixed(0)}`, 68, y);
    y += 5;
  }
  
  if (Number(data.paidAmount) > 0) {
    doc.setFont(isBangla ? 'NotoSansBengali' : 'helvetica', 'normal');
    doc.text(`${labels.paid}:`, 45, y);
    doc.text(`৳${Number(data.paidAmount).toFixed(0)}`, 68, y);
    y += 5;
  }
  if (Number(data.dueAmount) > 0) {
    doc.setFont(isBangla ? 'NotoSansBengali' : 'helvetica', 'bold');
    doc.text(`${labels.due}:`, 45, y);
    doc.text(`৳${Number(data.dueAmount).toFixed(0)}`, 68, y);
  }

  y += 8;
  doc.setFontSize(8);
  doc.setFont(isBangla ? 'NotoSansBengali' : 'helvetica', 'italic');
  doc.text(labels.thankYou, 40, y, { align: 'center' });
  doc.text(labels.poweredBy, 40, y + 4, { align: 'center' });

  doc.save(`invoice-${data.invoiceNumber}.pdf`);
}
