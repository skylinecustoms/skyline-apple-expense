'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon, BuildingStorefrontIcon, CurrencyDollarIcon, TagIcon } from '@heroicons/react/24/outline'

interface ExpenseFormProps {
  onExpenseAdded: (expense: {
    date: string
    vendor: string
    amount: number
    category: string
    description: string
  }) => void
  extractedData?: {
    date?: string
    vendor?: string
    amount?: number
    category?: string
    description?: string
    ocrText?: string
  }
  receiptImage?: string
}

const categories = [
  'Food & Dining',
  'Automotive',
  'Office Supplies',
  'Travel',
  'Utilities',
  'Marketing',
  'Equipment',
  'Professional Services',
  'Insurance',
  'Maintenance',
  'Other'
]

export default function ExpenseForm({ onExpenseAdded, extractedData, receiptImage }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    amount: '',
    category: 'Other',
    description: ''
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Pre-fill form with extracted data
  useEffect(() => {
    if (extractedData) {
      setFormData({
        date: extractedData.date || new Date().toISOString().split('T')[0],
        vendor: extractedData.vendor || '',
        amount: extractedData.amount?.toString() || '',
        category: extractedData.category || 'Other',
        description: extractedData.description || ''
      })
    }
  }, [extractedData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.date) newErrors.date = 'Date is required'
    if (!formData.vendor.trim()) newErrors.vendor = 'Vendor name is required'
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    onExpenseAdded({
      date: formData.date,
      vendor: formData.vendor.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description.trim()
    })

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      vendor: '',
      amount: '',
      category: 'Other',
      description: ''
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Expense</h2>
        <p className="text-gray-600">
          {extractedData ? 'Review and edit the extracted information' : 'Enter expense details manually'}
        </p>
      </div>

      {receiptImage && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Captured Receipt</h3>
          <img 
            src={receiptImage} 
            alt="Receipt" 
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}

      {extractedData?.ocrText && (
        <details className="bg-gray-50 p-4 rounded-lg">
          <summary className="font-medium text-gray-700 cursor-pointer">
            View extracted text (OCR)
          </summary>
          <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap font-mono bg-white p-2 rounded border">
            {extractedData.ocrText}
          </pre>
        </details>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="h-4 w-4 inline mr-1" />
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
        </div>

        {/* Vendor */}
        <div>
          <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-2">
            <BuildingStorefrontIcon className="h-4 w-4 inline mr-1" />
            Vendor/Store
          </label>
          <input
            type="text"
            id="vendor"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            placeholder="e.g., Home Depot, Shell Gas Station"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.vendor ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.vendor && <p className="text-red-600 text-sm mt-1">{errors.vendor}</p>}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.amount && <p className="text-red-600 text-sm mt-1">{errors.amount}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            <TagIcon className="h-4 w-4 inline mr-1" />
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Brief description of the expense"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 btn-primary"
          >
            Add Expense
          </button>
        </div>
      </form>
    </div>
  )
}