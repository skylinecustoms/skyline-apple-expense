'use client'

import { useState } from 'react'
import CameraCapture from '@/components/CameraCapture'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import MarketingIntelligence from '@/components/MarketingIntelligence'
import ProfitLoss from '@/components/ProfitLoss'
import { CameraIcon, DocumentIcon, ChartBarIcon, BanknotesIcon, ArrowLeftIcon, CalculatorIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline'

export interface Expense {
  id: string
  date: string
  vendor: string
  amount: number
  category: string
  description: string
  receiptImage?: string
  ocrText?: string
  createdAt: Date
}

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<'home' | 'finances' | 'expenses'>('home')
  const [activeView, setActiveView] = useState<'camera' | 'manual' | 'list'>('camera')
  const [financeView, setFinanceView] = useState<'marketing' | 'pl'>('marketing')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [capturedReceipt, setCapturedReceipt] = useState<{
    image: string
    extractedData?: any
  } | null>(null)

  const handleReceiptCaptured = (imageUrl: string, extractedData: any) => {
    setCapturedReceipt({ image: imageUrl, extractedData })
    setActiveView('manual')
  }

  const handleExpenseAdded = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date(),
      receiptImage: capturedReceipt?.image
    }
    setExpenses(prev => [newExpense, ...prev])
    setCapturedReceipt(null)
    setActiveView('list')
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Home Screen
  if (activeSection === 'home') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skyline Business Hub</h1>
          <p className="text-gray-600">Manage your automotive empire finances</p>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Finances Section */}
          <div 
            onClick={() => setActiveSection('finances')}
            className="card hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="p-8 text-center">
              <BanknotesIcon className="h-16 w-16 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Finances</h2>
              <p className="text-gray-600 mb-4">Marketing analytics, P&L reports, and financial insights</p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <PresentationChartLineIcon className="h-4 w-4 mr-1" />
                  P&L Reports
                </div>
                <div className="flex items-center">
                  <CalculatorIcon className="h-4 w-4 mr-1" />
                  Analytics
                </div>
              </div>
            </div>
          </div>

          {/* Expense Tracker Section */}
          <div 
            onClick={() => setActiveSection('expenses')}
            className="card hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="p-8 text-center">
              <CameraIcon className="h-16 w-16 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Expense Tracker</h2>
              <p className="text-gray-600 mb-4">Scan receipts, track expenses, and organize business costs</p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <DocumentIcon className="h-4 w-4 mr-1" />
                  {expenses.length} Receipts
                </div>
                <div className="flex items-center">
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  ${totalExpenses.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Quick Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-blue-600">${totalExpenses.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Receipts Scanned</p>
              <p className="text-2xl font-bold text-green-600">{expenses.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-purple-600">
                {expenses.filter(e => 
                  new Date(e.date).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Finances Section
  if (activeSection === 'finances') {
    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveSection('home')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
            <p className="text-gray-600">Marketing analytics and P&L reports</p>
          </div>
        </div>

        {/* Finance Navigation Tabs */}
        <div className="card">
          <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFinanceView('marketing')}
              className={`flex flex-col items-center justify-center space-y-1 py-3 px-4 rounded-md font-medium transition-all text-center ${
                financeView === 'marketing'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PresentationChartLineIcon className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Marketing Intelligence</span>
            </button>
            
            <button
              onClick={() => setFinanceView('pl')}
              className={`flex flex-col items-center justify-center space-y-1 py-3 px-4 rounded-md font-medium transition-all text-center ${
                financeView === 'pl'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalculatorIcon className="h-5 w-5" />
              <span className="text-xs sm:text-sm">P&L Reports</span>
            </button>
          </div>
        </div>

        {/* Finance Content */}
        <div>
          {financeView === 'marketing' && <MarketingIntelligence />}
          {financeView === 'pl' && <ProfitLoss />}
        </div>
      </div>
    )
  }

  // Expenses Section (existing functionality)
  if (activeSection === 'expenses') {
    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveSection('home')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
            <p className="text-gray-600">Scan receipts and track business expenses</p>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receipts Scanned</p>
                <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
              </div>
              <DocumentIcon className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {expenses.filter(e => 
                    new Date(e.date).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
              <CameraIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="card">
          <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('camera')}
              className={`flex flex-col items-center justify-center space-y-1 py-3 px-2 rounded-md font-medium transition-all text-center ${
                activeView === 'camera'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CameraIcon className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Scan Receipt</span>
            </button>
            
            <button
              onClick={() => setActiveView('manual')}
              className={`flex flex-col items-center justify-center space-y-1 py-3 px-2 rounded-md font-medium transition-all text-center ${
                activeView === 'manual'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <DocumentIcon className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Manual Entry</span>
            </button>
            
            <button
              onClick={() => setActiveView('list')}
              className={`flex flex-col items-center justify-center space-y-1 py-3 px-2 rounded-md font-medium transition-all text-center ${
                activeView === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChartBarIcon className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Expenses ({expenses.length})</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="card">
          {activeView === 'camera' && (
            <CameraCapture onReceiptCaptured={handleReceiptCaptured} />
          )}
          
          {activeView === 'manual' && (
            <ExpenseForm 
              onExpenseAdded={handleExpenseAdded}
              extractedData={capturedReceipt?.extractedData}
              receiptImage={capturedReceipt?.image}
            />
          )}
          
          {activeView === 'list' && (
            <ExpenseList expenses={expenses} />
          )}
        </div>
      </div>
    )
  }

  return null
}