'use client'

import { useState, useRef } from 'react'
import { createWorker } from 'tesseract.js'
import { CameraIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface CameraCaptureProps {
  onReceiptCaptured: (imageUrl: string, extractedData: any) => void
}

export default function CameraCapture({ onReceiptCaptured }: CameraCaptureProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  // Simplified approach - using native file inputs only

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      setCapturedImage(imageDataUrl)
      processImage(imageDataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      setCapturedImage(imageDataUrl)
      processImage(imageDataUrl)
    }
    reader.readAsDataURL(file)
  }

  const processImage = async (imageDataUrl: string) => {
    setIsProcessing(true)
    setError(null)
    setOcrProgress(0)

    try {
      const worker = await createWorker('eng')
      
      // Set up progress tracking
      worker.setParameters({
        tessedit_char_whitelist: '0123456789.,/$-:abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '
      })

      const { data: { text } } = await worker.recognize(imageDataUrl)

      await worker.terminate()

      // Extract relevant data from OCR text
      const extractedData = extractReceiptData(text)
      
      onReceiptCaptured(imageDataUrl, extractedData)

    } catch (err) {
      setError('Failed to process receipt. Please try again.')
      console.error('OCR Error:', err)
    } finally {
      setIsProcessing(false)
      setOcrProgress(0)
    }
  }

  const extractReceiptData = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
    
    // Try to extract date (various formats)
    const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/
    const dateMatch = text.match(datePattern)
    
    // Try to extract total amount (look for patterns like $12.34, 12.34, etc.)
    const amountPattern = /(?:total|amount|sum)?\s*[$]?(\d+\.?\d{2})/gi
    const amounts = Array.from(text.matchAll(amountPattern))
    const totalAmount = amounts.length > 0 ? amounts[amounts.length - 1][1] : ''
    
    // Try to extract vendor name (usually at the top)
    const vendor = lines[0] || ''
    
    // Categorize based on keywords
    const category = categorizeExpense(text.toLowerCase())
    
    return {
      date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
      vendor: vendor.substring(0, 50), // Limit length
      amount: totalAmount ? parseFloat(totalAmount) : 0,
      category,
      description: `Receipt from ${vendor}`,
      ocrText: text
    }
  }

  const categorizeExpense = (text: string): string => {
    const categories = {
      'Food & Dining': ['restaurant', 'food', 'cafe', 'pizza', 'burger', 'coffee', 'lunch', 'dinner'],
      'Automotive': ['gas', 'fuel', 'oil', 'tire', 'auto', 'car', 'vehicle', 'mechanic', 'parts'],
      'Office Supplies': ['office', 'supplies', 'paper', 'pen', 'staples', 'computer', 'software'],
      'Travel': ['hotel', 'flight', 'uber', 'taxi', 'parking', 'airline', 'booking'],
      'Utilities': ['electric', 'water', 'phone', 'internet', 'utility', 'bill'],
      'Other': []
    }

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category
      }
    }

    return 'Other'
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan Your Receipt</h2>
        <p className="text-gray-600">Take a photo or upload an image to extract expense data automatically</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            <ArrowPathIcon className="h-6 w-6 text-blue-600 animate-spin" />
            <div className="flex-1">
              <p className="text-blue-800 font-medium">Processing receipt...</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
              <p className="text-sm text-blue-600 mt-1">{ocrProgress}% complete</p>
            </div>
          </div>
        </div>
      )}

      {capturedImage ? (
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={capturedImage} 
              alt="Captured receipt" 
              className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
            />
          </div>
          
          {!isProcessing && (
            <div className="flex space-x-4">
              <button
                onClick={retakePhoto}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Retake Photo
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center space-y-4">
            <CameraIcon className="h-16 w-16 text-gray-400 mx-auto" />
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  ref={cameraInputRef}
                  className="hidden"
                />
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn-primary w-full"
                >
                  <CameraIcon className="h-5 w-5 inline mr-2" />
                  Take Photo
                </button>
              </div>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary w-full"
                >
                  <PhotoIcon className="h-5 w-5 inline mr-2" />
                  Upload Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}