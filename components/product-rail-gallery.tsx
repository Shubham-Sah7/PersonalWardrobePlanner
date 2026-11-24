'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Garment, GarmentCategory, Season, Occasion } from '@/types/wardrobe'
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Plus,
  ArrowUpDown,
  Check,
  Grid,
  Columns,
  Filter,
  Eye,
  EyeOff,
  ExternalLink,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProductRailGalleryProps {
  garments: Garment[]
  onToggleFavorite?: (id: string) => void
  onAddClothes?: () => void
  onAddToOutfit?: (garment: Garment) => void
  onMarkWorn?: (id: string) => void
  onOpenDetails?: (garment: Garment) => void
  onToggleHide?: (id: string) => void
  showArchived?: boolean
  onToggleShowArchived?: () => void
}

export function ProductRailGallery({
  garments,
  onToggleFavorite,
  onAddClothes,
  onAddToOutfit,
  onMarkWorn,
  onOpenDetails,
  onToggleHide,
  showArchived = false,
  onToggleShowArchived,
}: ProductRailGalleryProps) {
  const [viewMode, setViewMode] = useState<'rail' | 'grid'>('rail')

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory>('All Items')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeason, setSelectedSeason] = useState<Season | 'All Seasons'>('All Seasons')
  const [selectedColorFamily, setSelectedColorFamily] = useState<string>('All Colors')
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | 'All Occasions'>('All Occasions')
  const [sortBy, setSortBy] = useState<
    'recent' | 'worn-desc' | 'worn-asc' | 'brand' | 'price-desc' | 'price-asc' | 'cpw-asc'
  >('recent')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false)

  // Inspection states
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null)
  const [viewOrientation, setViewOrientation] = useState<'front' | 'back'>('front')
  const [isHoveringRail, setIsHoveringRail] = useState(false)

  const railRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const inspectorRef = useRef<HTMLDivElement>(null)

  const categories: GarmentCategory[] = [
    'All Items',
    'Tops',
    'Bottoms',
    'Jackets & Outerwear',
    'Shoes',
    'Accessories',
  ]

  const occasions: (Occasion | 'All Occasions')[] = [
    'All Occasions',
    'Casual',
    'Smart Casual',
    'Work / Formal',
    'Evening',
    'Active',
  ]

  // Filtered & Sorted garments
  const filteredGarments = useMemo(() => {
    return garments
      .filter((item) => {
        // Category check
        const matchesCategory =
          selectedCategory === 'All Items' || item.category === selectedCategory

        // Favorites check
        const matchesFavorites = onlyFavorites ? item.favorite : true

        // Season check
        const matchesSeason =
          selectedSeason === 'All Seasons' ||
          item.season === selectedSeason ||
          item.season === 'All Season'

        // Color check
        const matchesColor =
          selectedColorFamily === 'All Colors' || item.color.family === selectedColorFamily

        // Occasion check
        const matchesOccasion =
          selectedOccasion === 'All Occasions' || item.occasion === selectedOccasion

        // Text search
        const q = searchQuery.toLowerCase().trim()
        const matchesSearch =
          q === '' ||
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.color.name.toLowerCase().includes(q) ||
          item.material.toLowerCase().includes(q) ||
          item.occasion.toLowerCase().includes(q) ||
          item.season.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.pattern.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q))

        return (
          matchesCategory &&
          matchesFavorites &&
          matchesSeason &&
          matchesColor &&
          matchesOccasion &&
          matchesSearch
        )
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        }
        if (sortBy === 'worn-desc') {
          return b.wearCount - a.wearCount
        }
        if (sortBy === 'worn-asc') {
          return a.wearCount - b.wearCount
        }
        if (sortBy === 'brand') {
          return a.brand.localeCompare(b.brand)
        }
        if (sortBy === 'price-desc') {
          return b.price - a.price
        }
        if (sortBy === 'price-asc') {
          return a.price - b.price
        }
        if (sortBy === 'cpw-asc') {
          const cpwA = a.price / Math.max(1, a.wearCount)
          const cpwB = b.price / Math.max(1, b.wearCount)
          return cpwA - cpwB
        }
        return 0
      })
  }, [
    garments,
    selectedCategory,
    onlyFavorites,
    selectedSeason,
    selectedColorFamily,
    selectedOccasion,
    searchQuery,
    sortBy,
  ])

  const selectedGarment = useMemo(() => {
    return filteredGarments.find((g) => g.id === selectedGarmentId) || null
  }, [filteredGarments, selectedGarmentId])

  const selectedIndex = useMemo(() => {
    if (!selectedGarmentId) return -1
    return filteredGarments.findIndex((g) => g.id === selectedGarmentId)
  }, [filteredGarments, selectedGarmentId])

  useEffect(() => {
    setViewOrientation('front')
  }, [selectedGarmentId])

  useEffect(() => {
    if (selectedGarmentId) {
      if (viewMode === 'rail') {
        const el = itemRefs.current.get(selectedGarmentId)
        if (el && railRef.current) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
      }
      if (window.innerWidth < 768 && inspectorRef.current) {
        setTimeout(() => {
          inspectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 150)
      }
    }
  }, [selectedGarmentId, viewMode])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return

      if (e.key === 'Escape' && selectedGarmentId) {
        setSelectedGarmentId(null)
      } else if (e.key === 'ArrowRight' && selectedGarmentId) {
        e.preventDefault()
        if (selectedIndex < filteredGarments.length - 1) {
          setSelectedGarmentId(filteredGarments[selectedIndex + 1].id)
        }
      } else if (e.key === 'ArrowLeft' && selectedGarmentId) {
        e.preventDefault()
        if (selectedIndex > 0) {
          setSelectedGarmentId(filteredGarments[selectedIndex - 1].id)
        }
      } else if ((e.key === 'f' || e.key === 'F') && selectedGarment?.imageBack) {
        setViewOrientation((prev) => (prev === 'front' ? 'back' : 'front'))
      } else if (e.key === 'a' || e.key === 'A') {
        if (!selectedGarmentId && onAddClothes) {
          onAddClothes()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedGarmentId, selectedIndex, filteredGarments, selectedGarment, onAddClothes])

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedGarmentId(filteredGarments[selectedIndex - 1].id)
    }
  }

  const handleNext = () => {
    if (selectedIndex < filteredGarments.length - 1) {
      setSelectedGarmentId(filteredGarments[selectedIndex + 1].id)
    }
  }

  const scrollRail = (direction: 'left' | 'right') => {
    if (railRef.current) {
      const offset = direction === 'left' ? -280 : 280
      railRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const resetAllFilters = () => {
    setSelectedCategory('All Items')
    setSearchQuery('')
    setSelectedSeason('All Seasons')
    setSelectedColorFamily('All Colors')
    setSelectedOccasion('All Occasions')
    setOnlyFavorites(false)
  }

  const hasActiveFilters =
    selectedCategory !== 'All Items' ||
    searchQuery !== '' ||
    selectedSeason !== 'All Seasons' ||
    selectedColorFamily !== 'All Colors' ||
    selectedOccasion !== 'All Occasions' ||
    onlyFavorites

  const hiddenCount = garments.filter((g) => g.hidden).length

  return (
    <div className="w-full bg-[#FAF9F6] text-[#181716]">
      {/* ── Control Header: Search, Category Filters, Season/Color, View Mode Toggle ── */}
      <div className="pb-4 sm:pb-6 bg-[#FAF9F6]">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5">
          {/* View Mode Toggle & Piece Counter */}
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <div className="inline-flex bg-[#F2EFE9]/70 p-0.5 shrink-0 rounded-md">
              <button
                onClick={() => setViewMode('rail')}
                className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-sans tracking-wide uppercase transition-colors flex items-center gap-1.5 rounded ${
                  viewMode === 'rail'
                    ? 'bg-[#181716] text-[#FAF9F6] font-medium'
                    : 'text-[#6E6962] hover:text-[#181716]'
                }`}
                title="Hanging clothing rack"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Rail</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-sans tracking-wide uppercase transition-colors flex items-center gap-1.5 rounded ${
                  viewMode === 'grid'
                    ? 'bg-[#181716] text-[#FAF9F6] font-medium'
                    : 'text-[#6E6962] hover:text-[#181716]'
                }`}
                title="Catalog grid view"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Grid</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-sans font-medium tracking-wider uppercase text-[#6E6962] px-2 py-1 bg-[#F4F1EA] rounded whitespace-nowrap">
                {filteredGarments.length} Pieces
              </span>

              {/* Archived Items Toggle (if any exist) */}
              {hiddenCount > 0 && onToggleShowArchived && (
                <button
                  onClick={onToggleShowArchived}
                  className={`text-[10px] sm:text-[11px] font-sans px-2 py-1 border rounded transition-colors flex items-center gap-1 ${
                    showArchived
                      ? 'bg-[#181716] text-[#FAF9F6] border-[#181716]'
                      : 'bg-white text-[#6E6962] border-[#E8E4DC] hover:border-[#181716]'
                  }`}
                  title="Toggle archived items"
                >
                  {showArchived ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>Archived ({hiddenCount})</span>
                </button>
              )}

              {/* Mobile Filter Expand Toggle */}
              <button
                onClick={() => setMobileFiltersExpanded(!mobileFiltersExpanded)}
                className="sm:hidden p-1.5 border border-[#E8E4DC] bg-white text-[#6E6962] rounded"
                aria-label="Toggle filters"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search, Filter Pills & Add Action */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48 min-w-[140px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#96918A]" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-7 text-xs bg-white border-[#E8E4DC] text-[#181716] placeholder:text-[#96918A] focus-visible:ring-1 focus-visible:ring-[#181716] rounded-md shadow-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#96918A] hover:text-[#181716]"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Desktop Filters / Mobile Expandable Filters */}
            <div className={`${mobileFiltersExpanded ? 'flex' : 'hidden sm:flex'} flex-wrap items-center gap-1.5 w-full sm:w-auto pt-2 sm:pt-0`}>
              {/* Season Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-white border-[#E8E4DC] text-[#181716] hover:border-[#181716] rounded-md shadow-none"
                  >
                    <span>{selectedSeason === 'All Seasons' ? 'Season' : selectedSeason}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-[#E8E4DC] text-[#181716] rounded-md shadow-sm">
                  <DropdownMenuItem onClick={() => setSelectedSeason('All Seasons')} className="text-xs cursor-pointer">
                    All Seasons
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedSeason('Spring')} className="text-xs cursor-pointer">
                    Spring
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedSeason('Summer')} className="text-xs cursor-pointer">
                    Summer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedSeason('Autumn')} className="text-xs cursor-pointer">
                    Autumn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedSeason('Winter')} className="text-xs cursor-pointer">
                    Winter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Color Family Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-white border-[#E8E4DC] text-[#181716] hover:border-[#181716] rounded-md shadow-none"
                  >
                    <span>{selectedColorFamily === 'All Colors' ? 'Color' : selectedColorFamily}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-[#E8E4DC] text-[#181716] rounded-md shadow-sm">
                  <DropdownMenuItem onClick={() => setSelectedColorFamily('All Colors')} className="text-xs cursor-pointer">
                    All Colors
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedColorFamily('Neutral')} className="text-xs cursor-pointer">
                    Neutral
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedColorFamily('Monochrome')} className="text-xs cursor-pointer">
                    Monochrome
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedColorFamily('Earth')} className="text-xs cursor-pointer">
                    Earth
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedColorFamily('Blue')} className="text-xs cursor-pointer">
                    Blue
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedColorFamily('Warm')} className="text-xs cursor-pointer">
                    Warm
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Occasion Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-white border-[#E8E4DC] text-[#181716] hover:border-[#181716] rounded-md shadow-none"
                  >
                    <span>{selectedOccasion === 'All Occasions' ? 'Occasion' : selectedOccasion}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-[#E8E4DC] text-[#181716] rounded-md shadow-sm">
                  {occasions.map((occ) => (
                    <DropdownMenuItem
                      key={occ}
                      onClick={() => setSelectedOccasion(occ)}
                      className="text-xs cursor-pointer"
                    >
                      {occ}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Favorites Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`h-8 px-2 text-xs rounded-md transition-colors border-[#E8E4DC] shadow-none ${
                  onlyFavorites
                    ? 'bg-[#181716] text-[#FAF9F6] border-[#181716]'
                    : 'bg-white text-[#6E6962] hover:text-[#181716]'
                }`}
              >
                <Heart
                  className={`w-3 h-3 sm:mr-1 ${onlyFavorites ? 'fill-current text-[#FAF9F6]' : 'text-[#6E6962]'}`}
                />
                <span className="hidden sm:inline">Favorites</span>
              </Button>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs bg-white border-[#E8E4DC] text-[#181716] hover:border-[#181716] rounded-md shadow-none gap-1"
                  >
                    <ArrowUpDown className="w-3 h-3 text-[#6E6962]" />
                    <span>Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-[#E8E4DC] text-[#181716] rounded-md shadow-sm">
                  <DropdownMenuItem onClick={() => setSortBy('recent')} className="text-xs cursor-pointer">
                    Recently Added
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('worn-desc')} className="text-xs cursor-pointer">
                    Most Frequently Worn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('worn-asc')} className="text-xs cursor-pointer">
                    Least Frequently Worn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('brand')} className="text-xs cursor-pointer">
                    Brand (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('price-desc')} className="text-xs cursor-pointer">
                    Price: High to Low
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('price-asc')} className="text-xs cursor-pointer">
                    Price: Low to High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('cpw-asc')} className="text-xs cursor-pointer">
                    Cost Per Wear: Lowest
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Add Clothes Action */}
            {onAddClothes && (
              <Button
                size="sm"
                onClick={onAddClothes}
                className="h-8 px-2.5 sm:px-3 bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider rounded-md shadow-none gap-1 ml-auto sm:ml-0"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Pill Bar (When any filter is active) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px]">
            <span className="text-[#96918A] uppercase tracking-wider text-[10px] mr-1">Active:</span>

            {selectedCategory !== 'All Items' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EAE6DF]/70 text-[#181716] rounded">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('All Items')} className="hover:text-red-600">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {selectedSeason !== 'All Seasons' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EAE6DF]/70 text-[#181716] rounded">
                {selectedSeason}
                <button onClick={() => setSelectedSeason('All Seasons')} className="hover:text-red-600">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {selectedColorFamily !== 'All Colors' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EAE6DF]/70 text-[#181716] rounded">
                {selectedColorFamily}
                <button onClick={() => setSelectedColorFamily('All Colors')} className="hover:text-red-600">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {selectedOccasion !== 'All Occasions' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EAE6DF]/70 text-[#181716] rounded">
                {selectedOccasion}
                <button onClick={() => setSelectedOccasion('All Occasions')} className="hover:text-red-600">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {onlyFavorites && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EAE6DF]/70 text-[#181716] rounded">
                Favorites
                <button onClick={() => setOnlyFavorites(false)} className="hover:text-red-600">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EAE6DF]/70 text-[#181716] rounded">
                &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery('')} className="hover:text-red-600">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            <button
              onClick={resetAllFilters}
              className="text-[10px] uppercase tracking-wider text-[#6E6962] hover:text-[#181716] underline ml-2 inline-flex items-center gap-1"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset All</span>
            </button>
          </div>
        )}

        {/* Categories Bar: Smooth Horizontal Swipe for Mobile */}
        <div className="flex items-center gap-1 mt-4 sm:mt-6 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat
            const count =
              cat === 'All Items'
                ? garments.length
                : garments.filter((g) => g.category === cat).length

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2.5 min-h-[44px] text-xs font-sans tracking-wide transition-colors relative whitespace-nowrap shrink-0 flex items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#181716] ${
                  isSelected
                    ? 'text-[#181716] font-medium border-b-2 border-[#181716] -mb-[1px]'
                    : 'text-[#6E6962] hover:text-[#181716]'
                }`}
              >
                <span>{cat}</span>
                <span className="text-[10px] ml-1 text-[#96918A]">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── STATE: EMPTY WARDROBE ── */}
      {garments.length === 0 && (
        <div className="py-16 sm:py-24 px-6 text-center flex flex-col items-center justify-center bg-[#FAF9F6]">
          <div className="w-48 sm:w-64 h-1 bg-[#201F1D] mb-4 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-6 border-t border-r border-[#201F1D]" />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-2 bg-[#2A2826]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-normal text-[#181716] mb-2 mt-4">
            Your wardrobe is empty
          </h3>
          <p className="text-xs text-[#6E6962] max-w-sm mb-6 font-light leading-relaxed">
            Add a few pieces to start organizing your wardrobe and planning outfits.
          </p>

          {onAddClothes && (
            <Button
              onClick={onAddClothes}
              className="bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider px-5 h-9 rounded-md shadow-none gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Piece</span>
            </Button>
          )}
        </div>
      )}

      {/* ── STATE: NO SEARCH / FILTER RESULTS ── */}
      {garments.length > 0 && filteredGarments.length === 0 && (
        <div className="py-16 sm:py-24 px-6 text-center flex flex-col items-center justify-center bg-[#FAF9F6]">
          <h3 className="text-lg sm:text-xl font-serif font-normal text-[#181716] mb-1">
            No items found
          </h3>
          <p className="text-xs text-[#6E6962] max-w-sm mb-6 font-light">
            Try adjusting your search or resetting filters to see your clothes.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={resetAllFilters}
            className="text-xs bg-white border-[#E8E4DC] text-[#181716] rounded-none hover:border-[#181716] shadow-none gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </Button>
        </div>
      )}

      {/* ── MODE 1: HANGING RAIL VIEW (RESPONSIVE TOUCH RAIL) ── */}
      {garments.length > 0 && filteredGarments.length > 0 && viewMode === 'rail' && (
        <div
          className="relative py-8 sm:py-12 px-3 sm:px-8 min-h-[460px] sm:min-h-[560px] flex flex-col justify-center bg-[#FAF9F6]"
          onMouseEnter={() => setIsHoveringRail(true)}
          onMouseLeave={() => setIsHoveringRail(false)}
        >
          {/* Architectural Rail Bar */}
          <div className="absolute top-8 sm:top-12 left-0 right-0 z-20 pointer-events-none px-2 sm:px-4">
            <div className="relative mx-auto max-w-[1360px]">
              <div className="absolute -left-1 sm:-left-2 -top-1 w-2.5 sm:w-3.5 h-4 sm:h-5 bg-[#201F1D]" />
              <div className="h-1 sm:h-1.5 w-full bg-[#201F1D]" />
              <div className="absolute -right-1 sm:-right-2 -top-1 w-2.5 sm:w-3.5 h-4 sm:h-5 bg-[#201F1D]" />
            </div>
          </div>

          {/* Desktop-only Nav Arrows */}
          <button
            onClick={() => scrollRail('left')}
            className={`hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white border border-[#E8E4DC] text-[#181716] items-center justify-center transition-opacity hover:border-[#181716] ${
              isHoveringRail ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => scrollRail('right')}
            className={`hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white border border-[#E8E4DC] text-[#181716] items-center justify-center transition-opacity hover:border-[#181716] ${
              isHoveringRail ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Touch Rail Items Track */}
          <div
            ref={railRef}
            className="flex items-start gap-5 sm:gap-10 overflow-x-auto pt-6 sm:pt-7 pb-8 sm:pb-10 px-4 sm:px-12 scroll-smooth scrollbar-none snap-x snap-mandatory touch-pan-x"
          >
            {filteredGarments.map((garment) => {
              const isSelected = selectedGarmentId === garment.id
              const isDimmed = selectedGarmentId !== null && !isSelected

              return (
                <div
                  key={garment.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(garment.id, el)
                    else itemRefs.current.delete(garment.id)
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Inspect ${garment.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedGarmentId(garment.id)
                    }
                  }}
                  className={`group relative flex-shrink-0 flex flex-col items-center cursor-pointer transition-all duration-300 snap-center select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 ${
                    isSelected
                      ? 'z-30 -translate-y-1 sm:-translate-y-2'
                      : isDimmed
                        ? 'opacity-40 hover:opacity-75'
                        : 'hover:-translate-y-1'
                  }`}
                  onClick={() => {
                    setSelectedGarmentId(garment.id)
                  }}
                >
                  {/* Hanger Hook & Shoulder */}
                  <div className="relative z-10 flex flex-col items-center mb-[-4px] pointer-events-none">
                    <div className="w-3.5 sm:w-4 h-4 sm:h-7 border-t border-r border-[#201F1D]" />
                    <div className="w-24 xs:w-28 sm:w-36 h-1.5 sm:h-2 bg-[#2A2826]" />
                  </div>

                  {/* Garment Card */}
                  <div
                    className={`relative w-[195px] xs:w-[220px] sm:w-[260px] h-[300px] xs:h-[335px] sm:h-[390px] overflow-hidden bg-white transition-all rounded-md ${
                      isSelected
                        ? 'ring-2 ring-[#181716] shadow-md'
                        : 'hover:shadow-sm'
                    }`}
                  >
                    <img
                      src={
                        isSelected && viewOrientation === 'back' && garment.imageBack
                          ? garment.imageBack
                          : garment.imageFront
                      }
                      alt={garment.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center"
                    />

                    {/* Brand & Favorite */}
                    <div className="absolute top-2.5 sm:top-3 inset-x-2.5 sm:inset-x-3 flex items-center justify-between z-10">
                      <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 bg-white/95 text-[#181716] rounded">
                        {garment.brand}
                      </span>

                      <div className="flex items-center gap-1">
                        {garment.hidden && (
                          <span className="text-[8px] uppercase px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded">
                            Archived
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite?.(garment.id)
                          }}
                          className={`w-7 h-7 flex items-center justify-center transition-colors bg-white/95 hover:bg-white rounded-full ${
                            garment.favorite
                              ? 'text-[#181716]'
                              : 'text-[#96918A] hover:text-[#181716]'
                          }`}
                          aria-label="Toggle favorite"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${garment.favorite ? 'fill-current text-[#181716]' : ''}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Caption */}
                    <div className="absolute bottom-0 inset-x-0 p-3 sm:p-3.5 bg-white/95 flex flex-col justify-end">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="w-2 h-2 rounded-full border border-black/10"
                          style={{ backgroundColor: garment.color.hex }}
                        />
                        <span className="text-[9px] sm:text-[10px] font-sans text-[#6E6962] tracking-wider uppercase">
                          {garment.category}
                        </span>
                      </div>

                      <h4 className="text-xs font-serif font-normal text-[#181716] truncate">
                        {garment.name}
                      </h4>

                      <div className="flex items-center justify-between pt-1 mt-0.5 text-[10px] text-[#6E6962]">
                        <span>{garment.wearCount} wears</span>
                        <span className="text-[#181716] font-medium">
                          {isSelected ? 'Inspecting' : 'Tap to View'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── MODE 2: CATALOG GRID VIEW (RESPONSIVE 2-to-4 COLS) ── */}
      {garments.length > 0 && filteredGarments.length > 0 && viewMode === 'grid' && (
        <div className="p-3 sm:p-8 bg-[#FAF9F6]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredGarments.map((garment) => {
              const isSelected = selectedGarmentId === garment.id

              return (
                <div
                  key={garment.id}
                  onClick={() => setSelectedGarmentId(garment.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Inspect ${garment.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedGarmentId(garment.id)
                    }
                  }}
                  className={`group bg-white cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] rounded-md overflow-hidden ${
                    isSelected
                      ? 'ring-2 ring-[#181716] shadow-md'
                      : 'hover:shadow-sm'
                  }`}
                >
                  <div className="relative aspect-[3/4] bg-[#FAF9F6] overflow-hidden">
                    <img
                      src={garment.imageFront}
                      alt={garment.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-2 inset-x-2 flex items-center justify-between">
                      <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 bg-white/95 text-[#181716] truncate max-w-[90px] rounded">
                        {garment.brand}
                      </span>
                      <div className="flex items-center gap-1">
                        {garment.hidden && (
                          <span className="text-[8px] uppercase px-1 py-0.5 bg-amber-100 text-amber-900 rounded">
                            Archived
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite?.(garment.id)
                          }}
                          className={`w-6 h-6 flex items-center justify-center transition-colors bg-white/90 hover:bg-white rounded-full ${
                            garment.favorite
                              ? 'text-[#181716]'
                              : 'text-[#96918A] hover:text-[#181716]'
                          }`}
                        >
                          <Heart
                            className={`w-3 h-3 ${garment.favorite ? 'fill-current text-[#181716]' : ''}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3.5">
                    <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-[#96918A] mb-0.5">
                      <span>{garment.category}</span>
                      <span className="text-[#6E6962] font-mono">${garment.price}</span>
                    </div>
                    <h4 className="text-xs font-serif font-normal text-[#181716] truncate mb-1">
                      {garment.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-[#6E6962] pt-1">
                      <span>{garment.wearCount} wears</span>
                      {onOpenDetails && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenDetails(garment)
                          }}
                          className="text-[#181716] hover:underline flex items-center gap-0.5"
                        >
                          <span>Specs</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── RESPONSIVE GARMENT DETAIL INSPECTOR (Desktop: Split Inline, Mobile: Smooth Sheet) ── */}
      {selectedGarment && (
        <div
          ref={inspectorRef}
          className="bg-white p-5 sm:p-10 mt-6 transition-all rounded-lg"
        >
          <div className="max-w-6xl mx-auto">
            {/* Top Bar of Inspector */}
            <div className="flex items-center justify-between pb-2 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-[11px] sm:text-xs font-mono tracking-wider text-[#6E6962]">
                  PIECE {String(selectedIndex + 1).padStart(2, '0')} / {String(filteredGarments.length).padStart(2, '0')}
                </span>
                <span className="text-[#96918A]">/</span>
                <span className="text-[11px] sm:text-xs uppercase tracking-wider text-[#181716] font-medium">
                  {selectedGarment.category}
                </span>
                {selectedGarment.hidden && (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded">
                    Archived
                  </span>
                )}
              </div>

              {/* Prev / Next & Close */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={selectedIndex <= 0}
                  className="h-8 w-8 p-0 bg-white border-[#E8E4DC] text-[#181716] rounded-md hover:border-[#181716] disabled:opacity-30"
                  aria-label="Previous piece"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={selectedIndex >= filteredGarments.length - 1}
                  className="h-8 w-8 p-0 bg-white border-[#E8E4DC] text-[#181716] rounded-md hover:border-[#181716] disabled:opacity-30"
                  aria-label="Next piece"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGarmentId(null)}
                  className="h-8 w-8 p-0 text-[#6E6962] hover:text-[#181716] rounded-md"
                  aria-label="Close inspector"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content: 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-12 items-start">
              {/* Left Column: Image Presentation + Angle Switch */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative w-full max-w-[280px] md:max-w-none aspect-[3/4] bg-[#FAF9F6] overflow-hidden rounded-md">
                  <img
                    src={
                      viewOrientation === 'back' && selectedGarment.imageBack
                        ? selectedGarment.imageBack
                        : selectedGarment.imageFront
                    }
                    alt={selectedGarment.name}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 text-[9px] sm:text-[10px] font-mono tracking-wider text-[#6E6962] rounded">
                    {viewOrientation === 'front' ? 'FRONT VIEW' : 'BACK VIEW'}
                  </div>
                </div>

                {selectedGarment.imageBack && (
                  <div className="inline-flex items-center gap-2 mt-3 sm:mt-4">
                    <button
                      onClick={() => setViewOrientation('front')}
                      className={`px-3 py-1.5 min-h-[36px] text-xs tracking-wider uppercase transition-colors border rounded-md ${
                        viewOrientation === 'front'
                          ? 'bg-[#181716] text-[#FAF9F6] border-[#181716]'
                          : 'bg-white text-[#6E6962] border-[#E8E4DC] hover:border-[#181716]'
                      }`}
                    >
                      Front View
                    </button>
                    <button
                      onClick={() => setViewOrientation('back')}
                      className={`px-3 py-1.5 min-h-[36px] text-xs tracking-wider uppercase transition-colors border rounded-md ${
                        viewOrientation === 'back'
                          ? 'bg-[#181716] text-[#FAF9F6] border-[#181716]'
                          : 'bg-white text-[#6E6962] border-[#E8E4DC] hover:border-[#181716]'
                      }`}
                    >
                      Back View
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Garment Specs, Financials & Actions */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] sm:text-xs font-sans tracking-[0.16em] uppercase text-[#6E6962] font-semibold">
                      {selectedGarment.brand}
                    </span>

                    <button
                      onClick={() => onToggleFavorite?.(selectedGarment.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors min-h-[36px] rounded-md ${
                        selectedGarment.favorite
                          ? 'bg-[#F5F2EB] border-[#181716] text-[#181716]'
                          : 'bg-white border-[#E8E4DC] text-[#6E6962] hover:border-[#181716]'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${selectedGarment.favorite ? 'fill-current text-[#181716]' : ''}`}
                      />
                      <span>{selectedGarment.favorite ? 'Favorited' : 'Favorite'}</span>
                    </button>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#181716] tracking-tight mb-2">
                    {selectedGarment.name}
                  </h3>

                  {selectedGarment.notes && (
                    <p className="text-xs font-serif italic text-[#6E6962] leading-relaxed mb-4">
                      &ldquo;{selectedGarment.notes}&rdquo;
                    </p>
                  )}

                  {/* Attributes Table */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-4 py-4 sm:py-5 text-xs">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-1">
                        Category
                      </span>
                      <span className="font-medium text-[#181716]">{selectedGarment.category}</span>
                    </div>

                    <div>
                      <span className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-1">
                        Colorway
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: selectedGarment.color.hex }}
                        />
                        <span className="font-medium text-[#181716]">{selectedGarment.color.name}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-1">
                        Seasonality
                      </span>
                      <span className="font-medium text-[#181716]">{selectedGarment.season}</span>
                    </div>

                    <div>
                      <span className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-1">
                        Occasion
                      </span>
                      <span className="font-medium text-[#181716]">{selectedGarment.occasion}</span>
                    </div>

                    <div>
                      <span className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-1">
                        Material
                      </span>
                      <span className="font-medium text-[#181716] truncate block" title={selectedGarment.material}>
                        {selectedGarment.material}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-1">
                        Pattern
                      </span>
                      <span className="font-medium text-[#181716]">{selectedGarment.pattern}</span>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="flex items-center justify-between sm:justify-start gap-6 sm:gap-10 py-3 sm:py-4">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-0.5">
                        Times Worn
                      </span>
                      <span className="text-lg sm:text-xl font-serif text-[#181716]">
                        {selectedGarment.wearCount}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-0.5">
                        Value
                      </span>
                      <span className="text-lg sm:text-xl font-serif text-[#181716]">
                        ${selectedGarment.price}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-0.5">
                        Cost Per Wear
                      </span>
                      <span className="text-lg sm:text-xl font-serif text-[#181716]">
                        ${(selectedGarment.price / Math.max(1, selectedGarment.wearCount)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-6 sm:pt-8">
                  {onAddToOutfit && (
                    <Button
                      onClick={() => onAddToOutfit(selectedGarment)}
                      className="bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider px-5 h-11 sm:h-9 min-h-[44px] sm:min-h-0 rounded-md shadow-none justify-center"
                    >
                      Add to Outfit
                    </Button>
                  )}

                  {onMarkWorn && (
                    <Button
                      variant="outline"
                      onClick={() => onMarkWorn(selectedGarment.id)}
                      className="bg-white border-[#E8E4DC] text-[#181716] text-xs px-4 h-11 sm:h-9 min-h-[44px] sm:min-h-0 rounded-md shadow-none gap-1.5 justify-center hover:border-[#181716]"
                    >
                      <Check className="w-3.5 h-3.5 text-[#181716]" />
                      <span>Mark Worn Today</span>
                    </Button>
                  )}

                  {onOpenDetails && (
                    <Button
                      variant="outline"
                      onClick={() => onOpenDetails(selectedGarment)}
                      className="bg-white border-[#E8E4DC] text-[#181716] text-xs px-4 h-11 sm:h-9 min-h-[44px] sm:min-h-0 rounded-md shadow-none gap-1.5 justify-center hover:border-[#181716]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Full Specs / Edit</span>
                    </Button>
                  )}

                  {onToggleHide && (
                    <Button
                      variant="outline"
                      onClick={() => onToggleHide(selectedGarment.id)}
                      className="bg-white border-[#E8E4DC] text-[#6E6962] hover:text-[#181716] text-xs px-3 h-11 sm:h-9 min-h-[44px] sm:min-h-0 rounded-md shadow-none gap-1.5 justify-center"
                      title={selectedGarment.hidden ? 'Unhide piece' : 'Archive piece'}
                    >
                      {selectedGarment.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{selectedGarment.hidden ? 'Unhide' : 'Archive'}</span>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    onClick={() => setSelectedGarmentId(null)}
                    className="text-xs text-[#6E6962] hover:text-[#181716] px-3 h-11 sm:h-9 min-h-[44px] sm:min-h-0 rounded-md justify-center sm:ml-auto col-span-full xs:col-span-2 sm:col-span-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
