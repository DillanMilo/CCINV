"use client";
// Purpose: Data recovery page to restore lost income and expenses from local storage

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData } from "@/hooks/use-app-data";
import { loadData, saveData, AppData } from "@/lib/storage";

export default function RecoverPage() {
  const { forceRefresh } = useAppData();
  const [localStorageData, setLocalStorageData] = useState<AppData | null>(null);
  const [supabaseDataInfo, setSupabaseDataInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryStatus, setRecoveryStatus] = useState<string | null>(null);

  useEffect(() => {
    checkLocalStorage();
    checkSupabaseData();
  }, []);

  const checkLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ccinv-data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocalStorageData(parsed);
      }
    }
  };

  const checkSupabaseData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/data');
      const data = await response.json();
      setSupabaseDataInfo(data);
    } catch (error) {
      console.error('Error fetching Supabase debug data:', error);
      setSupabaseDataInfo({ error: true, message: 'Failed to fetch Supabase data' });
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverData = async () => {
    if (!localStorageData) {
      alert('No local data found to recover.');
      return;
    }

    setRecoveryStatus('Recovering...');
    try {
      // Use the saveData function from storage.ts to push local data to Supabase
      await saveData(localStorageData);
      setRecoveryStatus('Recovery successful! Refreshing app data...');
      await forceRefresh(); // Force the app to reload data from Supabase
      alert('Data recovered and synced to Supabase successfully!');
      setRecoveryStatus('Recovery complete.');
    } catch (error) {
      console.error('Error during data recovery:', error);
      setRecoveryStatus('Recovery failed. Check console for details.');
      alert('Failed to recover data. Please check the console for errors.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Loading debug info...</h3>
          <p className="text-muted-foreground">
            Please wait while we check your data sources.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Data Recovery & Debug</h1>
      <p className="text-muted-foreground">
        Use this page to inspect your local storage and Supabase data, and to recover data if it appears lost.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local Storage Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkLocalStorage}>
              Re-check Local Storage
            </Button>
            {localStorageData ? (
              <>
                <div>
                  <p><strong>Invoices:</strong> {localStorageData.invoices?.length || 0}</p>
                  <p><strong>Expenses:</strong> {localStorageData.expenses?.length || 0}</p>
                  <p><strong>Income:</strong> {localStorageData.income?.length || 0}</p>
                  <p><strong>Fixed Expenses:</strong> {localStorageData.fixedExpenses?.length || 0}</p>
                </div>
                <Button onClick={handleRecoverData} className="w-full" disabled={!!recoveryStatus && recoveryStatus !== 'Recovery failed. Check console for details.'}>
                  {recoveryStatus === 'Recovering...' ? 'Recovering...' : 'Recover Data to Supabase'}
                </Button>
                {recoveryStatus && <p className="text-sm text-muted-foreground mt-2">{recoveryStatus}</p>}
                <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(localStorageData, null, 2)}
                </pre>
              </>
            ) : (
              <p>No data found in local storage.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Data Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkSupabaseData}>
              Re-check Supabase Data
            </Button>
            {supabaseDataInfo ? (
              supabaseDataInfo.error ? (
                <p className="text-red-600">Error: {supabaseDataInfo.message || supabaseDataInfo.details?.message}</p>
              ) : (
                <div>
                  <p><strong>Data Found:</strong> {supabaseDataInfo.data_found ? 'Yes' : 'No'}</p>
                  <p><strong>Sync Key:</strong> {supabaseDataInfo.sync_key}</p>
                  <p><strong>Invoices:</strong> {supabaseDataInfo.invoice_count}</p>
                  <p><strong>Expenses:</strong> {supabaseDataInfo.expense_count}</p>
                  <p><strong>Income:</strong> {supabaseDataInfo.income_count}</p>                    
                  <p><strong>Last Sync:</strong> {supabaseDataInfo.last_sync ? new Date(supabaseDataInfo.last_sync).toLocaleString() : 'N/A'}</p>
                  {supabaseDataInfo.invoice_ids && supabaseDataInfo.invoice_ids.length > 0 && (
                    <div className="mt-4">
                      <p className="font-semibold">Recent Invoice IDs:</p>
                      <ul className="list-disc list-inside text-sm">
                        {supabaseDataInfo.invoice_ids.map((inv: any) => (
                          <li key={inv.id}>{inv.number} ({inv.client})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            ) : (
              <p>Fetching Supabase data...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}