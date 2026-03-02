import html2pdf from 'html2pdf.js';

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

function waitForFonts(): Promise<void> {
  return new Promise((resolve) => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => resolve());
    } else {
      setTimeout(resolve, 500);
    }
  });
}

export async function generateInvoicePDF(
  data: InvoiceData,
  options: InvoiceOptions
): Promise<void> {
  const { isBangla } = options;

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

  const fontFamily = isBangla ? '"Noto Sans Bengali", "Hind Siliguri", sans-serif' : 'Helvetica, Arial, sans-serif';
  const dateStr = new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = new Date(data.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 3px 2px; border-bottom: 1px solid #000000;">${item.name.length > 18 ? item.name.substring(0, 18) + '..' : item.name}</td>
      <td style="text-align: center; padding: 3px 2px; border-bottom: 1px solid #000000;">${item.quantity}</td>
      ${item.price !== undefined ? `<td style="text-align: right; padding: 3px 2px; border-bottom: 1px solid #000000;">৳${item.price}</td>` : ''}
      <td style="text-align: right; padding: 3px 2px; border-bottom: 1px solid #000000;">৳${Number(item.totalPrice).toFixed(0)}</td>
    </tr>
  `).join('');

  const invoiceHtml = `
    <div id="invoice-content" style="width: 75mm; font-family: ${fontFamily}; font-size: 11px; color: #000000; padding: 5mm; background: white;">
      <div style="text-align: center; margin-bottom: 10px;">
        <h1 style="font-size: 18px; font-weight: bold; margin: 0; color: #000000;">${isBangla ? 'সহজ হিসাব' : 'Shohoj Hishab'}</h1>
        <p style="font-size: 10px; margin: 3px 0; color: #000000;">${data.shop.name}</p>
        ${data.shop.address ? `<p style="font-size: 9px; margin: 2px 0; color: #000000;">${data.shop.address}</p>` : ''}
        ${data.shop.phone ? `<p style="font-size: 9px; margin: 2px 0; color: #000000;">${data.shop.phone}</p>` : ''}
      </div>
      
      <div style="border-top: 1px dashed #999; margin: 8px 0;"></div>
      
      <div style="font-size: 10px; color: #000000;">
        <p style="margin: 2px 0;"><strong>${labels.invoice}:</strong> ${data.invoiceNumber}</p>
        <p style="margin: 2px 0;"><strong>${labels.date}:</strong> ${dateStr}</p>
        <p style="margin: 2px 0;"><strong>${labels.time}:</strong> ${timeStr}</p>
      </div>
      
      ${data.customer ? `
      <div style="font-size: 10px; margin-top: 5px; color: #000000;">
        <p style="margin: 2px 0;"><strong>${labels.customer}:</strong> ${data.customer.name}</p>
        ${data.customer.phone ? `<p style="margin: 2px 0;"><strong>${labels.phone}:</strong> ${data.customer.phone}</p>` : ''}
      </div>
      ` : ''}
      
      <div style="border-top: 1px dashed #999; margin: 8px 0;"></div>
      
      <table style="width: 100%; font-size: 9px; border-collapse: collapse; color: #000000;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="text-align: left; padding: 4px 2px; font-weight: bold; color: #000000;">${labels.item}</th>
            <th style="text-align: center; padding: 4px 2px; font-weight: bold; color: #000000;">${labels.qty}</th>
            ${data.items[0]?.price !== undefined ? `<th style="text-align: right; padding: 4px 2px; font-weight: bold; color: #000000;">${labels.price}</th>` : ''}
            <th style="text-align: right; padding: 4px 2px; font-weight: bold; color: #000000;">${labels.total}</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="border-top: 1px dashed #999; margin: 8px 0;"></div>
      
      <div style="font-size: 11px; color: #000000;">
        <div style="display: flex; justify-content: space-between; margin: 4px 0;">
          <span style="font-weight: bold;">${labels.total}:</span>
          <span style="font-weight: bold;">৳${Number(data.totalAmount).toFixed(0)}</span>
        </div>
        ${data.discount && Number(data.discount) > 0 ? `
        <div style="display: flex; justify-content: space-between; margin: 4px 0;">
          <span>${labels.discount}:</span>
          <span>-৳${Number(data.discount).toFixed(0)}</span>
        </div>
        ` : ''}
        ${data.paidAmount && Number(data.paidAmount) > 0 ? `
        <div style="display: flex; justify-content: space-between; margin: 4px 0;">
          <span>${labels.paid}:</span>
          <span>৳${Number(data.paidAmount).toFixed(0)}</span>
        </div>
        ` : ''}
        ${data.dueAmount && Number(data.dueAmount) > 0 ? `
        <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold; font-size: 12px;">
          <span>${labels.due}:</span>
          <span>৳${Number(data.dueAmount).toFixed(0)}</span>
        </div>
        ` : ''}
      </div>
      
      <div style="border-top: 1px dashed #999; margin: 10px 0;"></div>
      
      <div style="text-align: center; font-size: 9px; color: #000000;">
        <p style="margin: 3px 0; font-style: italic;">${labels.thankYou}</p>
        <p style="margin: 3px 0;">${labels.poweredBy}</p>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = invoiceHtml;
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.zIndex = '-1000';
  container.style.background = 'white';
  document.body.appendChild(container);

  const element = container.querySelector('#invoice-content') as HTMLElement;

  await waitForFonts();

  const opt = {
    margin: 2,
    filename: `invoice-${data.invoiceNumber}.pdf`,
    image: { type: 'png' as const, quality: 1 },
    html2canvas: { 
      scale: 4, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'mm' as const, 
      format: [80, 150] as [number, number], 
      orientation: 'portrait' as const,
      hotfixes: ['enablepng']
    }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
