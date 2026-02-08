'use client'

import { useState, useRef, useCallback } from 'react'
import { createWorker, Worker } from 'tesseract.js'
import { 
  CameraIcon, 
  PhotoIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface EnhancedCameraCaptureProps {
  onReceiptCaptured: (imageUrl: string, extractedData: ExtractedReceiptData) => void
}

export interface ExtractedReceiptData {
  date: string
  vendor: string
  amount: number
  category: string
  description: string
  tax?: number
  subtotal?: number
  items?: string[]
  confidence: number
  ocrText: string
}

export default function EnhancedCameraCapture({ onReceiptCaptured }: EnhancedCameraCaptureProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<ExtractedReceiptData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const workerRef = useRef<Worker | null>(null)

  const initializeWorker = async () => {
    if (!workerRef.current) {
      const worker = await createWorker('eng')
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789.,/$-:abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@#&()%/ '
      })
      workerRef.current = worker
    }
    return workerRef.current
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Please choose an image under 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      setCapturedImage(imageDataUrl)
      setError(null)
      processImage(imageDataUrl)
    }
    reader.readAsDataURL(file)
  }

  const processImage = useCallback(async (imageDataUrl: string) => {
    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setPreview(null)

    try {
      const worker = await initializeWorker()
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const { data: { text, confidence } } = await worker.recognize(imageDataUrl)
      
      clearInterval(progressInterval)
      setProgress(100)

      const extractedData = enhancedExtractReceiptData(text, confidence)
      setPreview(extractedData)

    } catch (err) {
      setError('Failed to process receipt. Please try again or enter manually.')
      console.error('OCR Error:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const enhancedExtractReceiptData = (text: string, confidence: number): ExtractedReceiptData => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
    const fullText = text.toLowerCase()
    
    // Enhanced date extraction
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,  // MM/DD/YYYY or DD/MM/YYYY
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,    // YYYY/MM/DD
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}/i,  // Jan 1, 2024
      /\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}/i,     // 1 Jan 2024
    ]
    
    let date = new Date().toISOString().split('T')[0]
    for (const pattern of datePatterns) {
      const match = text.match(pattern)
      if (match) {
        const parsed = new Date(match[0])
        if (!isNaN(parsed.getTime())) {
          date = parsed.toISOString().split('T')[0]
          break
        }
      }
    }

    // Enhanced amount extraction
    const totalPatterns = [
      /(?:total|amount|sum|grand\s*total)[\s:]*[$]?\s*(\d{1,3}(?:,\d{3})*\.?\d{0,2})/i,
      /(?:balance|due|charge)[\s:]*[$]?\s*(\d{1,3}(?:,\d{3})*\.?\d{0,2})/i,
      /[$]\s*(\d{1,3}(?:,\d{3})*\.\d{2})/
    ]
    
    let totalAmount = 0
    let amounts: number[] = []
    
    for (const pattern of totalPatterns) {
      const matches = text.matchAll(new RegExp(pattern, 'gi'))
      for (const match of matches) {
        const amount = parseFloat(match[1]?.replace(',', '') || '0')
        if (amount > 0) amounts.push(amount)
      }
    }
    
    // Get largest amount as total (usually the final total)
    if (amounts.length > 0) {
      totalAmount = Math.max(...amounts)
    }

    // Extract tax if present
    const taxPattern = /(?:tax|vat|gst)[\s:]*[$]?\s*(\d+\.?\d{0,2})/i
    const taxMatch = text.match(taxPattern)
    const tax = taxMatch ? parseFloat(taxMatch[1]) : undefined

    // Extract subtotal
    const subtotalPattern = /(?:subtotal|sub-total)[\s:]*[$]?\s*(\d+\.?\d{0,2})/i
    const subtotalMatch = text.match(subtotalPattern)
    const subtotal = subtotalMatch ? parseFloat(subtotalMatch[1]) : undefined

    // Enhanced vendor extraction
    let vendor = ''
    const vendorPatterns = [
      /^([A-Z][A-Za-z0-9\s&]+(?:LLC|Inc|Corp|Ltd|Co\.?)?)/m,  // Company name at start
      /(?:merchant|vendor|store|from)[\s:]*([A-Z][A-Za-z0-9\s&]+)/i,
    ]
    
    for (const pattern of vendorPatterns) {
      const match = text.match(pattern)
      if (match && match[1] && match[1].length > 2) {
        vendor = match[1].trim().substring(0, 50)
        break
      }
    }
    
    // Fallback: use first non-numeric line
    if (!vendor) {
      vendor = lines.find(line => 
        line.length > 2 && 
        !line.match(/^\d+$/) && 
        !line.match(/^(www|http|tel|phone)/i)
      ) || 'Unknown Vendor'
    }

    // Enhanced categorization
    const category = enhancedCategorize(fullText, vendor)

    // Extract line items
    const items = extractLineItems(lines)

    return {
      date,
      vendor: vendor.substring(0, 50),
      amount: totalAmount,
      category,
      description: `Receipt from ${vendor}`,
      tax,
      subtotal,
      items: items.length > 0 ? items : undefined,
      confidence,
      ocrText: text
    }
  }

  const extractLineItems = (lines: string[]): string[] => {
    const items: string[] = []
    const itemPattern = /^(.*?)\s+[$]?(\d+\.\d{2})$/
    
    for (const line of lines) {
      const match = line.match(itemPattern)
      if (match && match[1].length > 3 && !line.toLowerCase().includes('total')) {
        items.push(line.trim())
      }
    }
    
    return items.slice(0, 10) // Limit to 10 items
  }

  const enhancedCategorize = (text: string, vendor: string): string => {
    const categories: Record<string, string[]> = {
      'Marketing & Advertising': ['marketing', 'advertising', 'ads', 'facebook', 'google', 'instagram', 'promotion', 'campaign'],
      'Automotive': ['gas', 'fuel', 'oil', 'tire', 'auto', 'car', 'vehicle', 'mechanic', 'parts', 'repair', 'service'],
      'Office Supplies': ['office', 'supplies', 'paper', 'pen', 'staples', 'computer', 'software', 'hardware', 'printer'],
      'Meals & Entertainment': ['restaurant', 'food', 'cafe', 'pizza', 'burger', 'coffee', 'lunch', 'dinner', 'uber eats', 'doordash'],
      'Travel & Transport': ['hotel', 'flight', 'uber', 'taxi', 'parking', 'airline', 'booking', 'travel', 'lyft'],
      'Utilities': ['electric', 'water', 'phone', 'internet', 'utility', 'bill', 'verizon', 'at&t', 'comcast'],
      'Professional Services': ['legal', 'accounting', 'consulting', 'service', 'fee', 'subscription'],
      'Equipment & Tools': ['tool', 'equipment', 'machine', 'device', 'hardware'],
    }

    const combinedText = `${text} ${vendor.toLowerCase()}`
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        return category
      }
    }

    return 'Other Expenses'
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setPreview(null)
    setError(null)
    setProgress(0)
  }

  const confirmReceipt = () => {
    if (capturedImage && preview) {
      onReceiptCaptured(capturedImage, preview)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan Your Receipt</h2>
        <p className="text-gray-600">AI-powered receipt scanning with automatic data extraction</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            <ArrowPathIcon className="h-6 w-6 text-blue-600 animate-spin" />
            <div className="flex-1">
              <p className="text-blue-800 font-medium">AI is reading your receipt...</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-blue-600 mt-1">{progress}% analyzed</p>
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
          
          {preview && !isProcessing && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Data extracted successfully!</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Vendor:</span>
                  <p className="font-medium text-gray-900">{preview.vendor}</p>
                </div>
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <p className="font-medium text-gray-900">${preview.amount.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <p className="font-medium text-gray-900">{preview.date}</p>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium text-gray-900">{preview.category}</p>
                </div>
              </div>
            </div>
          )}
          
          {!isProcessing && (
            <div className="flex space-x-3">
              <button
                onClick={retakePhoto}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Retake
              </button>
              <button
                onClick={confirmReceipt}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <CameraIcon className="h-10 w-10 text-blue-500" />
            </div>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
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
                Upload from Gallery
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG • Max 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
}