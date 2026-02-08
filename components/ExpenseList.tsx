'use client'

import { useState, useMemo } from 'react'
import { Expense } from '@/app/page'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  DocumentArrowDownIcon,
  PhotoIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface ExpenseListProps {
  expenses: Expense[]
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'vendor'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(expenses.map(e => e.category)))
    return ['All', ...cats.sort()]
  }, [expenses])

  // Helper function to check if date is in range
  const isDateInRange = (expenseDate: string, filter: string): boolean => {
    const date = new Date(expenseDate)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (filter) {
      case 'Today':
        return date >= today
      
      case 'Yesterday':
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        return date >= yesterday && date < today
      
      case 'This Week':
        const thisWeekStart = new Date(today)
        thisWeekStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
        return date >= thisWeekStart
      
      case 'Last Week':
        const lastWeekEnd = new Date(today)
        lastWeekEnd.setDate(today.getDate() - today.getDay()) // Start of this week
        const lastWeekStart = new Date(lastWeekEnd)
        lastWeekStart.setDate(lastWeekEnd.getDate() - 7) // Start of last week
        return date >= lastWeekStart && date < lastWeekEnd
      
      case 'This Month':
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        return date >= thisMonthStart
      
      case 'Last Month':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)
        return date >= lastMonthStart && date < lastMonthEnd
      
      case 'Last 7 Days':
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(today.getDate() - 7)
        return date >= sevenDaysAgo
      
      case 'Last 30 Days':
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(today.getDate() - 30)
        return date >= thirtyDaysAgo
      
      default: // 'All'
        return true
    }
  }

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = 
        expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory
      const matchesDate = isDateInRange(expense.date, dateFilter)

      return matchesSearch && matchesCategory && matchesDate
    })

    // Sort expenses
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'vendor':
          comparison = a.vendor.localeCompare(b.vendor)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [expenses, searchTerm, selectedCategory, dateFilter, sortBy, sortOrder])

  const totalAmount = filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const exportToCSV = () => {
    const headers = ['Date', 'Vendor', 'Amount', 'Category', 'Description']
    const rows = filteredAndSortedExpenses.map(expense => [
      expense.date,
      expense.vendor,
      expense.amount.toString(),
      expense.category,
      expense.description
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `skyline-expenses-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getCategoryColor = (category: string) => {
    const colors: {[key: string]: string} = {
      'Food & Dining': 'bg-green-100 text-green-800',
      'Automotive': 'bg-blue-100 text-blue-800',
      'Office Supplies': 'bg-purple-100 text-purple-800',
      'Travel': 'bg-indigo-100 text-indigo-800',
      'Utilities': 'bg-yellow-100 text-yellow-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Equipment': 'bg-gray-100 text-gray-800',
      'Professional Services': 'bg-orange-100 text-orange-800',
      'Insurance': 'bg-red-100 text-red-800',
      'Maintenance': 'bg-cyan-100 text-cyan-800',
      'Other': 'bg-slate-100 text-slate-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expense History</h2>
          <p className="text-gray-600">
            {filteredAndSortedExpenses.length} expense{filteredAndSortedExpenses.length !== 1 ? 's' : ''} 
            • Total: ${totalAmount.toFixed(2)}
          </p>
        </div>
        
        <button
          onClick={exportToCSV}
          disabled={filteredAndSortedExpenses.length === 0}
          className={`btn-secondary ${
            filteredAndSortedExpenses.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <DocumentArrowDownIcon className="h-5 w-5 inline mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search vendors or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category} {category === 'All' ? '' : `(${expenses.filter(e => e.category === category).length})`}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
              <option value="Last Week">Last Week</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'vendor')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="vendor">Sort by Vendor</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
              title={`Currently: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Expense List */}
      {filteredAndSortedExpenses.length === 0 ? (
        <div className="text-center py-12">
          <DocumentArrowDownIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
          <p className="text-gray-600">
            {expenses.length === 0 
              ? 'Start by scanning your first receipt!'
              : 'Try adjusting your search or filters.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedExpenses.map((expense) => (
            <div key={expense.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {expense.vendor}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                    {expense.receiptImage && (
                      <PhotoIcon className="h-4 w-4 text-blue-500" title="Has receipt image" />
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {expense.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(expense.date)}
                    </div>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      {expense.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    ${expense.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredAndSortedExpenses.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 rounded-lg border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{filteredAndSortedExpenses.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Average</p>
              <p className="text-2xl font-bold text-orange-600">
                ${filteredAndSortedExpenses.length > 0 ? (totalAmount / filteredAndSortedExpenses.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}