'use client'

import { useMemo } from 'react'
import { Expense } from '@/app/page'
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CalendarIcon,
  TagIcon,
  TargetIcon
} from '@heroicons/react/24/outline'

interface DashboardAnalyticsProps {
  expenses: Expense[]
}

// Performance color types
type PerformanceColor = 'green' | 'yellow' | 'red'

interface MetricCard {
  title: string
  value: string
  target: string
  performance: PerformanceColor
  icon: any
  subtitle?: string
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

  // Define targets and calculate performance
  const weeklyTarget = 1000 // $1000/week target
  const cacTarget = 200 // $200 CAC target
  const leadsTarget = 20 // 20 leads/week target
  const ltvRatioTarget = 3.0 // 3:1 LTV:CAC ratio

  // Calculate metrics with performance colors
  const metrics: MetricCard[] = [
    {
      title: 'Weekly Revenue',
      value: `$${analytics.last7Days.toFixed(0)}`,
      target: `$${weeklyTarget}`,
      performance: getPerformanceColor(analytics.last7Days, weeklyTarget, true),
      icon: ChartBarIcon,
      subtitle: analytics.last7Days >= weeklyTarget ? 'Target Met!' : `${((analytics.last7Days / weeklyTarget) * 100).toFixed(0)}% of target`
    },
    {
      title: 'Receipts Scanned',
      value: `${expenses.length}`,
      target: `${leadsTarget}`,
      performance: getPerformanceColor(expenses.length, leadsTarget, true),
      icon: TagIcon,
      subtitle: expenses.length >= leadsTarget ? 'Target Met!' : `${((expenses.length / leadsTarget) * 100).toFixed(0)}% of target`
    },
    {
      title: 'Avg Expense',
      value: `$${analytics.averageExpense.toFixed(0)}`,
      target: `$${cacTarget}`,
      performance: getPerformanceColor(analytics.averageExpense, cacTarget, false), // Lower is better
      icon: TargetIcon,
      subtitle: analytics.averageExpense <= cacTarget ? 'Under Target' : `$${(analytics.averageExpense - cacTarget).toFixed(0)} over`
    },
    {
      title: 'Growth Trend',
      value: `${analytics.trend >= 0 ? '+' : ''}${analytics.trend.toFixed(1)}%`,
      target: '+10%',
      performance: analytics.trend >= 10 ? 'green' : analytics.trend >= 0 ? 'yellow' : 'red',
      icon: analytics.trend >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon,
      subtitle: analytics.trend >= 10 ? 'Excellent!' : analytics.trend >= 0 ? 'Growing' : 'Declining'
    }
  ]

  const maxCategoryValue = Math.max(...Object.values(analytics.byCategory), 1)
  const maxMonthValue = Math.max(...Object.values(analytics.byMonth), 1)

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <PerformanceCard key={index} metric={metric} />
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TagIcon className="h-5 w-5 mr-2 text-gray-600" />
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
                    className="bg-gray-600 h-2.5 rounded-full transition-all duration-500"
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
          <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
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
                    className="bg-gray-600 h-2.5 rounded-full transition-all duration-500"
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

// Helper function to determine performance color
function getPerformanceColor(actual: number, target: number, higherIsBetter: boolean): PerformanceColor {
  const ratio = higherIsBetter ? actual / target : target / actual
  
  if (ratio >= 1) return 'green' // Meeting or exceeding target
  if (ratio >= 0.8) return 'yellow' // Within 80% of target
  return 'red' // Below 80% of target
}

function PerformanceCard({ metric }: { metric: MetricCard }) {
  const colorStyles = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-700'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-700'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
      badge: 'bg-red-100 text-red-700'
    }
  }

  const colors = colorStyles[metric.performance]

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-4 transition-all duration-200`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center ${colors.icon}`}>
          <metric.icon className="h-5 w-5" />
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors.badge}`}>
          Target: {metric.target}
        </span>
      </div>
      
      <p className={`text-2xl font-bold ${colors.text} mb-1`}>
        {metric.value}
      </p>
      
      <p className="text-sm text-gray-600 font-medium mb-1">
        {metric.title}
      </p>
      
      {metric.subtitle && (
        <p className={`text-xs ${colors.text} opacity-80`}>
          {metric.subtitle}
        </p>
      )}
    </div>
  )
}