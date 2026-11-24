'use client'

import React, { useState } from 'react'
import { Garment, GarmentCategory, Season, Occasion } from '@/types/wardrobe'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, ArrowRight, AlertCircle, RotateCcw } from 'lucide-react'

interface UploadClothesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddGarment: (garment: Garment) => void
}

const SAMPLE_PRESETS = [
  {
    name: "Levi's The Trucker Denim Jacket",
    category: 'Jackets & Outerwear' as GarmentCategory,
    color: { name: 'Washed Indigo', hex: '#415B76', family: 'Blue' as const },
    brand: "Levi's",
    season: 'Autumn' as Season,
    occasion: 'Casual' as Occasion,
    material: '100% Cotton Rigid Denim',
    pattern: 'Washed Denim Twill',
    imageFront: 'https://assets.myntassets.com/h_1440,q_80,w_1080/v1/assets/images/2024/NOVEMBER/13/tK40bZqY_212e8ba313164a66a1a1f0ae0041a052.jpg',
    price: 110,
  },
  {
    name: 'Louis Philippe Classic Linen Shirt',
    category: 'Tops' as GarmentCategory,
    color: { name: 'Ecru Off-White', hex: '#F0ECE1', family: 'Neutral' as const },
    brand: 'Louis Philippe',
    season: 'Summer' as Season,
    occasion: 'Smart Casual' as Occasion,
    material: '100% French Normandy Linen',
    pattern: 'Solid Plain Weave',
    imageFront: 'https://assets.myntassets.com/h_1440,q_80,w_1080/v1/assets/images/30349479/2024/7/24/ce1dd3ec-5992-4919-8664-d3a3d5ea75ee1721815152847-Louis-Philippe-Men-Shirts-8991721815152562-1.jpg',
    price: 85,
  },
  {
    name: 'Arrow Tailored Formal Trousers',
    category: 'Bottoms' as GarmentCategory,
    color: { name: 'Charcoal Grey', hex: '#373A40', family: 'Monochrome' as const },
    brand: 'Arrow',
    season: 'All Season' as Season,
    occasion: 'Work / Formal' as Occasion,
    material: 'Poly-Viscose Wool Blend',
    pattern: 'Micro Texture',
    imageFront: 'https://assets.myntassets.com/h_1440,q_80,w_1080/v1/assets/images/23978586/2023/7/11/ad39d1b6-bb07-42fc-8ebc-d9c02ff2a0db1689073041285-Arrow-Men-Trousers-5921689073040854-1.jpg',
    price: 65,
  },
]

