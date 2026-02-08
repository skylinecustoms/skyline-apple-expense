'use client'

import { useState, useEffect } from 'react'

interface QBData {
  [key: string]: {
    revenue: number
    expenses: number
  }
}

export default function QBAdmin() {
  const [data, setData] = useState<QBData>({
    last_7_days: { revenue: 0, expenses: 0 },
    last_30_days: { revenue: 0, expenses: 0 },
    current_month: { revenue: 0, expenses: 0 },
    january: { revenue: 0, expenses: 0 }
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Load existing data
    fetch('/api/qb-manual')
      .then(res => res.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const updateValue = (period: string, field: 'revenue' | 'expenses', value: string) => {
    setData(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        [field]: parseFloat(value) || 0
      }
    }))
  }

  const saveData = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/qb-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        setMessage('✅ Data saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('❌ Failed to save data')
      }
    } catch (error) {
      setMessage('❌ Error saving data')
    } finally {
      setSaving(false)
    }
  }

  const periods = [
    { key: 'last_7_days', label: 'Last 7 Days' },
    { key: 'last_30_days', label: 'Last 30 Days' },
    { key: 'current_month', label: 'Current Month (Feb)' },
    { key: 'january', label: 'January 2026' }
  ]

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            QuickBooks Manual Data Entry
          </h1>
          <p className="text-gray-600 mb-6">
            Enter your actual QuickBooks revenue and expense data for each period. 
            This will update your dashboard with real numbers while we fix the API connection.
          </p>

          <div className="space-y-6">
            {periods.map(({ key, label }) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">{label}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Revenue ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={data[key]?.revenue || 0}
                      onChange={(e) => updateValue(key, 'revenue', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expenses ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={data[key]?.expenses || 0}
                      onChange={(e) => updateValue(key, 'expenses', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              💡 Tip: Check your QuickBooks reports for each date range and enter the exact amounts here.
            </div>
            
            <button
              onClick={saveData}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition"
            >
              {saving ? 'Saving...' : 'Save Data'}
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>Go to QuickBooks → Reports → Profit & Loss</li>
              <li>Set date range (e.g., last 7 days)</li>
              <li>Note the total income and total expenses</li>
              <li>Enter those numbers above for each period</li>
              <li>Click Save Data</li>
              <li>Your dashboard will immediately show accurate numbers</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}