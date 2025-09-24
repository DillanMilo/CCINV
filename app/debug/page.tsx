"use client";
// Purpose: Debug page to check and recover data

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData } from "@/hooks/use-app-data";

export default function DebugPage() {
  const { data, loading } = useAppData();
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  const checkLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ccinv-data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocalStorageData(parsed);
      }
    }
  };

  const forceSync = async () => {
    if (localStorageData) {
      console.log('Forcing sync of local data:', localStorageData);
      // Trigger a manual save
      const { saveData } = await import('@/lib/storage');
      await saveData(localStorageData);
      alert('Data synced to Supabase!');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug Data</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current App Data (from useAppData)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Local Storage Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkLocalStorage}>
              Check Local Storage
            </Button>
            {localStorageData && (
              <>
                <div>
                  <p><strong>Invoices:</strong> {localStorageData.invoices?.length || 0}</p>
                  <p><strong>Expenses:</strong> {localStorageData.expenses?.length || 0}</p>
                  <p><strong>Income:</strong> {localStorageData.income?.length || 0}</p>
                </div>
                <Button onClick={forceSync} className="w-full">
                  Force Sync to Supabase
                </Button>
                <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(localStorageData, null, 2)}
                </pre>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
