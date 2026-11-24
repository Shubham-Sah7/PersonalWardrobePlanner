'use client'

import React, { useState } from 'react'
import { Collection, Garment, Outfit, Season } from '@/types/wardrobe'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  ArrowLeft,
  Plus,
  Check,
  X,
  Edit2,
  Trash2,
  AlertTriangle,
  FolderPlus,
  Shirt,
  Layers,
} from 'lucide-react'

interface CollectionsViewProps {
  collections: Collection[]
  garments: Garment[]
  outfits: Outfit[]
  onWearOutfit: (outfitId: string) => void
  onSelectGarment?: (garment: Garment) => void
  onCreateCollection?: (col: Omit<Collection, 'id'>) => Collection
  onUpdateCollection?: (col: Collection) => void
  onDeleteCollection?: (id: string) => void
  onAddGarmentToCollection?: (collectionId: string, garmentId: string) => void
  onRemoveGarmentFromCollection?: (collectionId: string, garmentId: string) => void
  onAddOutfitToCollection?: (collectionId: string, outfitId: string) => void
  onRemoveOutfitFromCollection?: (collectionId: string, outfitId: string) => void
}

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
]

export function CollectionsView({
  collections,
  garments,
  outfits,
  onWearOutfit,
  onSelectGarment,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
  onAddGarmentToCollection,
  onRemoveGarmentFromCollection,
  onAddOutfitToCollection,
  onRemoveOutfitFromCollection,
}: CollectionsViewProps) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [piecesModalOpen, setPiecesModalOpen] = useState(false)
  const [outfitsModalOpen, setOutfitsModalOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Create Form State
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formType, setFormType] = useState<'Season' | 'Occasion' | 'Trip' | 'Capsule'>('Capsule')
  const [formSeason, setFormSeason] = useState<Season>('Autumn')
  const [formCoverImage, setFormCoverImage] = useState(COVER_PRESETS[0])

  // Active Collection
  const activeCollection = collections.find((c) => c.id === selectedCollectionId) || null

  // Items in active collection
  const collectionGarments = activeCollection
    ? garments.filter((g) => activeCollection.clothingItemIds.includes(g.id))
    : []

  // Outfits in active collection
  const collectionOutfits = activeCollection
    ? outfits.filter((o) => activeCollection.outfitIds.includes(o.id))
    : []

  // Open Create Dialog
  const handleOpenCreate = () => {
    setFormTitle('')
    setFormDescription('')
    setFormType('Capsule')
    setFormSeason('Autumn')
    setFormCoverImage(garments[0]?.imageFront || COVER_PRESETS[0])
    setCreateDialogOpen(true)
  }

  // Submit Create
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) return

    if (onCreateCollection) {
      const created = onCreateCollection({
        title: formTitle.trim(),
        description: formDescription.trim() || 'Custom curated wardrobe collection.',
        type: formType,
        season: formSeason,
        coverImage: formCoverImage,
        clothingItemIds: [],
        outfitIds: [],
      })
      setSelectedCollectionId(created.id)
    }
    setCreateDialogOpen(false)
  }

  // Open Edit Dialog
  const handleOpenEdit = () => {
    if (!activeCollection) return
    setFormTitle(activeCollection.title)
    setFormDescription(activeCollection.description)
    setFormType(activeCollection.type)
    setFormSeason(activeCollection.season || 'Autumn')
    setFormCoverImage(activeCollection.coverImage)
    setEditDialogOpen(true)
  }

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeCollection || !formTitle.trim()) return

    if (onUpdateCollection) {
      onUpdateCollection({
        ...activeCollection,
        title: formTitle.trim(),
        description: formDescription.trim(),
        type: formType,
        season: formSeason,
        coverImage: formCoverImage,
      })
    }
    setEditDialogOpen(false)
  }

  // Handle Delete
  const handleDeleteCollection = (id: string) => {
    if (onDeleteCollection) {
      onDeleteCollection(id)
    }
    if (selectedCollectionId === id) {
      setSelectedCollectionId(null)
    }
    setConfirmDeleteId(null)
  }

  return (
    <div className="w-full bg-[#FAF9F6] text-[#181716] p-0 sm:p-2">
      {/* ── SUB-VIEW: COLLECTION DEEP DIVE ── */}
      {activeCollection ? (
        <div className="space-y-10">
          {/* Header & Back Button */}
          <div className="pb-4 sm:pb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedCollectionId(null)}
                className="inline-flex items-center gap-2 text-xs font-sans tracking-wide uppercase text-[#6E6962] hover:text-[#181716] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All Collections</span>
              </button>

              {/* Edit / Delete Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenEdit}
                  className="h-8 px-3 text-xs bg-white border-[#E8E4DC] text-[#6E6962] hover:text-[#181716] rounded-md gap-1.5"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Rename / Edit</span>
                </Button>

                {confirmDeleteId === activeCollection.id ? (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => handleDeleteCollection(activeCollection.id)}
                      className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md"
                    >
                      Confirm Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDeleteId(null)}
                      className="h-8 px-2 text-xs text-[#6E6962] rounded-md"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDeleteId(activeCollection.id)}
                    className="h-8 px-2 text-xs text-[#96918A] hover:text-red-600 rounded-md"
                    title="Delete collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.16em] text-[#96918A] block mb-1">
                  {activeCollection.type} Capsule • {activeCollection.season || 'All Season'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#181716] tracking-tight">
                  {activeCollection.title}
                </h2>
                <p className="text-xs text-[#6E6962] font-light max-w-xl mt-1.5 leading-relaxed">
                  {activeCollection.description}
                </p>
              </div>

              <div className="text-xs font-mono text-[#6E6962]">
                <span>{collectionGarments.length} Pieces</span>
                <span className="mx-2">•</span>
                <span>{collectionOutfits.length} Outfits</span>
              </div>
            </div>
          </div>

          {/* Section 1: Curated Pieces */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-normal text-[#181716]">
                  Curated Pieces ({collectionGarments.length})
                </h3>
                <span className="text-xs text-[#96918A] font-light">
                  Garments currently in this capsule
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setPiecesModalOpen(true)}
                className="h-8 px-3 bg-white border-[#E8E4DC] hover:border-[#181716] text-[#181716] text-xs font-medium uppercase tracking-wider rounded-md shadow-none gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Pieces</span>
              </Button>
            </div>

            {collectionGarments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
                {collectionGarments.map((garment) => (
                  <div
                    key={garment.id}
                    className="group bg-white hover:shadow-sm transition-all relative flex flex-col justify-between rounded-md overflow-hidden"
                  >
                    <div
                      onClick={() => onSelectGarment?.(garment)}
                      className="cursor-pointer"
                    >
                      <div className="aspect-[3/4] bg-[#FAF9F6] overflow-hidden relative rounded-t-md">
                        <img
                          src={garment.imageFront}
                          alt={garment.name}
                          className="w-full h-full object-cover object-center"
                        />
                        {/* Remove from collection icon button */}
                        {onRemoveGarmentFromCollection && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onRemoveGarmentFromCollection(activeCollection.id, garment.id)
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 hover:bg-red-50 hover:text-red-600 text-[#96918A] flex items-center justify-center transition-colors rounded-full"
                            title="Remove piece from collection"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="p-3">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-[#96918A] block mb-0.5">
                          {garment.brand}
                        </span>
                        <h4 className="text-xs font-serif text-[#181716] truncate">
                          {garment.name}
                        </h4>
                        <span className="text-[10px] text-[#6E6962] block mt-1 font-mono">
                          ${garment.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white border border-[#E8E4DC] space-y-3">
                <p className="text-xs text-[#6E6962]">No pieces added to this capsule yet.</p>
                <Button
                  size="sm"
                  onClick={() => setPiecesModalOpen(true)}
                  className="bg-[#181716] text-[#FAF9F6] text-xs uppercase px-4 h-8 rounded-none"
                >
                  Add Pieces from Wardrobe
                </Button>
              </div>
            )}
          </div>

          {/* Section 2: Associated Looks & Outfits */}
          <div className="space-y-4 pt-4 border-t border-[#E8E4DC]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-normal text-[#181716]">
                  Associated Outfits ({collectionOutfits.length})
                </h3>
                <span className="text-xs text-[#96918A] font-light">
                  Outfits saved in this capsule
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setOutfitsModalOpen(true)}
                className="h-8 px-3 bg-white border-[#E8E4DC] hover:border-[#181716] text-[#181716] text-xs font-medium uppercase tracking-wider rounded-none shadow-none gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Looks</span>
              </Button>
            </div>

            {collectionOutfits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collectionOutfits.map((outfit) => (
                  <div
                    key={outfit.id}
                    className="bg-white border border-[#E8E4DC] p-5 flex flex-col justify-between space-y-4 relative rounded-md"
                  >
                    <div>
                      <div className="grid grid-cols-4 gap-1.5 aspect-[16/10] bg-[#FAF9F6] border border-[#E8E4DC] p-2 mb-3 relative rounded-md overflow-hidden">
                        {outfit.items.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="relative overflow-hidden bg-white border border-[#E8E4DC] rounded"
                          >
                            <img
                              src={item.imageFront}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}

                        {/* Remove Outfit from collection button */}
                        {onRemoveOutfitFromCollection && (
                          <button
                            onClick={() => onRemoveOutfitFromCollection(activeCollection.id, outfit.id)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-white border border-[#E8E4DC] hover:bg-red-50 hover:text-red-600 text-[#96918A] flex items-center justify-center transition-colors rounded-full"
                            title="Remove look from collection"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="text-[10px] uppercase tracking-widest text-[#96918A] mb-1">
                        {outfit.occasion} • {outfit.season}
                      </div>
                      <h4 className="text-base font-serif text-[#181716] mb-1">
                        {outfit.title}
                      </h4>
                      {outfit.notes && (
                        <p className="text-xs font-serif italic text-[#6E6962] line-clamp-2">
                          &ldquo;{outfit.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E8E4DC] flex items-center justify-between">
                      <span className="text-xs text-[#6E6962] font-mono">
                        {outfit.wearCount} wears
                      </span>

                      <Button
                        size="sm"
                        onClick={() => onWearOutfit(outfit.id)}
                        className="h-8 px-3 bg-white border border-[#E8E4DC] hover:border-[#181716] text-[#181716] text-xs font-medium uppercase tracking-wider rounded-md shadow-none gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Wore Today</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white border border-[#E8E4DC] space-y-3 rounded-md">
                <p className="text-xs text-[#6E6962]">No outfits added to this capsule yet.</p>
                <Button
                  size="sm"
                  onClick={() => setOutfitsModalOpen(true)}
                  className="bg-[#181716] text-[#FAF9F6] text-xs uppercase px-4 h-8 rounded-md"
                >
                  Add Looks to Capsule
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── MAIN COLLECTIONS GALLERY ── */
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#181716]">
                Collections
              </h2>
              <p className="text-xs text-[#6E6962] font-light mt-1">
                Wardrobe capsules organized by season, trip, or dress code.
              </p>
            </div>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="h-8 px-3.5 bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider rounded-md shadow-none gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Collection</span>
            </Button>
          </div>

          {/* Grid of Collection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {collections.map((col) => {
              return (
                <div
                  key={col.id}
                  onClick={() => setSelectedCollectionId(col.id)}
                  className="group bg-white hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between rounded-md overflow-hidden"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-[16/10] bg-[#FAF9F6] overflow-hidden rounded-t-md">
                    <img
                      src={col.coverImage}
                      alt={col.title}
                      className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 px-2 py-0.5 text-[10px] font-mono tracking-wider text-[#6E6962] rounded">
                      {col.type.toUpperCase()}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block mb-1">
                        {col.season || 'All Season'}
                      </span>
                      <h3 className="text-xl font-serif font-normal text-[#181716] tracking-tight mb-2">
                        {col.title}
                      </h3>
                      <p className="text-xs text-[#6E6962] font-light leading-relaxed line-clamp-2">
                        {col.description}
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between text-xs text-[#6E6962]">
                      <span className="font-mono">
                        {col.clothingItemIds.length} pieces • {col.outfitIds.length} looks
                      </span>
                      <span className="text-[#181716] font-medium group-hover:underline">
                        Explore →
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT COLLECTION DIALOG ── */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false)
            setEditDialogOpen(false)
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-lg bg-white border-[#E8E4DC] text-[#181716] p-0 rounded-lg sm:rounded-xl shadow-none overflow-hidden">
          <div className="p-5 border-b border-[#E8E4DC] bg-[#FAF9F6] flex items-center justify-between">
            <DialogTitle className="text-lg font-serif">
              {createDialogOpen ? 'Create New Collection' : 'Edit Collection'}
            </DialogTitle>
            <button
              onClick={() => {
                setCreateDialogOpen(false)
                setEditDialogOpen(false)
              }}
              className="text-[#6E6962] hover:text-[#181716]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form
            onSubmit={createDialogOpen ? handleCreateSubmit : handleEditSubmit}
            className="p-6 space-y-4 text-xs"
          >
            <div>
              <Label className="text-[10px] uppercase font-mono text-[#96918A] mb-1 block">
                Collection Title *
              </Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Summer in Provence, Workwear Essentials"
                required
                className="h-9 bg-[#FAF9F6] border-[#E8E4DC] rounded-md shadow-none text-xs"
              />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-mono text-[#96918A] mb-1 block">
                Description
              </Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Curated capsule overview..."
                className="h-9 bg-[#FAF9F6] border-[#E8E4DC] rounded-md shadow-none text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-mono text-[#96918A] mb-1 block">
                  Capsule Type
                </Label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full h-9 px-2 bg-[#FAF9F6] border border-[#E8E4DC] rounded-md outline-none text-xs"
                >
                  <option value="Capsule">Capsule</option>
                  <option value="Trip">Trip / Travel</option>
                  <option value="Season">Seasonal</option>
                  <option value="Occasion">Occasion</option>
                </select>
              </div>

              <div>
                <Label className="text-[10px] uppercase font-mono text-[#96918A] mb-1 block">
                  Season
                </Label>
                <select
                  value={formSeason}
                  onChange={(e) => setFormSeason(e.target.value as any)}
                  className="w-full h-9 px-2 bg-[#FAF9F6] border border-[#E8E4DC] rounded-md outline-none text-xs"
                >
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Autumn">Autumn</option>
                  <option value="Winter">Winter</option>
                  <option value="All Season">All Season</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-mono text-[#96918A] mb-1.5 block">
                Cover Photo (Select Preset)
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {COVER_PRESETS.map((imgUrl, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setFormCoverImage(imgUrl)}
                    className={`aspect-[4/3] border overflow-hidden transition-all rounded-md ${
                      formCoverImage === imgUrl ? 'ring-2 ring-[#181716] border-[#181716]' : 'border-[#E8E4DC] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="Cover preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E4DC] flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false)
                  setEditDialogOpen(false)
                }}
                className="h-9 px-4 rounded-md text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 px-5 bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] rounded-md text-xs uppercase tracking-wider"
              >
                {createDialogOpen ? 'Create Collection' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MANAGE PIECES MODAL ── */}
      {activeCollection && (
        <Dialog open={piecesModalOpen} onOpenChange={setPiecesModalOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl bg-white border-[#E8E4DC] text-[#181716] p-0 rounded-lg sm:rounded-xl shadow-none max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E8E4DC] bg-[#FAF9F6] flex items-center justify-between">
              <div>
                <DialogTitle className="text-base sm:text-lg font-serif">
                  Manage Pieces in &quot;{activeCollection.title}&quot;
                </DialogTitle>
                <DialogDescription className="text-xs text-[#6E6962] font-light">
                  Select which garments from your wardrobe belong to this capsule.
                </DialogDescription>
              </div>
              <button onClick={() => setPiecesModalOpen(false)} className="text-[#6E6962] hover:text-[#181716] p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {garments.map((garment) => {
                const inCollection = activeCollection.clothingItemIds.includes(garment.id)
                return (
                  <div
                    key={garment.id}
                    onClick={() => {
                      if (inCollection) {
                        onRemoveGarmentFromCollection?.(activeCollection.id, garment.id)
                      } else {
                        onAddGarmentToCollection?.(activeCollection.id, garment.id)
                      }
                    }}
                    className={`p-2.5 border cursor-pointer transition-colors flex items-center gap-3 rounded-md ${
                      inCollection
                        ? 'border-[#181716] bg-[#F5F2EB]'
                        : 'border-[#E8E4DC] bg-white hover:border-[#181716]'
                    }`}
                  >
                    <div className="w-4 h-4 border border-[#181716] flex items-center justify-center shrink-0 bg-white rounded-sm">
                      {inCollection && <Check className="w-3 h-3 text-[#181716]" />}
                    </div>

                    <img
                      src={garment.imageFront}
                      alt={garment.name}
                      className="w-10 h-12 object-cover border border-[#E8E4DC] shrink-0 rounded"
                    />

                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase tracking-wider text-[#96918A] block">
                        {garment.category}
                      </span>
                      <h5 className="text-xs font-serif text-[#181716] truncate">
                        {garment.name}
                      </h5>
                      <span className="text-[10px] text-[#6E6962] font-mono">
                        {garment.brand} • ${garment.price}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-4 border-t border-[#E8E4DC] bg-[#FAF9F6] flex justify-between items-center text-xs">
              <span className="text-[#6E6962] font-mono">
                {activeCollection.clothingItemIds.length} pieces selected
              </span>
              <Button
                size="sm"
                onClick={() => setPiecesModalOpen(false)}
                className="bg-[#181716] text-[#FAF9F6] text-xs uppercase px-4 h-8 rounded-md"
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MANAGE LOOKS MODAL ── */}
      {activeCollection && (
        <Dialog open={outfitsModalOpen} onOpenChange={setOutfitsModalOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl bg-white border-[#E8E4DC] text-[#181716] p-0 rounded-lg sm:rounded-xl shadow-none max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E8E4DC] bg-[#FAF9F6] flex items-center justify-between">
              <div>
                <DialogTitle className="text-base sm:text-lg font-serif">
                  Manage Looks in &quot;{activeCollection.title}&quot;
                </DialogTitle>
                <DialogDescription className="text-xs text-[#6E6962] font-light">
                  Select which saved looks belong to this capsule.
                </DialogDescription>
              </div>
              <button onClick={() => setOutfitsModalOpen(false)} className="text-[#6E6962] hover:text-[#181716] p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-2.5">
              {outfits.map((outfit) => {
                const inCollection = activeCollection.outfitIds.includes(outfit.id)
                return (
                  <div
                    key={outfit.id}
                    onClick={() => {
                      if (inCollection) {
                        onRemoveOutfitFromCollection?.(activeCollection.id, outfit.id)
                      } else {
                        onAddOutfitToCollection?.(activeCollection.id, outfit.id)
                      }
                    }}
                    className={`p-3 border cursor-pointer transition-colors flex items-center justify-between gap-3 rounded-md ${
                      inCollection
                        ? 'border-[#181716] bg-[#F5F2EB]'
                        : 'border-[#E8E4DC] bg-white hover:border-[#181716]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-4 h-4 border border-[#181716] flex items-center justify-center shrink-0 bg-white rounded-sm">
                        {inCollection && <Check className="w-3 h-3 text-[#181716]" />}
                      </div>

                      <div className="flex gap-1 shrink-0">
                        {outfit.items.slice(0, 3).map((i) => (
                          <img
                            key={i.id}
                            src={i.imageFront}
                            alt={i.name}
                            className="w-8 h-10 object-cover border border-[#E8E4DC] rounded"
                          />
                        ))}
                      </div>

                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-wider text-[#96918A] block">
                          {outfit.occasion} • {outfit.season}
                        </span>
                        <h5 className="text-xs font-serif text-[#181716] truncate">
                          {outfit.title}
                        </h5>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-[#6E6962] shrink-0">
                      {outfit.items.length} items
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="p-4 border-t border-[#E8E4DC] bg-[#FAF9F6] flex justify-between items-center text-xs">
              <span className="text-[#6E6962] font-mono">
                {activeCollection.outfitIds.length} looks selected
              </span>
              <Button
                size="sm"
                onClick={() => setOutfitsModalOpen(false)}
                className="bg-[#181716] text-[#FAF9F6] text-xs uppercase px-4 h-8 rounded-md"
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
