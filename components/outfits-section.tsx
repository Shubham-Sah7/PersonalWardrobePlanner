'use client'

import React, { useState } from 'react'
import { Outfit, Garment, Occasion } from '@/types/wardrobe'
import { OutfitStudio } from '@/components/outfit-studio'
import { Button } from '@/components/ui/button'
import { Plus, Check, Layers, Filter, Edit2, Trash2, AlertTriangle } from 'lucide-react'

interface OutfitsSectionProps {
  outfits: Outfit[]
  garments: Garment[]
  onSaveOutfit: (outfit: Outfit) => void
  onWearOutfit: (outfitId: string) => void
  onMarkGarmentWorn: (garmentId: string) => void
  onDeleteOutfit?: (outfitId: string) => void
  editingOutfit?: Outfit | null
  onStartEditingOutfit?: (outfit: Outfit) => void
}

export function OutfitsSection({
  outfits,
  garments,
  onSaveOutfit,
  onWearOutfit,
  onMarkGarmentWorn,
  onDeleteOutfit,
  editingOutfit = null,
  onStartEditingOutfit,
}: OutfitsSectionProps) {
  // Sub-tabs: 'all' | 'creator' | 'occasion'
  const [subTab, setSubTab] = useState<'all' | 'creator' | 'occasion'>(
    editingOutfit ? 'creator' : 'all'
  )
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | 'All'>('All')
  const [sortBy, setSortBy] = useState<'recent' | 'worn'>('recent')
  const [localEditingOutfit, setLocalEditingOutfit] = useState<Outfit | null>(editingOutfit)
  const [deletingOutfitId, setDeletingOutfitId] = useState<string | null>(null)

  // Sync when parent initiates outfit creation or editing
  React.useEffect(() => {
    if (editingOutfit) {
      setLocalEditingOutfit(editingOutfit)
      setSubTab('creator')
    }
  }, [editingOutfit])

  // Support URL query (?tab=outfits&sub=creator or ?sub=creator)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('sub') === 'creator' || params.get('tab') === 'creator') {
        setSubTab('creator')
      }
    }
  }, [])

  const occasions: (Occasion | 'All')[] = [
    'All',
    'Smart Casual',
    'Work / Formal',
    'Evening',
    'Casual',
    'Active',
  ]

  const filteredOutfits = outfits
    .filter((o) => {
      if (selectedOccasion === 'All') return true
      return o.occasion === selectedOccasion
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return b.wearCount - a.wearCount
    })

  const handleEditOutfit = (outfit: Outfit) => {
    setLocalEditingOutfit(outfit)
    setSubTab('creator')
    if (onStartEditingOutfit) {
      onStartEditingOutfit(outfit)
    }
  }

  const handleDelete = (id: string) => {
    if (onDeleteOutfit) {
      onDeleteOutfit(id)
    }
    setDeletingOutfitId(null)
  }

  return (
    <div className="w-full space-y-8">
      {/* ── SUB-NAVIGATION BAR ── */}
      <div className="bg-[#FAF9F6] p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md">
        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 pb-2 sm:pb-0 overflow-x-auto scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0 touch-pan-x">
          <button
            onClick={() => {
              setSubTab('all')
              setLocalEditingOutfit(null)
            }}
            className={`px-3.5 py-2 min-h-[44px] text-xs font-sans tracking-wide uppercase transition-colors shrink-0 flex items-center rounded ${
              subTab === 'all'
                ? 'text-[#181716] font-medium border-b border-[#181716]'
                : 'text-[#6E6962] hover:text-[#181716]'
            }`}
          >
            All Outfits ({outfits.length})
          </button>

          <button
            onClick={() => setSubTab('creator')}
            className={`px-3.5 py-2 min-h-[44px] text-xs font-sans tracking-wide uppercase transition-colors flex items-center gap-1.5 shrink-0 rounded ${
              subTab === 'creator'
                ? 'text-[#181716] font-medium border-b border-[#181716]'
                : 'text-[#6E6962] hover:text-[#181716]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{localEditingOutfit ? 'Edit Look' : 'Outfit Creator'}</span>
          </button>

          <button
            onClick={() => {
              setSubTab('occasion')
              setLocalEditingOutfit(null)
            }}
            className={`px-3.5 py-2 min-h-[44px] text-xs font-sans tracking-wide uppercase transition-colors flex items-center gap-1.5 shrink-0 rounded ${
              subTab === 'occasion'
                ? 'text-[#181716] font-medium border-b border-[#181716]'
                : 'text-[#6E6962] hover:text-[#181716]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>By Occasion</span>
          </button>
        </div>

        {/* Right CTA / Sort */}
        <div className="flex items-center gap-3">
          {subTab !== 'creator' && (
            <div className="flex items-center gap-2 text-xs text-[#6E6962]">
              <span>Sort:</span>
              <button
                onClick={() => setSortBy('recent')}
                className={`transition-colors ${sortBy === 'recent' ? 'text-[#181716] font-medium' : 'hover:text-[#181716]'}`}
              >
                Recent
              </button>
              <span>•</span>
              <button
                onClick={() => setSortBy('worn')}
                className={`transition-colors ${sortBy === 'worn' ? 'text-[#181716] font-medium' : 'hover:text-[#181716]'}`}
              >
                Most Worn
              </button>
            </div>
          )}

          {subTab !== 'creator' && (
            <Button
              size="sm"
              onClick={() => {
                setLocalEditingOutfit(null)
                setSubTab('creator')
              }}
              className="h-8 px-3.5 bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider rounded-md shadow-none gap-1.5 ml-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Look</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── SUB-TAB 1: OUTFIT CREATOR CANVAS ── */}
      {subTab === 'creator' && (
        <OutfitStudio
          garments={garments}
          outfits={outfits}
          initialOutfit={localEditingOutfit}
          onSaveOutfit={(newOutfit) => {
            onSaveOutfit(newOutfit)
            setLocalEditingOutfit(null)
            setSubTab('all')
          }}
          onMarkWorn={onMarkGarmentWorn}
          onCancelEdit={() => {
            setLocalEditingOutfit(null)
            setSubTab('all')
          }}
        />
      )}

      {/* ── SUB-TAB 2: OUTFITS GRID (All Outfits & By Occasion) ── */}
      {subTab !== 'creator' && (
        <div className="space-y-6">
          {/* Occasion Filter Bar when in 'occasion' sub-tab */}
          {subTab === 'occasion' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {occasions.map((occ) => {
                const isSelected = selectedOccasion === occ
                return (
                  <button
                    key={occ}
                    onClick={() => setSelectedOccasion(occ)}
                    className={`px-3 py-1 text-xs tracking-wider uppercase transition-colors rounded ${
                      isSelected
                        ? 'bg-[#181716] text-[#FAF9F6] font-medium'
                        : 'bg-white text-[#6E6962] hover:text-[#181716]'
                    }`}
                  >
                    {occ}
                  </button>
                )
              })}
            </div>
          )}

          {/* Grid of Outfits */}
          {filteredOutfits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredOutfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="bg-white hover:shadow-sm transition-all flex flex-col justify-between rounded-md overflow-hidden"
                >
                  {/* Outfit Composite Grid */}
                  <div className="p-3.5 sm:p-4 bg-[#FAF9F6]">
                    <div className="grid grid-cols-4 gap-2 aspect-[16/10] bg-white p-2 rounded-md overflow-hidden">
                      {outfit.items.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="relative overflow-hidden bg-[#FAF9F6] rounded"
                        >
                          <img
                            src={item.imageFront}
                            alt={item.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outfit Meta Info */}
                  <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-widest text-[#96918A]">
                          <span>{outfit.occasion}</span>
                          <span>•</span>
                          <span>{outfit.season}</span>
                        </div>
                        <span className="text-xs font-mono text-[#6E6962]">
                          ${outfit.items.reduce((sum, item) => sum + item.price, 0)}
                        </span>
                      </div>

                      <h3 className="text-xl font-serif font-normal text-[#181716] tracking-tight mb-2">
                        {outfit.title}
                      </h3>

                      {outfit.notes && (
                        <p className="text-xs font-serif italic text-[#6E6962] line-clamp-2 mb-4 leading-relaxed">
                          &ldquo;{outfit.notes}&rdquo;
                        </p>
                      )}

                      {/* Garment pills */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {outfit.items.map((i) => (
                          <span
                            key={i.id}
                            className="text-[10px] px-2 py-0.5 bg-[#FAF9F6] text-[#6E6962] tracking-wider uppercase truncate max-w-[120px] rounded"
                            title={i.name}
                          >
                            {i.brand || i.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="pt-4 flex items-center justify-between">
                      <span className="text-xs text-[#6E6962] font-mono">
                        {outfit.wearCount} {outfit.wearCount === 1 ? 'wear' : 'wears'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditOutfit(outfit)}
                          className="h-8 px-2.5 bg-white border border-[#E8E4DC] hover:border-[#181716] text-[#6E6962] hover:text-[#181716] text-xs rounded-md shadow-none gap-1"
                          title="Edit this outfit in Studio"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => onWearOutfit(outfit.id)}
                          className="h-8 px-3 bg-white border border-[#E8E4DC] hover:border-[#181716] text-[#181716] text-xs font-medium uppercase tracking-wider rounded-md shadow-none gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Wore Today</span>
                        </Button>

                        {onDeleteOutfit && (
                          deletingOutfitId === outfit.id ? (
                            <div className="inline-flex items-center gap-1 ml-1">
                              <Button
                                size="sm"
                                onClick={() => handleDelete(outfit.id)}
                                className="h-8 px-2 bg-red-600 hover:bg-red-700 text-white text-[10px] rounded-md shadow-none"
                              >
                                Delete
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeletingOutfitId(null)}
                                className="h-8 px-1.5 text-xs text-[#6E6962] rounded-md"
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeletingOutfitId(outfit.id)}
                              className="h-8 w-8 p-0 text-[#96918A] hover:text-red-600 rounded-md"
                              title="Delete outfit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-[#E8E4DC] bg-white space-y-3 rounded-md">
              <h3 className="text-lg font-serif text-[#181716]">No Outfits in this category</h3>
              <p className="text-xs text-[#6E6962]">
                Create a look for {selectedOccasion} using the Outfit Studio.
              </p>
              <Button
                onClick={() => setSubTab('creator')}
                className="bg-[#181716] text-[#FAF9F6] text-xs uppercase px-4 h-9 rounded-md shadow-none"
              >
                Open Outfit Studio
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
