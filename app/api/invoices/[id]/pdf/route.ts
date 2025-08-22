// Purpose: Generate PDF for invoice with consistent mobile/desktop layout
import { NextRequest, NextResponse } from 'next/server';
import { supabase, SYNC_KEY } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    
    // Load data from Supabase
    const { data: supabaseData, error } = await supabase
      .from('app_data')
      .select('*')
      .eq('sync_key', SYNC_KEY)
      .single();

    if (error) {
      console.error('Error loading data:', error);
      return NextResponse.json(
        { error: 'Failed to load invoice data' },
        { status: 500 }
      );
    }

    if (!supabaseData) {
      return NextResponse.json(
        { error: 'No data found' },
        { status: 404 }
      );
    }

    const appData = JSON.parse(supabaseData.data);
    const invoice = appData.invoices.find((inv: any) => inv.id === invoiceId);
    const profile = appData.profile;

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const subtotal = invoice.items.reduce((sum: number, item: any) => {
      const lineTotal = item.rate;
      const afterDiscount = lineTotal * (1 - item.discount / 100);
      return sum + afterDiscount;
    }, 0);

    const total = subtotal;

    // Generate HTML for PDF with fixed layout
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 14px;
              line-height: 1.5;
              color: #1f2937;
              background: white;
              width: 8.5in;
              min-height: 11in;
              margin: 0 auto;
              padding: 1in;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 2rem;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 1rem;
            }
            
            .logo-section {
              flex: 1;
            }
            
            .logo {
              max-width: 220px;
              height: auto;
              margin-bottom: 1rem;
            }
            
            .company-info {
              font-size: 12px;
              color: #6b7280;
            }
            
            .invoice-info {
              text-align: right;
              flex: 1;
            }
            
            .invoice-title {
              font-size: 32px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 0.5rem;
            }
            
            .invoice-number {
              font-size: 18px;
              color: #6b7280;
              margin-bottom: 1rem;
            }
            
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              background: #dcfce7;
              color: #166534;
            }
            
            .billing-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2rem;
            }
            
            .bill-to, .invoice-details {
              flex: 1;
              margin-right: 2rem;
            }
            
            .bill-to:last-child, .invoice-details:last-child {
              margin-right: 0;
            }
            
            .section-title {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 0.5rem;
              color: #1f2937;
            }
            
            .client-name {
              font-weight: 600;
              margin-bottom: 0.25rem;
            }
            
            .client-details {
              color: #6b7280;
              font-size: 13px;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 2rem;
            }
            
            .items-table th {
              background: #f9fafb;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              border-bottom: 2px solid #e5e7eb;
              font-size: 13px;
            }
            
            .items-table td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 13px;
            }
            
            .items-table .text-right {
              text-align: right;
            }
            
            .totals-section {
              margin-left: auto;
              width: 300px;
              margin-bottom: 2rem;
            }
            
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .totals-row.total {
              font-weight: bold;
              font-size: 18px;
              border-bottom: 2px solid #1f2937;
              border-top: 2px solid #1f2937;
              padding: 12px 0;
            }
            
            .notes-section {
              margin-top: 2rem;
            }
            
            .notes-title {
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            
            .notes-content {
              color: #6b7280;
              white-space: pre-line;
            }
            
            .footer {
              margin-top: 3rem;
              padding-top: 1rem;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            
            @media print {
              body {
                width: auto;
                margin: 0;
                padding: 1in;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              ${profile.logo_url ? `<img src="${profile.logo_url}" class="logo" alt="Company Logo" />` : ''}
              <div class="company-info">
                <div style="font-weight: 600; font-size: 16px; color: #1f2937;">${profile.company_name}</div>
                <div>Professional Services</div>
                ${profile.ein ? `<div style="font-size: 11px; margin-top: 4px;">EIN: ${profile.ein}</div>` : ''}
                ${profile.bank_name ? `<div style="font-size: 11px; margin-top: 2px;">Bank: ${profile.bank_name}</div>` : ''}
                ${profile.account_number ? `<div style="font-size: 11px; margin-top: 2px;">Account: ${profile.account_number}</div>` : ''}
                ${profile.routing_number ? `<div style="font-size: 11px; margin-top: 2px;">Routing: ${profile.routing_number}</div>` : ''}
              </div>
            </div>
            <div class="invoice-info">
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-number">${invoice.invoice_number}</div>
              <div class="status-badge">${invoice.status.toUpperCase()}</div>
            </div>
          </div>
          
          <div class="billing-section">
            <div class="bill-to">
              <div class="section-title">Bill To:</div>
              <div class="client-name">${invoice.client_name}</div>
              <div class="client-details">
                ${invoice.client_email}<br>
                ${invoice.client_address?.replace(/\n/g, '<br>') || ''}
              </div>
            </div>
            <div class="invoice-details">
              <div class="section-title">Invoice Details:</div>
              <div class="client-details">
                <strong>Issue Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item: any) => {
                const lineTotal = item.rate;
                const afterDiscount = lineTotal * (1 - item.discount / 100);
                const itemTotal = afterDiscount;
                
                return `
                  <tr>
                    <td>${item.description}</td>
                    <td class="text-right">$${item.rate.toFixed(2)}</td>
                    <td class="text-right">$${itemTotal.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="totals-section">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="totals-row total">
              <span>Total:</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>
          
          ${invoice.notes ? `
            <div class="notes-section">
              <div class="notes-title">Notes:</div>
              <div class="notes-content">${invoice.notes}</div>
            </div>
          ` : ''}
          
          ${(profile.bank_name || profile.account_number || profile.routing_number) ? `
            <div class="payment-section" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
              <div style="font-weight: 600; margin-bottom: 0.5rem; color: #1f2937;">Payment Information:</div>
              ${profile.bank_name ? `<div style="font-size: 12px; margin-bottom: 2px;">Bank: ${profile.bank_name}</div>` : ''}
              ${profile.account_number ? `<div style="font-size: 12px; margin-bottom: 2px;">Account: ${profile.account_number}</div>` : ''}
              ${profile.routing_number ? `<div style="font-size: 12px; margin-bottom: 2px;">Routing: ${profile.routing_number}</div>` : ''}
            </div>
          ` : ''}
          
          <div class="footer">
            Thank you for your business!
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}