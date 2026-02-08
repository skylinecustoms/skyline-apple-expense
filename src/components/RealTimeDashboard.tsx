'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  TargetIcon,
  BanknotesIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface DashboardData {
  total_leads: number
  hot_leads: number
  leads_by_service: Record<string, number>
  total_customers: number
  conversion_rate: number
  pipeline_value: number
  meta_spend: number
  meta_clicks: number
  last_updated: string
}

interface KPIData {
  total_leads: number
  hot_leads: number
  total_customers: number
  new_customers_this_month: number
  conversion_rate: number
  pipeline_value: number
  estimated_revenue: number
  avg_job_value: number
  meta_spend: number
  meta_impressions: number
  meta_clicks: number
  meta_ctr: number
  blended_cac: number
  target_cac: number
  cac_performance: 'good' | 'warning' | 'bad'
  estimated_ltv: number
  ltv_cac_ratio: number
  ratio_performance: 'good' | 'warning' | 'bad'
  total_expenses: number
  gross_profit: number
  gross_margin: number
  last_updated: string
}

export default function RealTimeDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('current_month')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard data (real-time)
      const dashboardRes = await fetch('/api/dashboard')
      const dashboardJson = await dashboardRes.json()
      
      if (dashboardJson.success) {
        setDashboardData(dashboardJson.data)
      }

      // Fetch KPIs
      const kpiRes = await fetch(`/api/kpis?period=${selectedPeriod}`)
      const kpiJson = await kpiRes.json()
      
      if (kpiJson.success) {
        setKpiData(kpiJson.data)
      }

      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'good': return 'bg-green-50 border-green-200 text-green-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'bad': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <ChartBarIcon className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-800 mb-2">API Not Connected</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Live Dashboard</h2>
        <select 
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="current_month">This Month</option>
          <option value="last_30_days">Last 30 Days</option>
          <option value="last_7_days">Last 7 Days</option>
          <option value="january">January</option>
          <option value="february">February</option>
        </select>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Leads"
          value={dashboardData?.total_leads || 0}
          icon={UsersIcon}
          color="blue"
          subtitle="From GHL"
        />
        <MetricCard
          title="Hot Leads"
          value={dashboardData?.hot_leads || 0}
          icon={TargetIcon}
          color="orange"
          subtitle="Active prospects"
        />
        <MetricCard
          title="Customers"
          value={dashboardData?.total_customers || 0}
          icon={CurrencyDollarIcon}
          color="green"
          subtitle="Paying customers"
        />
        <MetricCard
          title="Pipeline Value"
          value={`$${((dashboardData?.pipeline_value || 0) / 1000).toFixed(1)}k`}
          icon={BanknotesIcon}
          color="purple"
          subtitle="Estimated"
        />
      </div>

      {/* CAC & LTV Section */}
      {kpiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CAC Card */}
          <div className={`rounded-xl p-6 border-2 ${getPerformanceColor(kpiData.cac_performance)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Customer Acquisition Cost</h3>
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
            <div className="text-3xl font-bold mb-2">
              ${kpiData.blended_cac.toFixed(2)}
            </div>
            <div className="text-sm opacity-80 mb-4">
              Target: ${kpiData.target_cac}
            </div>
            <div className="text-sm">
              <span className="font-medium">{kpiData.total_customers}</span> customers acquired
            </div>
          </div>

          {/* LTV:CAC Ratio Card */}
          <div className={`rounded-xl p-6 border-2 ${getPerformanceColor(kpiData.ratio_performance)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">LTV:CAC Ratio</h3>
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {kpiData.ltv_cac_ratio.toFixed(1)}:1
            </div>
            <div className="text-sm opacity-80 mb-4">
              Target: 3:1 or higher
            </div>
            <div className="text-sm">
              Est. LTV: ${kpiData.estimated_ltv.toFixed(0)}
            </div>
          </div>
        </div>
      )}

      {/* Marketing Performance */}
      {kpiData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
            Meta Ad Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${kpiData.meta_spend.toFixed(0)}
              </div>
              <div className="text-sm text-gray-500">Ad Spend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {kpiData.meta_clicks.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {kpiData.meta_ctr.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-500">CTR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {kpiData.conversion_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Conversion</div>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {kpiData?.last_updated && (
        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(kpiData.last_updated).toLocaleString()}
        </div>
      )}
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  subtitle 
}: { 
  title: string
  value: number | string
  icon: any
  color: string
  subtitle?: string
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800'
  }

  return (
    <div className={`${colorClasses[color]} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-6 w-6 opacity-70" />
        {subtitle && (
          <span className="text-xs opacity-60">{subtitle}</span>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm opacity-80">{title}</div>
    </div>
  )
}