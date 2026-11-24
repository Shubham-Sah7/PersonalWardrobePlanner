'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Garment, Outfit, Occasion, Season, GarmentCategory } from '@/types/wardrobe'
import {
  Plus,
  X,
  Check,
  CloudSun,
  BookmarkPlus,
  Search,
  RotateCcw,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface OutfitStudioProps {
  garments: Garment[]
  outfits: Outfit[]
  onSaveOutfit: (outfit: Outfit) => void
  onMarkWorn: (garmentId: string) => void
  initialOutfit?: Outfit | null
  onCancelEdit?: () => void
}

export function OutfitStudio({
  garments,
  outfits,
  onSaveOutfit,
  onMarkWorn,
  initialOutfit = null,
  onCancelEdit,
}: OutfitStudioProps) {
  // Slots in active canvas
  const [jacket, setJacket] = useState<Garment | null>(null)
  const [top, setTop] = useState<Garment | null>(null)
  const [bottom, setBottom] = useState<Garment | null>(null)
  const [shoes, setShoes] = useState<Garment | null>(null)
  const [accessory, setAccessory] = useState<Garment | null>(null)

  // Drag and drop state
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null)

  // Picker state
  const [activeSlotTarget, setActiveSlotTarget] = useState<
    'Jackets' | 'Tops' | 'Bottoms' | 'Shoes' | 'Accessories' | null
  >(null)
  const [pickerCategory, setPickerCategory] = useState<GarmentCategory | 'All'>('All')
  const [pickerSearch, setPickerSearch] = useState('')

  const [outfitTitle, setOutfitTitle] = useState('')
  const [outfitOccasion, setOutfitOccasion] = useState<Occasion>('Smart Casual')
  const [outfitSeason, setOutfitSeason] = useState<Season>('Autumn')
  const [outfitNotes, setOutfitNotes] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [activeOutfitId, setActiveOutfitId] = useState<string | null>(null)

  const pickerRef = useRef<HTMLDivElement>(null)

  // Initialize or populate from initialOutfit
  useEffect(() => {
    if (initialOutfit) {
      setActiveOutfitId(initialOutfit.id)
      setOutfitTitle(initialOutfit.title)
      setOutfitOccasion(initialOutfit.occasion)
      setOutfitSeason(initialOutfit.season)
      setOutfitNotes(initialOutfit.notes || '')

      const findInOutfit = (cat: string) =>
        initialOutfit.items.find((i) => i.category === cat) || null

      setJacket(findInOutfit('Jackets & Outerwear'))
      setTop(findInOutfit('Tops'))
      setBottom(findInOutfit('Bottoms'))
      setShoes(findInOutfit('Shoes'))
      setAccessory(findInOutfit('Accessories'))
    } else {
      setActiveOutfitId(null)
      setOutfitTitle('Weekend Casual Denim Uniform')
      setOutfitOccasion('Casual')
      setOutfitSeason('Autumn')
      setOutfitNotes('A relaxed weekend combination: classic denim jacket layered over white organic crewneck, slim indigo denim, white court sneakers, and heritage leather field watch.')
      setJacket(garments.find((g) => g.id === 'g-18') || null)
      setTop(garments.find((g) => g.id === 'g-01') || null)
      setBottom(garments.find((g) => g.id === 'g-11') || null)
      setShoes(garments.find((g) => g.id === 'g-25') || null)
      setAccessory(garments.find((g) => g.id === 'g-31') || null)
    }
  }, [initialOutfit, garments])

  // Smooth scroll to the garment picker when a slot is tapped on mobile
  useEffect(() => {
    if (activeSlotTarget && window.innerWidth < 1024) {
      setTimeout(() => {
        pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [activeSlotTarget])

  const activeItems = useMemo(
    () => [jacket, top, bottom, shoes, accessory].filter(Boolean) as Garment[],
    [jacket, top, bottom, shoes, accessory]
  )

  const handleSlotClick = (slot: 'Jackets' | 'Tops' | 'Bottoms' | 'Shoes' | 'Accessories') => {
    setActiveSlotTarget(slot)
    if (slot === 'Jackets') setPickerCategory('Jackets & Outerwear')
    else if (slot === 'Tops') setPickerCategory('Tops')
    else if (slot === 'Bottoms') setPickerCategory('Bottoms')
    else if (slot === 'Shoes') setPickerCategory('Shoes')
    else if (slot === 'Accessories') setPickerCategory('Accessories')
  }

  const handleSelectGarmentForSlot = (item: Garment) => {
    if (activeSlotTarget) {
      if (activeSlotTarget === 'Jackets') setJacket(item)
      else if (activeSlotTarget === 'Tops') setTop(item)
      else if (activeSlotTarget === 'Bottoms') setBottom(item)
      else if (activeSlotTarget === 'Shoes') setShoes(item)
      else if (activeSlotTarget === 'Accessories') setAccessory(item)
    } else {
      // Auto-assign based on garment category
      if (item.category === 'Jackets & Outerwear') setJacket(item)
      else if (item.category === 'Tops') setTop(item)
      else if (item.category === 'Bottoms') setBottom(item)
      else if (item.category === 'Shoes') setShoes(item)
      else if (item.category === 'Accessories') setAccessory(item)
    }

    setActiveSlotTarget(null)
  }

  const handleClearSlot = (slot: 'jacket' | 'top' | 'bottom' | 'shoes' | 'accessory') => {
    if (slot === 'jacket') setJacket(null)
    if (slot === 'top') setTop(null)
    if (slot === 'bottom') setBottom(null)
    if (slot === 'shoes') setShoes(null)
    if (slot === 'accessory') setAccessory(null)
  }

  const handleClearAll = () => {
    setJacket(null)
    setTop(null)
    setBottom(null)
    setShoes(null)
    setAccessory(null)
  }

  // HTML5 Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, garment: Garment) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(garment))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDropOnSlot = (
    e: React.DragEvent,
    slot: 'jacket' | 'top' | 'bottom' | 'shoes' | 'accessory'
  ) => {
    e.preventDefault()
    setDragOverSlot(null)
    try {
      const data = e.dataTransfer.getData('text/plain')
      if (data) {
        const garment: Garment = JSON.parse(data)
        if (slot === 'jacket') setJacket(garment)
        if (slot === 'top') setTop(garment)
        if (slot === 'bottom') setBottom(garment)
        if (slot === 'shoes') setShoes(garment)
        if (slot === 'accessory') setAccessory(garment)
      }
    } catch (err) {
      console.warn('Drop error:', err)
    }
  }

  const handleSaveLook = () => {
    if (activeItems.length === 0) return

    const newOutfit: Outfit = {
      id: activeOutfitId || `outfit-${Date.now()}`,
      title: outfitTitle.trim() || 'Curated Ensemble',
      occasion: outfitOccasion,
      season: outfitSeason,
      items: activeItems,
      wearCount: initialOutfit ? initialOutfit.wearCount : 1,
      lastWorn: initialOutfit?.lastWorn || new Date().toISOString().split('T')[0],
      createdAt: initialOutfit?.createdAt || new Date().toISOString().split('T')[0],
      notes: outfitNotes.trim() || 'Assembled on the Outfit Studio canvas.',
    }

    onSaveOutfit(newOutfit)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleWearAll = () => {
    activeItems.forEach((item) => onMarkWorn(item.id))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  // Filter garments for the right-hand picker
  const filteredPickerGarments = useMemo(() => {
    return garments.filter((g) => {
      const targetCategory =
        activeSlotTarget === 'Jackets'
          ? 'Jackets & Outerwear'
          : activeSlotTarget === 'Tops'
            ? 'Tops'
            : activeSlotTarget === 'Bottoms'
              ? 'Bottoms'
              : activeSlotTarget === 'Shoes'
                ? 'Shoes'
                : activeSlotTarget === 'Accessories'
                  ? 'Accessories'
                  : null

      const matchesSlot = targetCategory ? g.category === targetCategory : true
      const matchesPickerCategory =
        pickerCategory === 'All' || g.category === pickerCategory
      const q = pickerSearch.toLowerCase().trim()
      const matchesSearch =
        q === '' ||
        g.name.toLowerCase().includes(q) ||
        g.brand.toLowerCase().includes(q) ||
        g.color.name.toLowerCase().includes(q)

      return matchesSlot && matchesPickerCategory && matchesSearch
    })
  }, [garments, activeSlotTarget, pickerCategory, pickerSearch])

  return (
    <div className="w-full bg-[#FAF9F6] text-[#181716] p-0 sm:p-2">
      {/* ── Studio Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 sm:pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-[#96918A]">
              Interactive Dressing Room
            </span>
            {activeOutfitId && (
              <span className="text-[9px] uppercase px-2 py-0.5 bg-[#181716] text-[#FAF9F6]">
                Editing Look
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#181716]">
            Outfit Studio
          </h2>
          <p className="text-xs text-[#6E6962] font-light mt-1">
            Tap or drag garments into layer slots to compose and save your look.
          </p>
        </div>

        {/* Right Info & Reset */}
        <div className="flex items-center gap-3">
          {activeOutfitId && onCancelEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancelEdit}
              className="text-xs bg-white border-[#E8E4DC] text-[#6E6962] hover:text-[#181716] rounded-none h-8"
            >
              Cancel Edit
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="text-xs bg-white border-[#E8E4DC] text-[#6E6962] hover:text-[#181716] rounded-none h-8 gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Canvas</span>
          </Button>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-white text-xs text-[#181716]">
            <CloudSun className="w-3.5 h-3.5 text-[#6E6962]" />
            <span className="font-sans text-[11px] tracking-wide">16°C Paris</span>
          </div>
        </div>
      </div>

      {/* ── Main Composition Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pt-4 sm:pt-6">
        {/* Left: The Dressing Canvas Stack */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[480px] bg-white p-5 sm:p-6 space-y-3 rounded-lg">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A]">
                Outfit Layers ({activeItems.length} Pieces)
              </span>
              <span className="text-[11px] font-mono text-[#6E6962]">
                Total: ${activeItems.reduce((acc, curr) => acc + curr.price, 0)}
              </span>
            </div>

            {/* 1. Outerwear Slot */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverSlot('jacket')
              }}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={(e) => handleDropOnSlot(e, 'jacket')}
              className={`transition-colors rounded-md ${
                dragOverSlot === 'jacket' || activeSlotTarget === 'Jackets'
                  ? 'ring-2 ring-[#181716] border-[#181716]'
                  : ''
              }`}
            >
              {jacket ? (
                <div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 bg-[#FAF9F6] relative group rounded-md overflow-hidden">
                  <img
                    src={jacket.imageFront}
                    alt={jacket.name}
                    className="w-14 h-18 sm:w-16 sm:h-20 object-cover shrink-0 rounded"
                  />
                  <div
                    onClick={() => handleSlotClick('Jackets')}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="text-[9px] uppercase tracking-widest text-[#96918A] block">
                      Outerwear • Tap to swap
                    </span>
                    <h4 className="text-xs sm:text-sm font-serif text-[#181716] truncate">{jacket.name}</h4>
                    <p className="text-[11px] text-[#6E6962]">
                      {jacket.brand} • {jacket.color.name} • ${jacket.price}
                    </p>
                  </div>
                  <button
                    onClick={() => handleClearSlot('jacket')}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-[#96918A] hover:text-[#181716] active:scale-95 transition-transform rounded-full"
                    aria-label="Remove outerwear"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSlotClick('Jackets')}
                  className="w-full min-h-[58px] border border-dashed border-[#E8E4DC] hover:border-[#181716] active:bg-[#F2EFE9] bg-white flex items-center justify-between px-3.5 sm:px-4 text-xs text-[#6E6962] hover:text-[#181716] transition-colors rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#96918A]" />
                    <span className="font-medium text-[#181716]">Add Outerwear</span>
                  </div>
                  <span className="text-[10px] text-[#96918A] uppercase tracking-wider">Tap to choose</span>
                </button>
              )}
            </div>

            {/* 2. Top Slot */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverSlot('top')
              }}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={(e) => handleDropOnSlot(e, 'top')}
              className={`transition-colors rounded-md ${
                dragOverSlot === 'top' || activeSlotTarget === 'Tops'
                  ? 'ring-2 ring-[#181716] border-[#181716]'
                  : ''
              }`}
            >
              {top ? (
                <div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 bg-[#FAF9F6] relative group rounded-md overflow-hidden">
                  <img
                    src={top.imageFront}
                    alt={top.name}
                    className="w-14 h-18 sm:w-16 sm:h-20 object-cover shrink-0 rounded"
                  />
                  <div
                    onClick={() => handleSlotClick('Tops')}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="text-[9px] uppercase tracking-widest text-[#96918A] block">
                      Top / Knit • Tap to swap
                    </span>
                    <h4 className="text-xs sm:text-sm font-serif text-[#181716] truncate">{top.name}</h4>
                    <p className="text-[11px] text-[#6E6962]">
                      {top.brand} • {top.color.name} • ${top.price}
                    </p>
                  </div>
                  <button
                    onClick={() => handleClearSlot('top')}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-[#96918A] hover:text-[#181716] active:scale-95 transition-transform rounded-full"
                    aria-label="Remove top"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSlotClick('Tops')}
                  className="w-full min-h-[58px] border border-dashed border-[#E8E4DC] hover:border-[#181716] active:bg-[#F2EFE9] bg-white flex items-center justify-between px-3.5 sm:px-4 text-xs text-[#6E6962] hover:text-[#181716] transition-colors rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#96918A]" />
                    <span className="font-medium text-[#181716]">Add Top / Shirt</span>
                  </div>
                  <span className="text-[10px] text-[#96918A] uppercase tracking-wider">Tap to choose</span>
                </button>
              )}
            </div>

            {/* 3. Bottom Slot */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverSlot('bottom')
              }}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={(e) => handleDropOnSlot(e, 'bottom')}
              className={`transition-colors rounded-md ${
                dragOverSlot === 'bottom' || activeSlotTarget === 'Bottoms'
                  ? 'ring-2 ring-[#181716] border-[#181716]'
                  : ''
              }`}
            >
              {bottom ? (
                <div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 bg-[#FAF9F6] relative group rounded-md overflow-hidden">
                  <img
                    src={bottom.imageFront}
                    alt={bottom.name}
                    className="w-14 h-18 sm:w-16 sm:h-20 object-cover shrink-0 rounded"
                  />
                  <div
                    onClick={() => handleSlotClick('Bottoms')}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="text-[9px] uppercase tracking-widest text-[#96918A] block">
                      Bottom • Tap to swap
                    </span>
                    <h4 className="text-xs sm:text-sm font-serif text-[#181716] truncate">{bottom.name}</h4>
                    <p className="text-[11px] text-[#6E6962]">
                      {bottom.brand} • {bottom.color.name} • ${bottom.price}
                    </p>
                  </div>
                  <button
                    onClick={() => handleClearSlot('bottom')}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-[#96918A] hover:text-[#181716] active:scale-95 transition-transform rounded-full"
                    aria-label="Remove bottom"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSlotClick('Bottoms')}
                  className="w-full min-h-[58px] border border-dashed border-[#E8E4DC] hover:border-[#181716] active:bg-[#F2EFE9] bg-white flex items-center justify-between px-3.5 sm:px-4 text-xs text-[#6E6962] hover:text-[#181716] transition-colors rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#96918A]" />
                    <span className="font-medium text-[#181716]">Add Bottom / Denim</span>
                  </div>
                  <span className="text-[10px] text-[#96918A] uppercase tracking-wider">Tap to choose</span>
                </button>
              )}
            </div>

            {/* 4. Shoes Slot */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverSlot('shoes')
              }}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={(e) => handleDropOnSlot(e, 'shoes')}
              className={`transition-colors rounded-md ${
                dragOverSlot === 'shoes' || activeSlotTarget === 'Shoes'
                  ? 'ring-2 ring-[#181716] border-[#181716]'
                  : ''
              }`}
            >
              {shoes ? (
                <div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 bg-[#FAF9F6] relative group rounded-md overflow-hidden">
                  <img
                    src={shoes.imageFront}
                    alt={shoes.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover shrink-0 rounded"
                  />
                  <div
                    onClick={() => handleSlotClick('Shoes')}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="text-[9px] uppercase tracking-widest text-[#96918A] block">
                      Footwear • Tap to swap
                    </span>
                    <h4 className="text-xs sm:text-sm font-serif text-[#181716] truncate">{shoes.name}</h4>
                    <p className="text-[11px] text-[#6E6962]">
                      {shoes.brand} • {shoes.color.name} • ${shoes.price}
                    </p>
                  </div>
                  <button
                    onClick={() => handleClearSlot('shoes')}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-[#96918A] hover:text-[#181716] active:scale-95 transition-transform rounded-full"
                    aria-label="Remove footwear"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSlotClick('Shoes')}
                  className="w-full min-h-[58px] border border-dashed border-[#E8E4DC] hover:border-[#181716] active:bg-[#F2EFE9] bg-white flex items-center justify-between px-3.5 sm:px-4 text-xs text-[#6E6962] hover:text-[#181716] transition-colors rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#96918A]" />
                    <span className="font-medium text-[#181716]">Add Footwear</span>
                  </div>
                  <span className="text-[10px] text-[#96918A] uppercase tracking-wider">Tap to choose</span>
                </button>
              )}
            </div>

            {/* 5. Accessory Slot */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverSlot('accessory')
              }}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={(e) => handleDropOnSlot(e, 'accessory')}
              className={`transition-colors rounded-md ${
                dragOverSlot === 'accessory' || activeSlotTarget === 'Accessories'
                  ? 'ring-2 ring-[#181716] border-[#181716]'
                  : ''
              }`}
            >
              {accessory ? (
                <div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 bg-[#FAF9F6] relative group rounded-md overflow-hidden">
                  <img
                    src={accessory.imageFront}
                    alt={accessory.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover shrink-0 rounded"
                  />
                  <div
                    onClick={() => handleSlotClick('Accessories')}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="text-[9px] uppercase tracking-widest text-[#96918A] block">
                      Accessory • Tap to swap
                    </span>
                    <h4 className="text-xs sm:text-sm font-serif text-[#181716] truncate">{accessory.name}</h4>
                    <p className="text-[11px] text-[#6E6962]">
                      {accessory.brand} • {accessory.color.name} • ${accessory.price}
                    </p>
                  </div>
                  <button
                    onClick={() => handleClearSlot('accessory')}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-[#96918A] hover:text-[#181716] active:scale-95 transition-transform rounded-full"
                    aria-label="Remove accessory"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSlotClick('Accessories')}
                  className="w-full min-h-[58px] border border-dashed border-[#E8E4DC] hover:border-[#181716] active:bg-[#F2EFE9] bg-white flex items-center justify-between px-3.5 sm:px-4 text-xs text-[#6E6962] hover:text-[#181716] transition-colors rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#96918A]" />
                    <span className="font-medium text-[#181716]">Add Accessory</span>
                  </div>
                  <span className="text-[10px] text-[#96918A] uppercase tracking-wider">Tap to choose</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Wardrobe Drawer & Look Details */}
        <div ref={pickerRef} className="lg:col-span-5 flex flex-col justify-between space-y-6">
          {/* Garment Selector Shelf */}
          <div className="p-4 sm:p-6 bg-white space-y-4 rounded-lg">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-sans uppercase tracking-widest text-[#181716] font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#181716]" />
                <span>
                  {activeSlotTarget ? `Select ${activeSlotTarget}` : 'Wardrobe Shelf (Tap to Add)'}
                </span>
              </span>
              {activeSlotTarget && (
                <button
                  onClick={() => setActiveSlotTarget(null)}
                  className="text-xs text-[#6E6962] hover:text-[#181716]"
                >
                  Show All Pieces
                </button>
              )}
            </div>

            {/* Active Target Banner */}
            {activeSlotTarget && (
              <div className="bg-[#181716] text-[#FAF9F6] px-3.5 py-2 text-xs flex items-center justify-between rounded-md">
                <span>
                  Layer target: <strong>{activeSlotTarget}</strong> — tap any piece below
                </span>
                <button
                  onClick={() => setActiveSlotTarget(null)}
                  className="text-[11px] underline text-[#D8D4CC] hover:text-white ml-2"
                >
                  Done
                </button>
              </div>
            )}

            {/* Shelf Search and Category filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#96918A]" />
                <Input
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Filter shelf..."
                  className="h-9 sm:h-8 pl-8 text-xs bg-[#FAF9F6] border-[#E8E4DC] rounded-md shadow-none"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px] touch-pan-x">
                {['All', 'Tops', 'Bottoms', 'Jackets & Outerwear', 'Shoes', 'Accessories'].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setPickerCategory(cat as any)}
                      className={`px-3 py-1.5 min-h-[36px] whitespace-nowrap transition-colors flex items-center rounded ${
                        pickerCategory === cat
                          ? 'bg-[#181716] text-[#FAF9F6] font-medium'
                          : 'bg-[#FAF9F6] text-[#6E6962] hover:text-[#181716]'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Draggable & Tappable Garments Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
              {filteredPickerGarments.map((g) => (
                <div
                  key={g.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, g)}
                  onClick={() => handleSelectGarmentForSlot(g)}
                  className="p-2 sm:p-2.5 bg-[#FAF9F6] hover:bg-[#F2EFE9] active:bg-[#EAE6DF] cursor-pointer flex items-center gap-2.5 transition-colors select-none min-h-[58px] rounded-md"
                  title="Tap to assign to layer"
                >
                  <img
                    src={g.imageFront}
                    alt={g.name}
                    className="w-12 h-15 object-cover shrink-0 rounded"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wider text-[#96918A] block">
                      {g.category}
                    </span>
                    <h5 className="text-xs font-serif text-[#181716] truncate">{g.name}</h5>
                    <span className="text-[10px] text-[#6E6962] font-mono">${g.price}</span>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase font-sans tracking-wider px-2 py-1 bg-white text-[#181716] hover:bg-[#181716] hover:text-[#FAF9F6] transition-colors rounded">
                    + Add
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Outfit Metadata Form */}
          <div className="p-4 sm:p-6 bg-white space-y-4 rounded-lg">
            <h3 className="text-base font-serif font-normal text-[#181716]">
              Outfit Metadata
            </h3>

            <div>
              <label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block mb-1">
                Outfit Name
              </label>
              <Input
                value={outfitTitle}
                onChange={(e) => setOutfitTitle(e.target.value)}
                placeholder="Name this look..."
                className="h-10 sm:h-9 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-md focus-visible:ring-1 focus-visible:ring-[#181716] shadow-none"
              />
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block mb-1">
                  Occasion
                </label>
                <select
                  value={outfitOccasion}
                  onChange={(e) => setOutfitOccasion(e.target.value as any)}
                  className="w-full h-10 sm:h-9 px-2.5 text-xs bg-[#FAF9F6] border border-[#E8E4DC] text-[#181716] rounded-md focus:outline-none focus:border-[#181716]"
                >
                  <option value="Smart Casual">Smart Casual</option>
                  <option value="Work / Formal">Work / Formal</option>
                  <option value="Casual">Casual</option>
                  <option value="Evening">Evening</option>
                  <option value="Active">Active</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block mb-1">
                  Season
                </label>
                <select
                  value={outfitSeason}
                  onChange={(e) => setOutfitSeason(e.target.value as any)}
                  className="w-full h-10 sm:h-9 px-2.5 text-xs bg-[#FAF9F6] border border-[#E8E4DC] text-[#181716] rounded-md focus:outline-none focus:border-[#181716]"
                >
                  <option value="Autumn">Autumn</option>
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="All Season">All Season</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block mb-1">
                Styling Notes
              </label>
              <Input
                value={outfitNotes}
                onChange={(e) => setOutfitNotes(e.target.value)}
                placeholder="e.g. Perfect for gallery openings and weekend dinners."
                className="h-10 sm:h-9 text-xs bg-[#FAF9F6] border-[#E8E4DC] text-[#181716] rounded-md focus-visible:ring-1 focus-visible:ring-[#181716] shadow-none"
              />
            </div>

            <div className="pt-3 flex justify-between items-center text-xs">
              <span className="text-[#6E6962]">Combined Look Value:</span>
              <span className="font-serif font-normal text-base text-[#181716]">
                ${activeItems.reduce((acc, curr) => acc + curr.price, 0)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <Button
              onClick={handleSaveLook}
              disabled={activeItems.length === 0}
              className="w-full h-12 sm:h-10 min-h-[48px] bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider rounded-md shadow-none gap-2 active:bg-[#333]"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Outfit Saved!' : activeOutfitId ? 'Update Outfit' : 'Save Outfit'}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleWearAll}
              disabled={activeItems.length === 0}
              className="w-full h-12 sm:h-10 min-h-[48px] bg-white border-[#E8E4DC] hover:border-[#181716] text-[#181716] text-xs font-medium uppercase tracking-wider rounded-md shadow-none gap-2 active:bg-[#F2EFE9]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Outfit as Worn Today</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
