'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Garment, GarmentCategory, Season, Occasion, UploadBatchItem } from '@/types/wardrobe'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowRight,
  X,
  AlertCircle,
  Camera,
  ImagePlus,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'

interface AddClothesWorkflowProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddGarments: (garments: Garment[]) => void
  initialMode?: 'upload' | 'review' | 'ambiguous_state'
}

const DEMO_PRESETS: Array<Omit<UploadBatchItem, 'id'> & { id?: string }> = [
  {
    previewUrl: 'https://assets.myntassets.com/h_1440,q_80,w_1080/v1/assets/images/2024/NOVEMBER/13/tK40bZqY_212e8ba313164a66a1a1f0ae0041a052.jpg',
    name: "Levi's The Trucker Denim Jacket",
    status: 'complete',
    progress: 100,
    attributes: {
      category: 'Jackets & Outerwear',
      brand: "Levi's",
      color: { name: 'Washed Indigo', hex: '#415B76', family: 'Blue' },
      season: 'Autumn',
      occasion: 'Casual',
      material: '100% Cotton Rigid Denim',
      pattern: 'Washed Denim Twill',
      price: 110,
    },
  },
  {
    previewUrl: 'https://assets.myntassets.com/h_1440,q_80,w_1080/v1/assets/images/30349479/2024/7/24/ce1dd3ec-5992-4919-8664-d3a3d5ea75ee1721815152847-Louis-Philippe-Men-Shirts-8991721815152562-1.jpg',
    name: 'Louis Philippe Classic Linen Shirt',
    status: 'flagged',
    progress: 100,
    detectedFlags: [
      'Color family confidence 74% (Ambiguous between Off-White and Light Ecru)',
      'Collar style identified as Semi-Cutaway',
    ],
    attributes: {
      category: 'Tops',
      brand: 'Louis Philippe',
      color: { name: 'Ecru Off-White', hex: '#F0ECE1', family: 'Neutral' },
      season: 'Summer',
      occasion: 'Smart Casual',
      material: '100% French Normandy Linen',
      pattern: 'Solid Plain Weave',
      price: 85,
    },
  },
  {
    previewUrl: 'https://assets.myntassets.com/h_1440,q_80,w_1080/v1/assets/images/30397576/2024/8/1/bc1458d3-356b-45e3-a618-9c16d555cff21722513476483-Levis-Men-Jeans-1931722513476045-1.jpg',
    name: "Levi's 512 Slim Tapered Jeans",
    status: 'complete',
    progress: 100,
    attributes: {
      category: 'Bottoms',
      brand: "Levi's",
      color: { name: 'Dark Indigo Rinse', hex: '#242C3D', family: 'Blue' },
      season: 'All Season',
      occasion: 'Casual',
      material: '99% Cotton, 1% Elastane Denim',
      pattern: 'Dark Clean Rinse',
      price: 98,
    },
  },
]

