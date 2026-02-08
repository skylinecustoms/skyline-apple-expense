'use client'

import { useMemo } from 'react'
import { Expense } from '@/app/page'
import { 
  ChartBarIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface DashboardAnalyticsProps {
  expenses: Expense[]
}

export default function DashboardAnalytics({ expenses }: DashboardAnalyticsProps) {
  const analytics = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    
    // Group by category
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)
    
    // Group by month
    const byMonth = expenses.reduce((acc, e) => {
      const month = new Date(e.date).toLocaleString('default', { month: 'short', year: '2-digit' })
      acc[month] = (acc[month] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)
    
    // Recent trend (last 7 days vs previous 7 days)
    const now = new Date()
    const last7Days = expenses.filter(e => {
      const daysDiff = (now.getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    }).reduce((sum, e) => sum + e.amount, 0)
    
    const previous7Days = expenses.filter(e => {
      const daysDiff = (now.getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff > 7 && daysDiff <= 14
    }).reduce((sum, e) => sum + e.amount, 0)
    
    const trend = previous7Days > 0 ? ((last7Days - previous7Days) / previous7Days) * 100 : 0
    
    // Top vendors
    const byVendor = expenses.reduce((acc, e) => {
      acc[e.vendor] = (acc[e.vendor] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)
    
    const topVendors = Object.entries(byVendor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    
    return {
      totalExpenses,
      byCategory,
      byMonth,
      trend,
      last7Days,
      previous7Days,
      topVendors,
      averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0
    }
  }, [expenses])

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Yet</h3>
        <p className="text-gray-500">Add some expenses to see analytics</p>
      </div>
    )
  }

  const maxCategoryValue = Math.max(...Object.values(analytics.byCategory), 1)
  const maxMonthValue = Math.max(...Object.values(analytics.byMonth), 1)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Spent"
          value={`$${analytics.totalExpenses.toFixed(2)}`}
          icon={ChartBarIcon}
          color="blue"
        />
        <SummaryCard
          title="Avg Expense"
          value={`$${analytics.averageExpense.toFixed(2)}`}
          icon={TagIcon}
          color="green"
        />
        <SummaryCard
          title="Last 7 Days"
          value={`$${analytics.last7Days.toFixed(2)}`}
          icon={CalendarIcon}
          color="purple"
        />
        <SummaryCard
          title="Trend"
          value={`${analytics.trend >= 0 ? '+' : ''}${analytics.trend.toFixed(1)}%`}
          icon={analytics.trend >= 0 ? TrendingUpIcon : TrendingDownIcon}
          color={analytics.trend >= 0 ? 'red' : 'green'}
        />
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TagIcon className="h-5 w-5 mr-2 text-blue-600" />
          Spending by Category
        </h3>
        <div className="space-y-3">
          {Object.entries(analytics.byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-gray-900">${amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(amount / maxCategoryValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-purple-600" />
          Monthly Spending
        </h3>
        <div className="space-y-3">
          {Object.entries(analytics.byMonth)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .slice(0, 6)
            .map(([month, amount]) => (
              <div key={month}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{month}</span>
                  <span className="text-gray-900">${amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(amount / maxMonthValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Top Vendors */}
      {analytics.topVendors.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vendors</h3>
          <div className="space-y-2">
            {analytics.topVendors.map(([vendor, amount]) => (
              <div key={vendor} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-700 truncate flex-1 mr-4">{vendor}</span>
                <span className="font-semibold text-gray-900">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ title, value, icon: Icon, color }: { 
  title: string
  value: string
  icon: any
  color: 'blue' | 'green' | 'purple' | 'red'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  }

  return (
    <div className="card p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  )
}