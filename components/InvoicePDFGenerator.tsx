"use client";
// Purpose: Client-side PDF generation component

import { useEffect, useRef, useState, useCallback } from 'react';
import { formatCurrency } from '@/lib/storage';

interface InvoicePDFGeneratorProps {
  invoice: any;
  profile: any;
  onGenerated?: () => void;
}

export default function InvoicePDFGenerator({ invoice, profile, onGenerated }: InvoicePDFGeneratorProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const convertImageToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        console.warn('Failed to load image:', url);
        resolve(''); // Return empty string if image fails to load
      };
      img.src = url;
    });
  };

  const generatePDF = useCallback(async () => {
    if (!contentRef.current || isGenerating) return;

    setIsGenerating(true);
    try {
      // Import jsPDF dynamically
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      // Convert logo to base64 if it exists
      let logoBase64 = '';
      if (profile.logo_url) {
        logoBase64 = await convertImageToBase64(profile.logo_url);
      }

      // Create canvas from the content
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Replace logo src with base64 data if available
          if (logoBase64) {
            const logoImg = clonedDoc.querySelector('img[alt="Company Logo"]') as HTMLImageElement;
            if (logoImg) {
              logoImg.src = logoBase64;
            }
          }
        }
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(`invoice-${invoice.invoice_number}.pdf`);
      
      if (onGenerated) {
        onGenerated();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [invoice, profile, isGenerating, onGenerated]);

  useEffect(() => {
    // Auto-generate PDF when component mounts
    if (invoice && profile) {
      generatePDF();
    }
  }, [generatePDF]);

  const subtotal = invoice.items.reduce((sum: number, item: any) => {
    const lineTotal = item.rate;
    const afterDiscount = lineTotal * (1 - item.discount / 100);
    return sum + afterDiscount;
  }, 0);

  const total = subtotal;

  return (
    <div>
      {isGenerating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '10px' }}>🔄</div>
            <div>Generating PDF with your logo...</div>
          </div>
        </div>
      )}
      <div style={{ display: 'none' }}>
        <div ref={contentRef} style={{ 
          width: '210mm', 
          minHeight: '297mm', 
          padding: '20mm',
          backgroundColor: 'white',
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          lineHeight: '1.4'
        }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '30px',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '20px'
          }}>
            <div style={{ flex: 1 }}>
              {profile.logo_url && (
                <img 
                  src={profile.logo_url} 
                  alt="Company Logo" 
                  style={{ maxWidth: '200px', height: 'auto', marginBottom: '10px' }}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.warn('Logo failed to load:', profile.logo_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
                {profile.company_name}
              </div>
              <div>Professional Services</div>
              {profile.ein && <div style={{ fontSize: '10px', marginTop: '4px' }}>EIN: {profile.ein}</div>}
              {profile.bank_name && <div style={{ fontSize: '10px', marginTop: '2px' }}>Bank: {profile.bank_name}</div>}
              {profile.account_number && <div style={{ fontSize: '10px', marginTop: '2px' }}>Account: {profile.account_number}</div>}
              {profile.routing_number && <div style={{ fontSize: '10px', marginTop: '2px' }}>Routing: {profile.routing_number}</div>}
            </div>
            <div style={{ textAlign: 'right', flex: 1 }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' }}>
                INVOICE
              </div>
              <div style={{ fontSize: '18px', color: '#6b7280', marginBottom: '10px' }}>
                {invoice.invoice_number}
              </div>
              <div style={{ 
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                backgroundColor: '#dcfce7',
                color: '#166534'
              }}>
                {invoice.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Billing Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '30px'
          }}>
            <div style={{ flex: 1, marginRight: '30px' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px', color: '#1f2937' }}>
                Bill To:
              </div>
              <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                {invoice.client_name}
              </div>
              <div style={{ color: '#6b7280', fontSize: '13px' }}>
                {invoice.client_email}<br />
                {invoice.client_address?.replace(/\n/g, '<br />') || ''}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px', color: '#1f2937' }}>
                Invoice Details:
              </div>
              <div style={{ color: '#6b7280', fontSize: '13px' }}>
                <strong>Issue Date:</strong> {new Date(invoice.issue_date).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            marginBottom: '30px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '13px'
                }}>
                  Description
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'right', 
                  fontWeight: '600',
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '13px'
                }}>
                  Rate
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'right', 
                  fontWeight: '600',
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '13px'
                }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item: any, index: number) => {
                const lineTotal = item.rate;
                const afterDiscount = lineTotal * (1 - item.discount / 100);
                const itemTotal = afterDiscount;
                
                return (
                  <tr key={index}>
                    <td style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '13px'
                    }}>
                      {item.description}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid #e5e7eb',
                      textAlign: 'right',
                      fontSize: '13px'
                    }}>
                      ${item.rate.toFixed(2)}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid #e5e7eb',
                      textAlign: 'right',
                      fontSize: '13px'
                    }}>
                      ${itemTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ 
            marginLeft: 'auto', 
            width: '300px',
            marginBottom: '30px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontWeight: 'bold',
              fontSize: '18px',
              borderBottom: '2px solid #1f2937',
              borderTop: '2px solid #1f2937',
              padding: '12px 0'
            }}>
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div style={{ marginTop: '30px' }}>
              <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                Notes:
              </div>
              <div style={{ color: '#6b7280', whiteSpace: 'pre-line' }}>
                {invoice.notes}
              </div>
            </div>
          )}

          {/* Payment Information */}
          {(profile.bank_name || profile.account_number || profile.routing_number) && (
            <div style={{ 
              marginTop: '30px', 
              paddingTop: '20px', 
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '5px', color: '#1f2937' }}>
                Payment Information:
              </div>
              {profile.bank_name && <div style={{ fontSize: '12px', marginBottom: '2px' }}>Bank: {profile.bank_name}</div>}
              {profile.account_number && <div style={{ fontSize: '12px', marginBottom: '2px' }}>Account: {profile.account_number}</div>}
              {profile.routing_number && <div style={{ fontSize: '12px', marginBottom: '2px' }}>Routing: {profile.routing_number}</div>}
            </div>
          )}

          {/* Footer */}
          <div style={{ 
            marginTop: '50px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '12px'
          }}>
            Thank you for your business!
          </div>
        </div>
      </div>
    </div>
  );
}