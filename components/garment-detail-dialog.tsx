'use client'

import React, { useState, useEffect } from 'react'
import { Garment, Outfit, GarmentCategory, Season, Occasion } from '@/types/wardrobe'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Heart,
  X,
  Layers,
  Check,
  Edit2,
  EyeOff,
  Eye,
  Trash2,
  AlertTriangle,
} from 'lucide-react'

interface GarmentDetailDialogProps {
  garment: Garment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  outfits: Outfit[]
  onToggleFavorite?: (id: string) => void
  onAddToOutfit?: (garment: Garment) => void
  onMarkWorn?: (id: string) => void
  onUpdateGarment?: (updated: Garment) => void
  onToggleHide?: (id: string) => void
  onDeleteGarment?: (id: string) => void
}

const CATEGORIES: GarmentCategory[] = [
  'Tops',
  'Bottoms',
  'Jackets & Outerwear',
  'Shoes',
  'Accessories',
]

const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter', 'All Season']

const OCCASIONS: Occasion[] = [
  'Casual',
  'Smart Casual',
  'Work / Formal',
  'Evening',
  'Active',
]

const COLOR_FAMILIES = ['Neutral', 'Monochrome', 'Earth', 'Blue', 'Warm'] as const

export function GarmentDetailDialog({
  garment,
  open,
  onOpenChange,
  outfits,
  onToggleFavorite,
  onAddToOutfit,
  onMarkWorn,
  onUpdateGarment,
  onToggleHide,
  onDeleteGarment,
}: GarmentDetailDialogProps) {
  const [viewOrientation, setViewOrientation] = useState<'front' | 'back'>('front')
  const [isEditing, setIsEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Edit fields
  const [editName, setEditName] = useState('')
  const [editBrand, setEditBrand] = useState('')
  const [editCategory, setEditCategory] = useState<GarmentCategory>('Tops')
  const [editColorName, setEditColorName] = useState('')
  const [editColorHex, setEditColorHex] = useState('#181716')
  const [editColorFamily, setEditColorFamily] = useState<'Neutral' | 'Monochrome' | 'Earth' | 'Blue' | 'Warm'>('Neutral')
  const [editSeason, setEditSeason] = useState<Season>('Autumn')
  const [editOccasion, setEditOccasion] = useState<Occasion>('Smart Casual')
  const [editMaterial, setEditMaterial] = useState('')
  const [editPattern, setEditPattern] = useState('')
  const [editPrice, setEditPrice] = useState(0)
  const [editNotes, setEditNotes] = useState('')

  useEffect(() => {
    if (garment) {
      setEditName(garment.name)
      setEditBrand(garment.brand)
      setEditCategory(garment.category)
      setEditColorName(garment.color.name)
      setEditColorHex(garment.color.hex)
      setEditColorFamily(garment.color.family || 'Neutral')
      setEditSeason(garment.season)
      setEditOccasion(garment.occasion)
      setEditMaterial(garment.material)
      setEditPattern(garment.pattern)
      setEditPrice(garment.price)
      setEditNotes(garment.notes || '')
      setIsEditing(false)
      setConfirmDelete(false)
      setViewOrientation('front')
    }
  }, [garment, open])

  if (!garment) return null

  // Find all outfits that contain this garment
  const associatedOutfits = outfits.filter((outfit) =>
    outfit.items.some((item) => item.id === garment.id)
  )

  const handleSaveEdit = () => {
    if (onUpdateGarment) {
      onUpdateGarment({
        ...garment,
        name: editName.trim() || garment.name,
        brand: editBrand.trim() || garment.brand,
        category: (editCategory as any) || garment.category,
        color: {
          name: editColorName.trim() || garment.color.name,
          hex: editColorHex || garment.color.hex,
          family: editColorFamily,
        },
        season: editSeason,
        occasion: editOccasion,
        material: editMaterial.trim() || garment.material,
        pattern: editPattern.trim() || garment.pattern,
        price: Number(editPrice) >= 0 ? Number(editPrice) : garment.price,
        notes: editNotes.trim(),
      })
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (onDeleteGarment) {
      onDeleteGarment(garment.id)
      onOpenChange(false)
    }
  }

  const costPerWear = (garment.price / Math.max(1, garment.wearCount)).toFixed(2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-4xl bg-white text-[#181716] p-0 rounded-lg sm:rounded-xl shadow-none overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 flex items-center justify-between bg-[#FAF9F6] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-[10px] font-sans tracking-[0.16em] uppercase text-[#6E6962] font-semibold">
              {garment.brand}
            </span>
            <span className="text-[#96918A]">/</span>
            <span className="text-[10px] font-sans tracking-[0.14em] uppercase text-[#96918A]">
              {garment.category}
            </span>
            {garment.hidden && (
              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-amber-100 text-amber-900 font-medium rounded">
                Archived / Hidden
              </span>
            )}
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="text-[#6E6962] hover:text-[#181716] p-2 -mr-1"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1">
          {/* Main 2-Column Presentation */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left: High-Res Image + Front/Back Angle Toggle */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[260px] md:max-w-none aspect-[3/4] bg-[#FAF9F6] overflow-hidden rounded-md">
                <img
                  src={
                    viewOrientation === 'back' && garment.imageBack
                      ? garment.imageBack
                      : garment.imageFront
                  }
                  alt={garment.name}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 text-[9px] sm:text-[10px] font-mono tracking-wider text-[#6E6962] rounded">
                  {viewOrientation === 'front' ? 'FRONT ANGLE' : 'BACK ANGLE'}
                </div>
              </div>

              {garment.imageBack && (
                <div className="inline-flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setViewOrientation('front')}
                    className={`px-3 py-1.5 min-h-[36px] text-xs tracking-wider uppercase transition-colors border rounded-md ${
                      viewOrientation === 'front'
                        ? 'bg-[#181716] text-[#FAF9F6] border-[#181716]'
                        : 'bg-white text-[#6E6962] border-[#E8E4DC] hover:border-[#181716]'
                    }`}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setViewOrientation('back')}
                    className={`px-3 py-1.5 min-h-[36px] text-xs tracking-wider uppercase transition-colors border rounded-md ${
                      viewOrientation === 'back'
                        ? 'bg-[#181716] text-[#FAF9F6] border-[#181716]'
                        : 'bg-white text-[#6E6962] border-[#E8E4DC] hover:border-[#181716]'
                    }`}
                  >
                    Back
                  </button>
                </div>
              )}
            </div>

            {/* Right: Attributes, Specs & Form */}
            <div className="md:col-span-7 space-y-5 sm:space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono tracking-wider text-[#6E6962] uppercase">
                    ID: {garment.id}
                  </span>

                  <button
                    onClick={() => onToggleFavorite?.(garment.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors min-h-[36px] rounded-md ${
                      garment.favorite
                        ? 'bg-[#F5F2EB] border-[#181716] text-[#181716]'
                        : 'bg-white border-[#E8E4DC] text-[#6E6962] hover:border-[#181716]'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        garment.favorite ? 'fill-current text-[#181716]' : ''
                      }`}
                    />
                    <span>{garment.favorite ? 'Favorited' : 'Favorite'}</span>
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-4 pb-4 border-b border-[#E8E4DC]">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-mono text-[#96918A]">Garment Title</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Garment Name"
                        className="text-base font-serif bg-[#FAF9F6] border-[#E8E4DC] rounded-md shadow-none h-10"
                      />
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-mono text-[#96918A]">Brand / Designer</Label>
                        <Input
                          value={editBrand}
                          onChange={(e) => setEditBrand(e.target.value)}
                          placeholder="Brand"
                          className="text-xs bg-[#FAF9F6] border-[#E8E4DC] rounded-md shadow-none h-10 sm:h-9"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-mono text-[#96918A]">Category</Label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as any)}
                          className="w-full text-xs bg-[#FAF9F6] border border-[#E8E4DC] h-10 sm:h-9 px-2 text-[#181716] outline-none rounded-md"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5 sm:gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-mono text-[#96918A]">Color Name</Label>
                        <Input
                          value={editColorName}
                          onChange={(e) => setEditColorName(e.target.value)}
                          placeholder="e.g. Oatmeal"
                          className="text-xs bg-[#FAF9F6] border-[#E8E4DC] rounded-md shadow-none h-10 sm:h-9"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-mono text-[#96918A]">Color Hex</Label>
                        <div className="flex items-center gap-1.5 h-10 sm:h-9">
                          <input
                            type="color"
                            value={editColorHex}
                            onChange={(e) => setEditColorHex(e.target.value)}
                            className="w-8 h-8 p-0 border border-[#E8E4DC] cursor-pointer rounded"
                          />
                          <span className="text-[11px] font-mono text-[#6E6962]">{editColorHex}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-mono text-[#96918A]">Palette Family</Label>
                        <select
                          value={editColorFamily}
                          onChange={(e) => setEditColorFamily(e.target.value as any)}
                          className="w-full text-xs bg-[#FAF9F6] border border-[#E8E4DC] h-10 sm:h-9 px-1 text-[#181716] outline-none rounded-md"
                        >
                          {COLOR_FAMILIES.map((fam) => (
                            <option key={fam} value={fam}>
                              {fam}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-mono text-[#96918A]">Season</Label>
                        <select
                          value={editSeason}
                          onChange={(e) => setEditSeason(e.target.value as any)}
                          className="w-full text-xs bg-[#FAF9F6] border border-[#E8E4DC] h-10 sm:h-9 px-2 text-[#181716] outline-none rounded-md"
                        >
                          {SEASONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-mono text-[#96918A]">Occasion</Label>
                        <select
                          value={editOccasion}
                          onChange={(e) => setEditOccasion(e.target.value as any)}
                          className="w-full text-xs bg-[#FAF9F6] border border-[#E8E4DC] h-10 sm:h-9 px-2 text-[#181716] outline-none rounded-md"
                        >
                          {OCCASIONS.map((occ) => (
                            <option key={occ} value={occ}>
                              {occ}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5 sm:gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-mono text-[#96918A]">Material</Label>
                        <Input
                          value={editMaterial}
                          onChange={(e) => setEditMaterial(e.target.value)}
                          placeholder="e.g. 100% Linen"
                          className="text-xs bg-[#FAF9F6] border-[#E8E4DC] rounded-md shadow-none h-10 sm:h-9"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-mono text-[#96918A]">Pattern</Label>
                        <Input
                          value={editPattern}
                          onChange={(e) => setEditPattern(e.target.value)}
                          placeholder="e.g. Solid"
                          className="text-xs bg-[#FAF9F6] border-[#E8E4DC] rounded-md shadow-none h-10 sm:h-9"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-mono text-[#96918A]">Price ($)</Label>
                        <Input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          placeholder="Price"
                          className="text-xs bg-[#FAF9F6] border-[#E8E4DC] rounded-md shadow-none h-10 sm:h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-mono text-[#96918A]">Styling Notes</Label>
                      <Input
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Personal styling notes..."
                        className="text-xs bg-[#FAF9F6] border-[#E8E4DC] rounded-md shadow-none h-9"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl sm:text-3xl font-serif font-normal text-[#181716] tracking-tight mb-2">
                      {garment.name}
                    </h3>

                    {garment.notes && (
                      <p className="text-xs font-serif italic text-[#6E6962] leading-relaxed mb-4">
                        &ldquo;{garment.notes}&rdquo;
                      </p>
                    )}

                    {/* Attributes Table */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-4 py-4 sm:py-5 text-xs">
                      <div>
                        <span className="text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-1">
                          Category
                        </span>
                        <span className="font-medium text-[#181716]">{garment.category}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-1">
                          Colorway
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10"
                            style={{ backgroundColor: garment.color.hex }}
                          />
                          <span className="font-medium text-[#181716] truncate">
                            {garment.color.name}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-1">
                          Seasonality
                        </span>
                        <span className="font-medium text-[#181716]">{garment.season}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-1">
                          Occasion
                        </span>
                        <span className="font-medium text-[#181716]">{garment.occasion}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-1">
                          Material
                        </span>
                        <span className="font-medium text-[#181716] truncate" title={garment.material}>
                          {garment.material}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-sans tracking-widest uppercase text-[#96918A] block mb-1">
                          Pattern
                        </span>
                        <span className="font-medium text-[#181716]">{garment.pattern}</span>
                      </div>
                    </div>

                    {/* Financial ROI Metrics */}
                    <div className="grid grid-cols-3 gap-2 py-4 text-center sm:text-left">
                      <div>
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#96918A] block mb-0.5">
                          Wear Count
                        </span>
                        <span className="text-lg sm:text-xl font-serif text-[#181716]">{garment.wearCount}</span>
                      </div>
                      <div>
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#96918A] block mb-0.5">
                          Acquisition
                        </span>
                        <span className="text-lg sm:text-xl font-serif text-[#181716]">${garment.price}</span>
                      </div>
                      <div>
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#96918A] block mb-0.5">
                          Cost / Wear
                        </span>
                        <span className="text-lg sm:text-xl font-serif text-[#181716]">${costPerWear}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons: Favorite, Edit, Hide, Add to Outfit, Delete */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSaveEdit}
                      className="bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs h-10 sm:h-9 px-4 rounded-md uppercase tracking-wider"
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="bg-white border-[#E8E4DC] text-[#6E6962] text-xs h-10 sm:h-9 px-4 rounded-md"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    {onAddToOutfit && (
                      <Button
                        onClick={() => {
                          onAddToOutfit(garment)
                          onOpenChange(false)
                        }}
                        className="bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider px-4 h-10 sm:h-9 rounded-md shadow-none gap-2 flex-1 sm:flex-initial"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Add to Outfit</span>
                      </Button>
                    )}

                    {onMarkWorn && (
                      <Button
                        variant="outline"
                        onClick={() => onMarkWorn(garment.id)}
                        className="bg-white border-[#E8E4DC] text-[#181716] hover:border-[#181716] text-xs px-3 h-10 sm:h-9 rounded-md shadow-none gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-[#181716]" />
                        <span>Mark Worn Today</span>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="bg-white border-[#E8E4DC] text-[#6E6962] hover:text-[#181716] text-xs px-3 h-10 sm:h-9 rounded-md shadow-none gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Button>

                    {onToggleHide && (
                      <Button
                        variant="outline"
                        onClick={() => onToggleHide(garment.id)}
                        className="bg-white border-[#E8E4DC] text-[#6E6962] hover:text-[#181716] text-xs px-3 h-10 sm:h-9 rounded-md shadow-none gap-1.5"
                      >
                        {garment.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{garment.hidden ? 'Unhide' : 'Archive'}</span>
                      </Button>
                    )}

                    {confirmDelete ? (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-[11px] text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Delete?</span>
                        </span>
                        <Button
                          size="sm"
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700 text-white text-[11px] h-8 px-2 rounded-md"
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDelete(false)}
                          className="text-[11px] h-8 px-2 rounded-md"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      onDeleteGarment && (
                        <Button
                          variant="ghost"
                          onClick={() => setConfirmDelete(true)}
                          className="text-[#96918A] hover:text-red-600 text-xs px-2 h-10 sm:h-9 rounded-md ml-auto"
                          title="Delete piece from wardrobe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section: Outfits Featuring This Piece */}
          <div className="pt-6 border-t border-[#E8E4DC]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-serif font-normal text-[#181716]">
                Featured in Outfits ({associatedOutfits.length})
              </h4>
              <span className="text-[11px] text-[#96918A] font-light">
                Outfits containing this garment
              </span>
            </div>

            {associatedOutfits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {associatedOutfits.map((outfit) => (
                  <div
                    key={outfit.id}
                    className="bg-[#FAF9F6] border border-[#E8E4DC] p-3 space-y-2 rounded-md overflow-hidden"
                  >
                    <div className="grid grid-cols-4 gap-1 aspect-[16/9] bg-white border border-[#E8E4DC] p-1 rounded-md overflow-hidden">
                      {outfit.items.slice(0, 4).map((i) => (
                        <div key={i.id} className="relative overflow-hidden bg-[#FAF9F6] rounded">
                          <img
                            src={i.imageFront}
                            alt={i.name}
                            className={`w-full h-full object-cover ${
                              i.id === garment.id ? 'ring-1 ring-[#181716]' : 'opacity-80'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <span className="text-[9px] font-sans uppercase tracking-widest text-[#96918A]">
                        {outfit.occasion}
                      </span>
                      <h5 className="text-xs font-serif text-[#181716] truncate">
                        {outfit.title}
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-[#FAF9F6] border border-[#E8E4DC] text-center rounded-md">
                <p className="text-xs text-[#6E6962] font-light mb-2">
                  This piece is not yet featured in any saved looks.
                </p>
                {onAddToOutfit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onAddToOutfit(garment)
                      onOpenChange(false)
                    }}
                    className="text-xs bg-white border-[#E8E4DC] text-[#181716] rounded-md hover:border-[#181716]"
                  >
                    Create First Outfit with This Piece
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