export function AddClothesWorkflow({
  open,
  onOpenChange,
  onAddGarments,
  initialMode = 'upload',
}: AddClothesWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyzing' | 'review' | 'ambiguous_state'>(
    initialMode
  )
  const [batchItems, setBatchItems] = useState<UploadBatchItem[]>(() =>
    DEMO_PRESETS.slice(0, 2).map((item, idx) => ({
      ...item,
      id: `preset-${Date.now()}-${idx}`,
    }))
  )
  const [activeReviewIndex, setActiveReviewIndex] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState('Scanning garments...')
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setCurrentStep(initialMode)
      setValidationError(null)
    }
  }, [open, initialMode])

  const activeItem = batchItems[activeReviewIndex] || batchItems[0]

  // Update batch items helper
  const updateActiveItemAttribute = (key: keyof Garment | 'name', value: any) => {
    setValidationError(null)
    setBatchItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== activeReviewIndex) return item
        if (key === 'name') {
          return { ...item, name: value }
        }
        return {
          ...item,
          attributes: {
            ...item.attributes,
            [key]: value,
          },
        }
      })
    )
  }

  // Handle native file selection
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newItems: UploadBatchItem[] = Array.from(files).map((file, idx) => {
      const previewUrl = URL.createObjectURL(file)
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1) || 'Uploaded Garment'

      return {
        id: `upload-${Date.now()}-${idx}`,
        file,
        previewUrl,
        name: capitalized,
        status: 'complete',
        progress: 100,
        attributes: {
          category: 'Tops',
          brand: 'Atelier Archive',
          color: { name: 'Natural Sand', hex: '#EAE6DF', family: 'Neutral' },
          season: 'All Season',
          occasion: 'Smart Casual',
          material: '100% Organic Cotton',
          pattern: 'Solid',
          price: 180,
        },
      }
    })

    setBatchItems((prev) => [...newItems, ...prev])
    startAnalysis()
  }

  const handleNativeFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  // Add a preset garment
  const handleAddPreset = (presetIndex: number) => {
    const preset = DEMO_PRESETS[presetIndex]
    const newItem: UploadBatchItem = {
      ...preset,
      id: `preset-${Date.now()}-${presetIndex}`,
    }
    setBatchItems((prev) => [...prev, newItem])
  }

  // Simulated AI analysis with real progress ticks
  const startAnalysis = () => {
    setCurrentStep('analyzing')
    setAnalysisProgress(15)
    setAnalysisStage('Isolating clothing silhouette and removing background...')

    setTimeout(() => {
      setAnalysisProgress(45)
      setAnalysisStage('Classifying garment type, color palette, and season...')
    }, 450)

    setTimeout(() => {
      setAnalysisProgress(80)
      setAnalysisStage('Extracting fabric weave, brand tag, and confidence scores...')
    }, 900)

    setTimeout(() => {
      setAnalysisProgress(100)
      setAnalysisStage('Detection complete!')
      setTimeout(() => {
        setCurrentStep('review')
        setActiveReviewIndex(0)
      }, 350)
    }, 1300)
  }

  const removeItem = (id: string) => {
    const next = batchItems.filter((b) => b.id !== id)
    setBatchItems(next)
    if (activeReviewIndex >= next.length) {
      setActiveReviewIndex(Math.max(0, next.length - 1))
    }
  }

  const handleCommitAll = () => {
    // Validate that every item has a name
    const invalidItem = batchItems.find((i) => !i.name.trim())
    if (invalidItem) {
      setValidationError('Please provide a garment title for each item before saving.')
      return
    }

    const newGarments: Garment[] = batchItems.map((item, idx) => {
      const attrs = item.attributes || {}
      return {
        id: `g-${Date.now()}-${idx}`,
        name: item.name.trim(),
        category: (attrs.category as any) || 'Tops',
        color: attrs.color || { name: 'Natural Sand', hex: '#FAF9F6', family: 'Neutral' },
        brand: attrs.brand || 'Studio Archive',
        season: attrs.season || 'All Season',
        occasion: attrs.occasion || 'Smart Casual',
        material: attrs.material || 'Organic Cotton',
        pattern: attrs.pattern || 'Solid',
        imageFront: item.previewUrl,
        favorite: false,
        wearCount: 0,
        price: Number(attrs.price) || 160,
        dateAdded: new Date().toISOString().split('T')[0],
        notes: attrs.material ? `Identified as ${attrs.material}.` : 'Catalogued via AI intake.',
      }
    })

    onAddGarments(newGarments)
    onOpenChange(false)
    setCurrentStep('upload')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-3xl bg-white border-[#E8E4DC] text-[#181716] p-0 rounded-lg sm:rounded-xl shadow-none overflow-hidden max-h-[92vh] flex flex-col">
        {/* Hidden Native File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleNativeFileInput}
          multiple
          accept="image/*"
          className="hidden"
        />

        {/* Top Masthead */}
        <div className="p-4 sm:p-6 flex items-center justify-between bg-[#FAF9F6] shrink-0">
          <div className="pr-2">
            <DialogTitle className="text-lg sm:text-xl font-serif font-normal tracking-tight text-[#181716]">
              {currentStep === 'upload' && 'Add Clothes'}
              {currentStep === 'analyzing' && 'Analyzing Clothes'}
              {currentStep === 'review' && 'Review Details'}
              {currentStep === 'ambiguous_state' && 'Confirm Details'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6E6962] font-light mt-0.5">
              {currentStep === 'upload' && 'Upload photos of your clothes to automatically identify their attributes.'}
              {currentStep === 'analyzing' && analysisStage}
              {currentStep === 'review' && 'Check the detected attributes and adjust anything before adding to your wardrobe.'}
              {currentStep === 'ambiguous_state' && 'Confirm details that require manual verification.'}
            </DialogDescription>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="text-[#6E6962] hover:text-[#181716] p-2 -mr-1"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── STEP 1: UPLOAD (DROPZONE & BATCH QUEUE) ── */}
        {currentStep === 'upload' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
            {/* Primary Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed p-6 sm:p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center rounded-md ${
                isDragging
                  ? 'border-[#181716] bg-[#F2EFE9]'
                  : 'border-[#E8E4DC] hover:border-[#181716] bg-[#FAF9F6]'
              }`}
            >
              <div className="w-12 h-12 bg-white border border-[#E8E4DC] flex items-center justify-center text-[#181716] mb-3 rounded-md">
                <Camera className="w-5 h-5 text-[#6E6962]" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#181716] mb-1">
                Drop clothing images here or click to browse
              </p>
              <p className="text-[11px] text-[#96918A]">
                Supports multiple files (JPG, PNG, WEBP)
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#181716] text-[#FAF9F6] text-xs font-sans uppercase tracking-wider rounded-md">
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span>Select Files</span>
                </span>
              </div>
            </div>

            {/* Quick Demo Sample Presets */}
            <div className="space-y-2">
              <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block">
                Quick Demo Presets:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddPreset(0)}
                  className="px-2.5 py-1 min-h-[36px] flex items-center text-xs bg-white border border-[#E8E4DC] text-[#6E6962] hover:text-[#181716] hover:border-[#181716] transition-colors rounded-md"
                >
                  + Denim Jacket
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset(1)}
                  className="px-2.5 py-1 min-h-[36px] flex items-center text-xs bg-white border border-[#E8E4DC] text-[#6E6962] hover:text-[#181716] hover:border-[#181716] transition-colors rounded-md"
                >
                  + Linen Shirt
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset(2)}
                  className="px-2.5 py-1 min-h-[36px] flex items-center text-xs bg-white border border-[#E8E4DC] text-[#6E6962] hover:text-[#181716] hover:border-[#181716] transition-colors rounded-md"
                >
                  + Slim Jeans
                </button>
              </div>
            </div>

            {/* Batch Intake Queue Preview */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A]">
                  Upload Queue ({batchItems.length} Pieces)
                </span>
                {batchItems.length > 0 && (
                  <button
                    onClick={() => setBatchItems([])}
                    className="text-xs text-[#96918A] hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {batchItems.length > 0 ? (
                <div className="space-y-2.5">
                  {batchItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-[#FAF9F6] flex items-center gap-3 sm:gap-4 rounded-md"
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-12 h-14 object-cover shrink-0 rounded"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-serif text-[#181716] truncate">{item.name}</span>
                          <span className="text-[10px] font-mono text-[#6E6962]">
                            {item.status === 'flagged' ? 'Flagged for Review' : 'Ready'}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-[#E8E4DC] overflow-hidden rounded-full">
                          <div className="h-full bg-[#181716] w-full" />
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#96918A] hover:text-[#181716] p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full"
                        title="Remove"
                        aria-label="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-[#E8E4DC] text-xs text-[#96918A] rounded-md">
                  No images selected yet. Choose files or add a demo preset above.
                </div>
              )}
            </div>

            {/* Bottom Actions Sticky */}
            <div className="sticky bottom-0 bg-[#FAF9F6] pt-3 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-[#E8E4DC] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep('ambiguous_state')}
                className="text-[11px] text-[#6E6962] hover:text-[#181716] underline underline-offset-4"
              >
                Inspect Ambiguous State (7A)
              </button>

              <Button
                onClick={startAnalysis}
                disabled={batchItems.length === 0}
                className="bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider px-5 h-10 sm:h-9 rounded-md shadow-none gap-2 disabled:opacity-40"
              >
                <span>Analyze Photos ({batchItems.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: ANALYZING SIMULATION ── */}
        {currentStep === 'analyzing' && (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-4 px-6">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-[#181716] border-t-transparent rounded-full animate-spin" />
              <div className="w-2 h-2 rounded-full bg-[#181716] absolute" />
            </div>

            <h3 className="text-lg font-serif font-normal text-[#181716]">
              {analysisStage}
            </h3>

            <div className="w-64 max-w-full space-y-1.5">
              <div className="w-full h-1.5 bg-[#E8E4DC] overflow-hidden rounded-full">
                <div
                  className="h-full bg-[#181716] transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#6E6962] block text-right">
                {analysisProgress}%
              </span>
            </div>
          </div>
        )}

        {/* ── STEP 3: REVIEW AI-DETECTED DETAILS ── */}
        {currentStep === 'review' && activeItem && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-5">
            {/* Batch Selector Tabs with Touch Swipe */}
            <div className="flex items-center gap-2 pb-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] uppercase font-sans tracking-widest text-[#96918A] shrink-0 mr-1">
                Batch Pieces ({batchItems.length}):
              </span>
              {batchItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveReviewIndex(idx)}
                  className={`px-3 py-1.5 text-xs whitespace-nowrap shrink-0 min-h-[36px] flex items-center gap-1.5 transition-colors rounded-md ${
                    activeReviewIndex === idx
                      ? 'bg-[#181716] text-[#FAF9F6] font-medium'
                      : 'bg-[#FAF9F6] text-[#6E6962] hover:text-[#181716]'
                  }`}
                >
                  <span>Piece 0{idx + 1}</span>
                  {item.status === 'flagged' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-3 bg-red-50 text-red-800 text-xs flex items-center gap-2 rounded-md">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Flagged Item Warning */}
            {activeItem.status === 'flagged' && (
              <div className="p-3 bg-[#FAF7F0] text-xs text-[#181716] flex items-start gap-2 rounded-md">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-medium">AI Flagged Attributes</span>
                  <p className="text-[11px] text-[#6E6962]">
                    {activeItem.detectedFlags?.[0] || 'Please review pattern and brand tag.'}
                  </p>
                </div>
              </div>
            )}

            {/* Split Review: Image Cutout on Left, Editable Form on Right */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 items-start">
              <div className="sm:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[240px] sm:max-w-none aspect-[3/4] bg-[#FAF9F6] overflow-hidden rounded-md">
                  <img
                    src={activeItem.previewUrl}
                    alt={activeItem.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="flex items-center justify-between w-full mt-2 text-[10px] text-[#96918A] font-mono uppercase">
                  <span>AI Isolated</span>
                  <button
                    onClick={() => removeItem(activeItem.id)}
                    className="text-red-600 hover:underline"
                  >
                    Remove from Batch
                  </button>
                </div>
              </div>

              {/* Editable Form */}
              <div className="sm:col-span-7 space-y-3.5">
                <div>
                  <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                    Garment Title *
                  </Label>
                  <Input
                    value={activeItem.name}
                    onChange={(e) => updateActiveItemAttribute('name', e.target.value)}
                    className="h-10 sm:h-8 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-md shadow-none focus-visible:ring-1 focus-visible:ring-[#181716]"
                  />
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Category
                    </Label>
                    <select
                      value={activeItem.attributes?.category || 'Tops'}
                      onChange={(e) => updateActiveItemAttribute('category', e.target.value)}
                      className="w-full h-10 sm:h-8 px-2.5 text-xs bg-[#FAF9F6] border border-[#E8E4DC] text-[#181716] rounded-md focus:outline-none focus:border-[#181716]"
                    >
                      <option value="Tops">Tops</option>
                      <option value="Bottoms">Bottoms</option>
                      <option value="Jackets & Outerwear">Jackets & Outerwear</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Brand / House
                    </Label>
                    <Input
                      value={activeItem.attributes?.brand || ''}
                      onChange={(e) => updateActiveItemAttribute('brand', e.target.value)}
                      className="h-10 sm:h-8 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-md shadow-none focus-visible:ring-1 focus-visible:ring-[#181716]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Colorway
                    </Label>
                    <Input
                      value={activeItem.attributes?.color?.name || ''}
                      onChange={(e) =>
                        updateActiveItemAttribute('color', {
                          ...activeItem.attributes?.color,
                          name: e.target.value,
                        })
                      }
                      className="h-10 sm:h-8 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-md shadow-none focus-visible:ring-1 focus-visible:ring-[#181716]"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Seasonality
                    </Label>
                    <select
                      value={activeItem.attributes?.season || 'Autumn'}
                      onChange={(e) => updateActiveItemAttribute('season', e.target.value)}
                      className="w-full h-10 sm:h-8 px-2.5 text-xs bg-[#FAF9F6] border border-[#E8E4DC] text-[#181716] rounded-md focus:outline-none focus:border-[#181716]"
                    >
                      <option value="All Season">All Season</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Autumn">Autumn</option>
                      <option value="Winter">Winter</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Occasion
                    </Label>
                    <select
                      value={activeItem.attributes?.occasion || 'Smart Casual'}
                      onChange={(e) => updateActiveItemAttribute('occasion', e.target.value)}
                      className="w-full h-10 sm:h-8 px-2.5 text-xs bg-[#FAF9F6] border border-[#E8E4DC] text-[#181716] rounded-md focus:outline-none focus:border-[#181716]"
                    >
                      <option value="Casual">Casual</option>
                      <option value="Smart Casual">Smart Casual</option>
                      <option value="Work / Formal">Work / Formal</option>
                      <option value="Evening">Evening</option>
                      <option value="Active">Active</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Material
                    </Label>
                    <Input
                      value={activeItem.attributes?.material || ''}
                      onChange={(e) => updateActiveItemAttribute('material', e.target.value)}
                      className="h-10 sm:h-8 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-md shadow-none focus-visible:ring-1 focus-visible:ring-[#181716]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Pattern / Weave
                    </Label>
                    <Input
                      value={activeItem.attributes?.pattern || ''}
                      onChange={(e) => updateActiveItemAttribute('pattern', e.target.value)}
                      className="h-10 sm:h-8 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-md shadow-none focus-visible:ring-1 focus-visible:ring-[#181716]"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Price ($ USD)
                    </Label>
                    <Input
                      type="number"
                      value={activeItem.attributes?.price || 150}
                      onChange={(e) => updateActiveItemAttribute('price', Number(e.target.value))}
                      className="h-10 sm:h-8 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-md shadow-none focus-visible:ring-1 focus-visible:ring-[#181716]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Sticky */}
            <div className="sticky bottom-0 bg-[#FAF9F6] pt-3 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-[#E8E4DC] flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep('upload')}
                className="text-xs text-[#6E6962] hover:text-[#181716] rounded-md h-10 sm:h-9"
              >
                Back to Upload
              </Button>

              <Button
                onClick={handleCommitAll}
                className="bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider px-5 sm:px-6 h-10 sm:h-9 rounded-md shadow-none"
              >
                Add {batchItems.length} {batchItems.length === 1 ? 'Piece' : 'Pieces'} to Wardrobe
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 4: AMBIGUOUS STATE (SCREEN 7A) ── */}
        {currentStep === 'ambiguous_state' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-5">
            <div className="p-4 bg-[#F5F2EB] space-y-1.5 rounded-md">
              <div className="flex items-center gap-2 text-xs font-medium text-[#181716]">
                <AlertCircle className="w-4 h-4 text-[#6E6962] shrink-0" />
                <span>Attribute Confirmation Needed</span>
              </div>
              <p className="text-xs text-[#6E6962] font-light leading-relaxed">
                The garment silhouette was identified clearly, but the fabric weave pattern needs confirmation due to shadow contrast.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 items-start">
              <div className="sm:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[240px] sm:max-w-none aspect-[3/4] bg-[#FAF9F6] overflow-hidden rounded-md">
                  <img
                    src="https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=900&q=80"
                    alt="Ambiguous knit"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="sm:col-span-7 space-y-4">
                <div className="p-4 bg-[#FAF9F6] space-y-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A]">
                      Ambiguous Attribute: Fabric Pattern
                    </span>
                    <span className="text-[10px] font-mono text-[#6E6962]">Confidence: 68%</span>
                  </div>

                  <p className="text-xs text-[#181716] font-serif">
                    Please confirm the primary knit structure:
                  </p>

                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                    <button
                      onClick={() => updateActiveItemAttribute('pattern', 'Fine Rib Knit')}
                      className={`p-3 text-xs text-left transition-colors min-h-[52px] rounded-md ${
                        activeItem?.attributes?.pattern === 'Fine Rib Knit'
                          ? 'ring-2 ring-[#181716] bg-white text-[#181716]'
                          : 'bg-white text-[#6E6962] hover:text-[#181716]'
                      }`}
                    >
                      <span className="font-medium block">Fine Rib Knit</span>
                      <span className="text-[10px] text-[#96918A]">Vertical textured ridges</span>
                    </button>

                    <button
                      onClick={() => updateActiveItemAttribute('pattern', 'Solid Flat Knit')}
                      className={`p-3 text-xs text-left transition-colors min-h-[52px] rounded-md ${
                        activeItem?.attributes?.pattern === 'Solid Flat Knit'
                          ? 'ring-2 ring-[#181716] bg-white text-[#181716]'
                          : 'bg-white text-[#6E6962] hover:text-[#181716]'
                      }`}
                    >
                      <span className="font-medium block">Solid Flat Knit</span>
                      <span className="text-[10px] text-[#96918A]">Smooth non-textured finish</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF9F6] space-y-2 rounded-md">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block">
                    Brand Tag Detection: Unconfirmed
                  </span>
                  <Input
                    value={activeItem?.attributes?.brand || ''}
                    onChange={(e) => updateActiveItemAttribute('brand', e.target.value)}
                    placeholder="Enter brand name manually (e.g. Louis Philippe)"
                    className="h-10 sm:h-8 text-xs bg-white border-[#E8E4DC] text-[#181716] rounded-md shadow-none focus-visible:ring-1 focus-visible:ring-[#181716]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="sticky bottom-0 bg-[#FAF9F6] pt-3 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-[#E8E4DC] flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep('upload')}
                className="text-xs text-[#6E6962] hover:text-[#181716] rounded-md h-10 sm:h-9"
              >
                Return to Intake
              </Button>

              <Button
                onClick={() => setCurrentStep('review')}
                className="bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider px-5 h-10 sm:h-9 rounded-md shadow-none"
              >
                Confirm Detections
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
