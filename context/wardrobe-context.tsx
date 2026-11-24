'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Garment, Outfit, Collection } from '@/types/wardrobe'
import { INITIAL_GARMENTS, INITIAL_OUTFITS, INITIAL_COLLECTIONS } from '@/data/mock-wardrobe'

const STORAGE_KEY_GARMENTS = 'atelier_wardrobe_v3_mens_garments'
const STORAGE_KEY_OUTFITS = 'atelier_wardrobe_v3_mens_outfits'
const STORAGE_KEY_COLLECTIONS = 'atelier_wardrobe_v3_mens_collections'

interface WardrobeContextType {
  garments: Garment[]
  outfits: Outfit[]
  collections: Collection[]
  activeTab: 'wardrobe' | 'outfits' | 'collections' | 'insights'
  setActiveTab: (tab: 'wardrobe' | 'outfits' | 'collections' | 'insights') => void
  showArchived: boolean
  setShowArchived: (show: boolean) => void
  editingOutfit: Outfit | null
  setEditingOutfit: (outfit: Outfit | null) => void
  selectedGarmentForDetail: Garment | null
  setSelectedGarmentForDetail: (garment: Garment | null) => void
  detailDialogOpen: boolean
  setDetailDialogOpen: (open: boolean) => void
  workflowOpen: boolean
  setWorkflowOpen: (open: boolean) => void
  workflowMode: 'upload' | 'review' | 'ambiguous_state'
  setWorkflowMode: (mode: 'upload' | 'review' | 'ambiguous_state') => void
  simulateEmptyWardrobe: boolean
  setSimulateEmptyWardrobe: (simulate: boolean) => void

