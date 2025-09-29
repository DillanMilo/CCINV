"use client";
// Purpose: Data recovery page to restore lost income and expenses

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData } from "@/hooks/use-app-data";

export default function RecoverPage() {
  const { data, forceRefresh } = useAppData();
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [recovering, setRecovering] = useState(false);

  const checkLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ccinv-data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocalStorageData(parsed);
        console.log('Local storage data found:', parsed);
      } else {
        alert('No data found in local storage');
      }
    }
  };

  const recoverData = async () => {
    if (!localStorageData) {
      alert('Please check local storage first');
      return;
    }

    setRecovering(true);
    try {
      // Force save the local data to Supabase
      const { saveData } = await import('@/lib/storage');
      await saveData(localStorageData);
      
      // Refresh the app data
      await forceRefresh();
      
      alert('Data recovered successfully! Please refresh the page.');
    } catch (error) {
      console.error('Recovery failed:', error);
      alert('Recovery failed. Please try again.');
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-red-600">🚨 Data Recovery</h1>
      <p className="text-muted-foreground">
        If your income and expenses data is missing, we can try to recover it from your browser's local storage.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current App Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Expenses:</strong> {data?.expenses?.length || 0}</p>
              <p><strong>Income:</strong> {data?.income?.length || 0}</p>
              <p><strong>Invoices:</strong> {data?.invoices?.length || 0}</p>
              <p><strong>Fixed Expenses:</strong> {data?.fixedExpenses?.length || 0}</p>
            </div>
            <Button onClick={forceRefresh} className="mt-4">
              Refresh Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recovery Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkLocalStorage} className="w-full">
              Check Local Storage
            </Button>
            
            {localStorageData && (
              <div className="space-y-2">
                <div className="text-sm">
                  <p><strong>Found in local storage:</strong></p>
                  <p>Expenses: {localStorageData.expenses?.length || 0}</p>
                  <p>Income: {localStorageData.income?.length || 0}</p>
                  <p>Invoices: {localStorageData.invoices?.length || 0}</p>
                </div>
                <Button 
                  onClick={recoverData} 
                  disabled={recovering}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {recovering ? 'Recovering...' : 'Recover Data'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {localStorageData && (
        <Card>
          <CardHeader>
            <CardTitle>Local Storage Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(localStorageData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