export function UploadClothesModal({
  open,
  onOpenChange,
  onAddGarment,
}: UploadClothesModalProps) {
  // Steps: 'upload' | 'analyzing' | 'error' | 'review'
  const [step, setStep] = useState<'upload' | 'analyzing' | 'error' | 'review'>('upload')
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0)
  const [customImageUrl, setCustomImageUrl] = useState('')

  const [name, setName] = useState(SAMPLE_PRESETS[0].name)
  const [category, setCategory] = useState<GarmentCategory>(SAMPLE_PRESETS[0].category)
  const [colorName, setColorName] = useState(SAMPLE_PRESETS[0].color.name)
  const [colorHex, setColorHex] = useState(SAMPLE_PRESETS[0].color.hex)
  const [brand, setBrand] = useState(SAMPLE_PRESETS[0].brand)
  const [season, setSeason] = useState<Season>(SAMPLE_PRESETS[0].season)
  const [occasion, setOccasion] = useState<Occasion>(SAMPLE_PRESETS[0].occasion)
  const [material, setMaterial] = useState(SAMPLE_PRESETS[0].material)
  const [pattern, setPattern] = useState(SAMPLE_PRESETS[0].pattern)
  const [price, setPrice] = useState(SAMPLE_PRESETS[0].price)
  const [imageUrl, setImageUrl] = useState(SAMPLE_PRESETS[0].imageFront)
  const [isManualEntry, setIsManualEntry] = useState(false)

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx)
    const p = SAMPLE_PRESETS[idx]
    setName(p.name)
    setCategory(p.category)
    setColorName(p.color.name)
    setColorHex(p.color.hex)
    setBrand(p.brand)
    setSeason(p.season)
    setOccasion(p.occasion)
    setMaterial(p.material)
    setPattern(p.pattern)
    setPrice(p.price)
    setImageUrl(p.imageFront)
  }

  const startAnalysis = () => {
    setStep('analyzing')
    setTimeout(() => {
      setStep('review')
    }, 1100)
  }

  const triggerManualEntry = () => {
    setIsManualEntry(true)
    setName('')
    setCategory('Tops')
    setColorName('Neutral')
    setColorHex('#E4DFD8')
    setBrand('')
    setMaterial('')
    setPattern('')
    setPrice(150)
    setImageUrl('https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80')
    setStep('review')
  }

  const handleSave = () => {
    const newGarment: Garment = {
      id: `g-${Date.now()}`,
      name: name.trim() || 'Custom Piece',
      category: category as any,
      color: { name: colorName || 'Natural', hex: colorHex || '#FAF9F6', family: 'Neutral' },
      brand: brand.trim() || 'Studio Archive',
      season,
      occasion,
      material: material.trim() || 'Natural textile',
      pattern: pattern.trim() || 'Solid weave',
      imageFront: imageUrl,
      favorite: false,
      wearCount: 0,
      price: Number(price) || 120,
      dateAdded: new Date().toISOString().split('T')[0],
      notes: isManualEntry ? 'Manually catalogued item.' : 'Catalogued via automated vision intake.',
    }

    onAddGarment(newGarment)
    onOpenChange(false)
    setStep('upload')
    setIsManualEntry(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-[#E8E4DC] text-[#181716] p-6 sm:p-8 rounded-none shadow-none">
        <DialogHeader className="pb-4 border-b border-[#E8E4DC]">
          <DialogTitle className="text-xl font-serif font-normal tracking-tight text-[#181716]">
            Catalogue New Garment
          </DialogTitle>
          <DialogDescription className="text-xs text-[#6E6962] font-light">
            Upload garment photography. Image segmentation and attribute classification will run automatically.
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: UPLOAD OR CHOOSE PRESET */}
        {step === 'upload' && (
          <div className="space-y-6 pt-4">
            {/* Minimalist Dropzone */}
            <div
              onClick={startAnalysis}
              className="border border-dashed border-[#E8E4DC] hover:border-[#181716] bg-[#FAF9F6] p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 bg-white border border-[#E8E4DC] flex items-center justify-center text-[#6E6962] mb-3">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-[#181716] mb-1">
                Upload garment photography or drag images here
              </p>
              <p className="text-[11px] text-[#96918A]">
                High-resolution PNG, JPG, or WEBP with neutral background
              </p>
            </div>

            {/* Curated Sample Presets */}
            <div>
              <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-2 block">
                Or test with sample garments:
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {SAMPLE_PRESETS.map((item, idx) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectPreset(idx)}
                    className={`flex items-center gap-2.5 p-2.5 border text-left transition-colors ${
                      selectedPresetIndex === idx
                        ? 'border-[#181716] bg-[#FAF9F6] text-[#181716]'
                        : 'border-[#E8E4DC] bg-white text-[#6E6962] hover:border-[#181716]'
                    }`}
                  >
                    <img
                      src={item.imageFront}
                      alt={item.name}
                      className="w-10 h-12 object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-serif truncate text-[#181716]">{item.name}</div>
                      <div className="text-[10px] text-[#96918A] font-mono">{item.brand}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct URL or Manual Fallback */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A]">
                  Direct Image URL (Optional)
                </Label>
                <button
                  type="button"
                  onClick={triggerManualEntry}
                  className="text-[10px] text-[#6E6962] hover:text-[#181716] underline underline-offset-2"
                >
                  Enter Details Manually
                </button>
              </div>
              <Input
                type="url"
                placeholder="https://..."
                value={customImageUrl}
                onChange={(e) => {
                  setCustomImageUrl(e.target.value)
                  setImageUrl(e.target.value)
                }}
                className="h-9 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-none focus-visible:ring-[#181716] shadow-none"
              />
            </div>

            {/* Action */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={startAnalysis}
                className="bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider px-5 h-9 rounded-none shadow-none gap-2"
              >
                <span>Process Garment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: ANALYZING SIMULATION */}
        {step === 'analyzing' && (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#181716] border-t-transparent rounded-full animate-spin mb-2" />
            <h3 className="text-base font-serif font-normal text-[#181716]">
              Analyzing garment attributes...
            </h3>
            <p className="text-xs text-[#6E6962] font-light">
              Isolating silhouette • Detecting weave & composition • Extracting palette
            </p>
          </div>
        )}

        {/* STEP 3: REVIEW & CONFIRM */}
        {step === 'review' && (
          <div className="space-y-6 pt-3">
            <div className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#E8E4DC] text-xs text-[#181716]">
              <span className="font-light">
                {isManualEntry
                  ? 'Manual entry enabled. Complete specifications below.'
                  : 'Attributes identified. Verify specifications prior to archiving.'}
              </span>
              <span className="font-mono text-[10px] uppercase text-[#6E6962] tracking-wider">
                {isManualEntry ? 'Manual Input' : 'Classification Complete'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
              <div className="sm:col-span-4 flex flex-col items-center">
                <div className="w-full aspect-[3/4] bg-[#FAF9F6] border border-[#E8E4DC] overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={name || 'New piece'}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <span className="text-[10px] text-[#96918A] mt-2 font-mono uppercase tracking-wider">
                  Isolated Cutout
                </span>
              </div>

              <div className="sm:col-span-8 space-y-3.5">
                <div>
                  <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                    Garment Name
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Silk Crepe Shirtdress"
                    className="h-8 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-none shadow-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Category
                    </Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full h-8 px-2.5 text-xs bg-[#FAF9F6] border border-[#E8E4DC] text-[#181716] rounded-none focus:outline-none"
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
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Levi's"
                      className="h-8 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-none shadow-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Colorway
                    </Label>
                    <Input
                      value={colorName}
                      onChange={(e) => setColorName(e.target.value)}
                      className="h-8 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-none shadow-none"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Seasonality
                    </Label>
                    <select
                      value={season}
                      onChange={(e) => setSeason(e.target.value as any)}
                      className="w-full h-8 px-2.5 text-xs bg-[#FAF9F6] border border-[#E8E4DC] text-[#181716] rounded-none focus:outline-none"
                    >
                      <option value="All Season">All Season</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Autumn">Autumn</option>
                      <option value="Winter">Winter</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Occasion
                    </Label>
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value as any)}
                      className="w-full h-8 px-2.5 text-xs bg-[#FAF9F6] border border-[#E8E4DC] text-[#181716] rounded-none focus:outline-none"
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
                      Composition
                    </Label>
                    <Input
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="e.g. 100% Merino Wool"
                      className="h-8 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-none shadow-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Pattern / Weave
                    </Label>
                    <Input
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="e.g. Fine Ribbed"
                      className="h-8 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-none shadow-none"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] mb-1 block">
                      Price ($ USD)
                    </Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="h-8 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-none shadow-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E8E4DC]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('upload')}
                className="text-xs text-[#6E6962] hover:text-[#181716] rounded-none"
              >
                Back
              </Button>

              <Button
                onClick={handleSave}
                className="bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider px-5 h-9 rounded-none shadow-none"
              >
                Archive to Wardrobe
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
