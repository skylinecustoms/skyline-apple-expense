'use client'

import { useState, useEffect } from 'react'
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CalculatorIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface ServicePL {
  service: string
  revenue: number
  cogs: number // Cost of Goods Sold
  grossProfit: number
  grossMargin: number
  targetMargin: number
  status: 'green' | 'yellow' | 'red'
}

interface WeeklyPL {
  revenue: number
  expenses: {
    cogs: number
    subcontractors: number
    materials: number
    marketing: number
    operations: number
    total: number
  }
  grossProfit: number
  netProfit: number
  grossMargin: number
  netMargin: number
  services: ServicePL[]
}

export default function ProfitLoss() {
  const [plData, setPlData] = useState<WeeklyPL | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week')

  useEffect(() => {
    const loadPLData = async () => {
      setIsLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock data based on your target margins
      const mockData: WeeklyPL = {
        revenue: 9800,
        expenses: {
          cogs: 3430, // Total COGS across services
          subcontractors: 1200,
          materials: 880,
          marketing: 2179, // From marketing intelligence
          operations: 650,
          total: 8339
        },
        grossProfit: 6370, // Revenue - COGS
        netProfit: 1461, // Revenue - Total Expenses
        grossMargin: 65.0, // (Revenue - COGS) / Revenue
        netMargin: 14.9, // Net Profit / Revenue
        services: [
          {
            service: 'Tints',
            revenue: 2800,
            cogs: 980, // 35% of revenue (65% margin)
            grossProfit: 1820,
            grossMargin: 65.0,
            targetMargin: 65.0,
            status: 'green'
          },
          {
            service: 'Ceramic Coatings', 
            revenue: 3000,
            cogs: 1200, // 40% of revenue (60% margin)
            grossProfit: 1800,
            grossMargin: 60.0,
            targetMargin: 60.0,
            status: 'green'
          },
          {
            service: 'PPF',
            revenue: 4000,
            cogs: 1950, // 48.75% of revenue (51.25% margin - slightly low)
            grossProfit: 2050,
            grossMargin: 51.25,
            targetMargin: 50.0,
            status: 'green'
          }
        ]
      }
      
      setPlData(mockData)
      setIsLoading(false)
    }

    loadPLData()
  }, [selectedPeriod])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'text-green-600 bg-green-100'
      case 'yellow': return 'text-yellow-600 bg-yellow-100'  
      case 'red': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <ArrowPathIcon className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-lg text-gray-600">Loading P&L data...</span>
        </div>
      </div>
    )
  }

  if (!plData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profit & Loss</h2>
          <p className="text-gray-600">Revenue, expenses, and margin analysis</p>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setSelectedPeriod('quarter')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              selectedPeriod === 'quarter'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            This Quarter
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(plData.revenue)}</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-xs text-green-600">+23% vs last week</p>
              </div>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gross Profit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(plData.grossProfit)}</p>
              <p className="text-xs text-gray-500">Margin: {formatPercentage(plData.grossMargin)}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className={`text-2xl font-bold ${plData.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(plData.netProfit)}
              </p>
              <p className="text-xs text-gray-500">Margin: {formatPercentage(plData.netMargin)}</p>
            </div>
            <CalculatorIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(plData.expenses.total)}</p>
              <p className="text-xs text-gray-500">{formatPercentage((plData.expenses.total / plData.revenue) * 100)} of revenue</p>
            </div>
            <ArrowTrendingDownIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Detailed P&L Statement */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed P&L Statement</h3>
          
          <div className="space-y-4">
            {/* Revenue */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">Revenue</h4>
                <span className="text-lg font-bold text-green-600">{formatCurrency(plData.revenue)}</span>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-gray-900">Cost of Goods Sold</h4>
                <span className="text-lg font-bold text-red-600">({formatCurrency(plData.expenses.cogs)})</span>
              </div>
              <div className="pl-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subcontractors</span>
                  <span className="text-gray-900">{formatCurrency(plData.expenses.subcontractors)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Materials & Supplies</span>
                  <span className="text-gray-900">{formatCurrency(plData.expenses.materials)}</span>
                </div>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="border-b border-gray-200 pb-4 bg-green-50 px-4 py-2 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-green-800">Gross Profit</h4>
                <span className="text-lg font-bold text-green-600">{formatCurrency(plData.grossProfit)}</span>
              </div>
              <div className="text-sm text-green-700 text-right">
                Margin: {formatPercentage(plData.grossMargin)}
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-gray-900">Operating Expenses</h4>
                <span className="text-lg font-bold text-red-600">({formatCurrency(plData.expenses.marketing + plData.expenses.operations)})</span>
              </div>
              <div className="pl-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Marketing & Advertising</span>
                  <span className="text-gray-900">{formatCurrency(plData.expenses.marketing)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Operations</span>
                  <span className="text-gray-900">{formatCurrency(plData.expenses.operations)}</span>
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div className={`px-4 py-3 rounded-lg ${plData.netProfit > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex justify-between items-center">
                <h4 className={`text-xl font-bold ${plData.netProfit > 0 ? 'text-green-800' : 'text-red-800'}`}>
                  Net Profit
                </h4>
                <span className={`text-xl font-bold ${plData.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(plData.netProfit)}
                </span>
              </div>
              <div className={`text-sm text-right ${plData.netProfit > 0 ? 'text-green-700' : 'text-red-700'}`}>
                Margin: {formatPercentage(plData.netMargin)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Breakdown */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Profitability</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Service</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">COGS</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Gross Profit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Margin</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Target</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {plData.services.map((service, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-semibold text-gray-900">{service.service}</td>
                    <td className="py-4 px-4 font-medium text-gray-900">{formatCurrency(service.revenue)}</td>
                    <td className="py-4 px-4 text-gray-900">{formatCurrency(service.cogs)}</td>
                    <td className="py-4 px-4 font-medium text-green-600">{formatCurrency(service.grossProfit)}</td>
                    <td className="py-4 px-4">
                      <span className={`font-medium ${
                        service.grossMargin >= service.targetMargin ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {formatPercentage(service.grossMargin)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500">{formatPercentage(service.targetMargin)}</td>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                        {service.status === 'green' ? (
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        )}
                        <span className="capitalize">{service.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}