  // Actions
  toggleFavorite: (id: string) => void
  toggleHide: (id: string) => void
  updateGarment: (updated: Garment) => void
  addGarments: (newGarments: Garment[]) => void
  deleteGarment: (id: string) => void
  markGarmentWorn: (id: string) => void
  saveOutfit: (outfit: Outfit) => void
  deleteOutfit: (id: string) => void
  wearOutfit: (outfitId: string) => void
  createCollection: (collection: Omit<Collection, 'id'>) => Collection
  updateCollection: (updated: Collection) => void
  deleteCollection: (id: string) => void
  addGarmentToCollection: (collectionId: string, garmentId: string) => void
  removeGarmentFromCollection: (collectionId: string, garmentId: string) => void
  addOutfitToCollection: (collectionId: string, outfitId: string) => void
  removeOutfitFromCollection: (collectionId: string, outfitId: string) => void
  openItemDetails: (garment: Garment) => void
  startCreatingOutfit: (initialGarment?: Garment) => void
  startEditingOutfit: (outfit: Outfit) => void
  resetToDefaults: () => void
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined)

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const [garments, setGarments] = useState<Garment[]>(INITIAL_GARMENTS)
  const [outfits, setOutfits] = useState<Outfit[]>(INITIAL_OUTFITS)
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS)
  const [isHydrated, setIsHydrated] = useState(false)

  // Primary navigation
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'outfits' | 'collections' | 'insights'>('wardrobe')
  const [showArchived, setShowArchived] = useState(false)
  const [simulateEmptyWardrobe, setSimulateEmptyWardrobe] = useState(false)

  // Modals & workflows
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null)
  const [selectedGarmentForDetail, setSelectedGarmentForDetail] = useState<Garment | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [workflowOpen, setWorkflowOpen] = useState(false)
  const [workflowMode, setWorkflowMode] = useState<'upload' | 'review' | 'ambiguous_state'>('upload')

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const storedGarments = localStorage.getItem(STORAGE_KEY_GARMENTS)
      const storedOutfits = localStorage.getItem(STORAGE_KEY_OUTFITS)
      const storedCollections = localStorage.getItem(STORAGE_KEY_COLLECTIONS)

      if (storedGarments) {
        setGarments(JSON.parse(storedGarments))
      }
      if (storedOutfits) {
        setOutfits(JSON.parse(storedOutfits))
      }
      if (storedCollections) {
        setCollections(JSON.parse(storedCollections))
      }
    } catch (e) {
      console.warn('Could not load wardrobe state from localStorage:', e)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Persist to localStorage whenever state changes after hydration
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY_GARMENTS, JSON.stringify(garments))
    } catch (e) {
      console.warn('Failed to save garments to localStorage:', e)
    }
  }, [garments, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY_OUTFITS, JSON.stringify(outfits))
    } catch (e) {
      console.warn('Failed to save outfits to localStorage:', e)
    }
  }, [outfits, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(collections))
    } catch (e) {
      console.warn('Failed to save collections to localStorage:', e)
    }
  }, [collections, isHydrated])

  // --- ACTIONS ---

  const toggleFavorite = useCallback((id: string) => {
    setGarments((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = { ...g, favorite: !g.favorite }
          if (selectedGarmentForDetail?.id === id) {
            setSelectedGarmentForDetail(updated)
          }
          return updated
        }
        return g
      })
    )
  }, [selectedGarmentForDetail])

  const toggleHide = useCallback((id: string) => {
    setGarments((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = { ...g, hidden: !g.hidden }
          if (selectedGarmentForDetail?.id === id) {
            setSelectedGarmentForDetail(updated)
          }
          return updated
        }
        return g
      })
    )
  }, [selectedGarmentForDetail])

  const updateGarment = useCallback((updated: Garment) => {
    setGarments((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
    // Synchronize inside outfits too
    setOutfits((prev) =>
      prev.map((outfit) => ({
        ...outfit,
        items: outfit.items.map((item) => (item.id === updated.id ? updated : item)),
      }))
    )
    if (selectedGarmentForDetail?.id === updated.id) {
      setSelectedGarmentForDetail(updated)
    }
  }, [selectedGarmentForDetail])

  const addGarments = useCallback((newGarments: Garment[]) => {
    setGarments((prev) => [...newGarments, ...prev])
    setSimulateEmptyWardrobe(false)
    setActiveTab('wardrobe')
  }, [])

  const deleteGarment = useCallback((id: string) => {
    setGarments((prev) => prev.filter((g) => g.id !== id))
    // Remove from outfits
    setOutfits((prev) =>
      prev.map((o) => ({
        ...o,
        items: o.items.filter((item) => item.id !== id),
      }))
    )
    // Remove from collections
    setCollections((prev) =>
      prev.map((c) => ({
        ...c,
        clothingItemIds: c.clothingItemIds.filter((itemId) => itemId !== id),
      }))
    )
    if (selectedGarmentForDetail?.id === id) {
      setSelectedGarmentForDetail(null)
      setDetailDialogOpen(false)
    }
  }, [selectedGarmentForDetail])

  const markGarmentWorn = useCallback((id: string) => {
    const today = new Date().toISOString().split('T')[0]
    setGarments((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = {
            ...g,
            wearCount: g.wearCount + 1,
            lastWorn: today,
          }
          if (selectedGarmentForDetail?.id === id) {
            setSelectedGarmentForDetail(updated)
          }
          return updated
        }
        return g
      })
    )
    // Also update inside outfits
    setOutfits((prev) =>
      prev.map((o) => ({
        ...o,
        items: o.items.map((item) =>
          item.id === id
            ? { ...item, wearCount: item.wearCount + 1, lastWorn: today }
            : item
        ),
      }))
    )
  }, [selectedGarmentForDetail])

  const saveOutfit = useCallback((outfit: Outfit) => {
    setOutfits((prev) => {
      const exists = prev.some((o) => o.id === outfit.id)
      if (exists) {
        return prev.map((o) => (o.id === outfit.id ? outfit : o))
      }
      return [outfit, ...prev]
    })
    setEditingOutfit(null)
  }, [])

  const deleteOutfit = useCallback((id: string) => {
    setOutfits((prev) => prev.filter((o) => o.id !== id))
    // Remove from collections
    setCollections((prev) =>
      prev.map((c) => ({
        ...c,
        outfitIds: c.outfitIds.filter((outfitId) => outfitId !== id),
      }))
    )
  }, [])

  const wearOutfit = useCallback((outfitId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const targetOutfit = outfits.find((o) => o.id === outfitId)

    if (targetOutfit) {
      const itemIds = new Set(targetOutfit.items.map((i) => i.id))

      // Increment wearCount for each garment in the outfit
      setGarments((prev) =>
        prev.map((g) =>
          itemIds.has(g.id)
            ? { ...g, wearCount: g.wearCount + 1, lastWorn: today }
            : g
        )
      )

      // Increment wearCount for the outfit itself
      setOutfits((prev) =>
        prev.map((o) =>
          o.id === outfitId
            ? {
                ...o,
                wearCount: o.wearCount + 1,
                lastWorn: today,
                items: o.items.map((i) => ({
                  ...i,
                  wearCount: i.wearCount + 1,
                  lastWorn: today,
                })),
              }
            : o
        )
      )
    }
  }, [outfits])

  const createCollection = useCallback((collectionData: Omit<Collection, 'id'>) => {
    const newCol: Collection = {
      ...collectionData,
      id: `col-${Date.now()}`,
    }
    setCollections((prev) => [newCol, ...prev])
    return newCol
  }, [])

  const updateCollection = useCallback((updated: Collection) => {
    setCollections((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }, [])

  const deleteCollection = useCallback((id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const addGarmentToCollection = useCallback((collectionId: string, garmentId: string) => {
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === collectionId && !c.clothingItemIds.includes(garmentId)) {
          return { ...c, clothingItemIds: [...c.clothingItemIds, garmentId] }
        }
        return c
      })
    )
  }, [])

  const removeGarmentFromCollection = useCallback((collectionId: string, garmentId: string) => {
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === collectionId) {
          return { ...c, clothingItemIds: c.clothingItemIds.filter((id) => id !== garmentId) }
        }
        return c
      })
    )
  }, [])

  const addOutfitToCollection = useCallback((collectionId: string, outfitId: string) => {
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === collectionId && !c.outfitIds.includes(outfitId)) {
          return { ...c, outfitIds: [...c.outfitIds, outfitId] }
        }
        return c
      })
    )
  }, [])

  const removeOutfitFromCollection = useCallback((collectionId: string, outfitId: string) => {
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === collectionId) {
          return { ...c, outfitIds: c.outfitIds.filter((id) => id !== outfitId) }
        }
        return c
      })
    )
  }, [])

  const openItemDetails = useCallback((garment: Garment) => {
    setSelectedGarmentForDetail(garment)
    setDetailDialogOpen(true)
  }, [])

  const startCreatingOutfit = useCallback((initialGarment?: Garment) => {
    setEditingOutfit(
      initialGarment
        ? {
            id: `outfit-${Date.now()}`,
            title: `Styling with ${initialGarment.name}`,
            occasion: initialGarment.occasion || 'Smart Casual',
            season: initialGarment.season || 'Autumn',
            items: [initialGarment],
            wearCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
            notes: `Look created around ${initialGarment.name}.`,
          }
        : null
    )
    setActiveTab('outfits')
  }, [])

  const startEditingOutfit = useCallback((outfit: Outfit) => {
    setEditingOutfit(outfit)
    setActiveTab('outfits')
  }, [])

  const resetToDefaults = useCallback(() => {
    setGarments(INITIAL_GARMENTS)
    setOutfits(INITIAL_OUTFITS)
    setCollections(INITIAL_COLLECTIONS)
    setSimulateEmptyWardrobe(false)
    setShowArchived(false)
    setEditingOutfit(null)
    try {
      localStorage.removeItem(STORAGE_KEY_GARMENTS)
      localStorage.removeItem(STORAGE_KEY_OUTFITS)
      localStorage.removeItem(STORAGE_KEY_COLLECTIONS)
    } catch (e) {
      console.warn('Failed to clear localStorage:', e)
    }
  }, [])

  return (
    <WardrobeContext.Provider
      value={{
        garments,
        outfits,
        collections,
        activeTab,
        setActiveTab,
        showArchived,
        setShowArchived,
        editingOutfit,
        setEditingOutfit,
        selectedGarmentForDetail,
        setSelectedGarmentForDetail,
        detailDialogOpen,
        setDetailDialogOpen,
        workflowOpen,
        setWorkflowOpen,
        workflowMode,
        setWorkflowMode,
        simulateEmptyWardrobe,
        setSimulateEmptyWardrobe,
        toggleFavorite,
        toggleHide,
        updateGarment,
        addGarments,
        deleteGarment,
        markGarmentWorn,
        saveOutfit,
        deleteOutfit,
        wearOutfit,
        createCollection,
        updateCollection,
        deleteCollection,
        addGarmentToCollection,
        removeGarmentFromCollection,
        addOutfitToCollection,
        removeOutfitFromCollection,
        openItemDetails,
        startCreatingOutfit,
        startEditingOutfit,
        resetToDefaults,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  )
}

export function useWardrobe() {
  const context = useContext(WardrobeContext)
  if (!context) {
    throw new Error('useWardrobe must be used within a WardrobeProvider')
  }
  return context
}
