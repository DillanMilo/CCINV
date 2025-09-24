"use client";
// Purpose: PDF download page with client-side generation

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import InvoicePDFGenerator from '@/components/InvoicePDFGenerator';

export default function PDFDownloadPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const response = await fetch(`/api/invoices/${params?.id}/pdf-client`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load invoice data');
        }
        
        setInvoice(data.invoice);
        setProfile(data.profile);
      } catch (err) {
        console.error('Error fetching invoice data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load invoice data');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchInvoiceData();
    }
  }, [params?.id]);

  const handlePDFGenerated = () => {
    // Close the window after PDF is generated
    setTimeout(() => {
      window.close();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Generating PDF...</h3>
          <p className="text-muted-foreground">
            Please wait while we prepare your invoice PDF.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!invoice || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Invoice not found</h3>
          <p className="text-muted-foreground mb-4">
            The invoice you're looking for doesn't exist.
          </p>
          <button 
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <InvoicePDFGenerator 
        invoice={invoice} 
        profile={profile} 
        onGenerated={handlePDFGenerated}
      />
    </div>
  );
}
