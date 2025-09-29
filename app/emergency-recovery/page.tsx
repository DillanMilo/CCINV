"use client";
// Purpose: Emergency data recovery - last resort

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmergencyRecoveryPage() {
  const [recoveryData, setRecoveryData] = useState<any>(null);
  const [recovering, setRecovering] = useState(false);

  const checkAllStorage = () => {
    console.log('Checking all possible data sources...');
    
    // Check localStorage
    const localData = localStorage.getItem('ccinv-data');
    console.log('Local storage data:', localData);
    
    // Check sessionStorage
    const sessionData = sessionStorage.getItem('ccinv-data');
    console.log('Session storage data:', sessionData);
    
    // Check all localStorage keys
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('ccinv')) {
        allKeys.push(key);
        console.log(`Found key: ${key}`, localStorage.getItem(key));
      }
    }
    
    // Try to find any data
    let foundData = null;
    if (localData) {
      try {
        foundData = JSON.parse(localData);
      } catch (e) {
        console.error('Error parsing local data:', e);
      }
    }
    
    setRecoveryData(foundData);
    
    if (foundData) {
      alert(`Found data with ${foundData.expenses?.length || 0} expenses, ${foundData.income?.length || 0} income records, and ${foundData.invoices?.length || 0} invoices!`);
    } else {
      alert('No data found in any storage location. This is a serious issue.');
    }
  };

  const emergencyRecover = async () => {
    if (!recoveryData) {
      alert('No data to recover');
      return;
    }

    setRecovering(true);
    try {
      // Force save to localStorage
      localStorage.setItem('ccinv-data', JSON.stringify(recoveryData));
      
      // Try to save to Supabase
      const response = await fetch('/api/debug/recover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ localData: recoveryData }),
      });
      
      if (response.ok) {
        alert('Emergency recovery successful! Please refresh the page.');
        window.location.reload();
      } else {
        alert('Recovery partially successful - data saved locally. Please refresh.');
        window.location.reload();
      }
    } catch (error) {
      console.error('Emergency recovery failed:', error);
      alert('Emergency recovery failed. Please contact support.');
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-red-600">🚨 EMERGENCY DATA RECOVERY</h1>
      <p className="text-muted-foreground">
        This is an emergency recovery tool. It will search all possible storage locations for your data.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Emergency Recovery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkAllStorage} className="w-full bg-red-600 hover:bg-red-700">
            🔍 Search All Storage Locations
          </Button>
          
          {recoveryData && (
            <div className="space-y-4">
              <div className="bg-green-100 p-4 rounded">
                <h3 className="font-bold text-green-800">Data Found!</h3>
                <p>Expenses: {recoveryData.expenses?.length || 0}</p>
                <p>Income: {recoveryData.income?.length || 0}</p>
                <p>Invoices: {recoveryData.invoices?.length || 0}</p>
                <p>Fixed Expenses: {recoveryData.fixedExpenses?.length || 0}</p>
              </div>
              
              <Button 
                onClick={emergencyRecover}
                disabled={recovering}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {recovering ? 'Recovering...' : '🚀 EMERGENCY RECOVER'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {recoveryData && (
        <Card>
          <CardHeader>
            <CardTitle>Recovery Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(recoveryData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
