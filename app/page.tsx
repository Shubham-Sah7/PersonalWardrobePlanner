'use client'

import React from 'react'
import { WardrobeProvider, useWardrobe } from '@/context/wardrobe-context'
import { ProductRailGallery } from '@/components/product-rail-gallery'
import { OutfitsSection } from '@/components/outfits-section'
import { CollectionsView } from '@/components/collections-view'
import { InsightsView } from '@/components/insights-view'
import { AddClothesWorkflow } from '@/components/add-clothes-workflow'
import { GarmentDetailDialog } from '@/components/garment-detail-dialog'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Shirt,
  Layers,
  Bookmark,
  BarChart3,
  CloudSun,
  RotateCcw,
} from 'lucide-react'

function WardrobeAppContent() {
  const {
    garments,
    outfits,
    collections,
    activeTab,
    setActiveTab,
    showArchived,
    setShowArchived,
    editingOutfit,
    selectedGarmentForDetail,
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
  } = useWardrobe()

  // Support URL query navigation (?tab=outfits, ?tab=collections, etc.)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab === 'outfits' || tab === 'collections' || tab === 'insights' || tab === 'wardrobe') {
        setActiveTab(tab)
      }
      const view = params.get('view')
      if (view === 'upload') {
        setWorkflowMode('upload')
        setWorkflowOpen(true)
      } else if (view === 'review') {
        setWorkflowMode('review')
        setWorkflowOpen(true)
      } else if (view === 'ambiguous') {
        setWorkflowMode('ambiguous_state')
        setWorkflowOpen(true)
      }
    }
  }, [setActiveTab, setWorkflowMode, setWorkflowOpen])

  const visibleGarments = simulateEmptyWardrobe
    ? []
    : showArchived
      ? garments
      : garments.filter((g) => !g.hidden)

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#181716] flex flex-col font-sans selection:bg-[#EAE6DF] pb-28 lg:pb-0 overflow-x-hidden w-full max-w-full">
      {/* ── SCREEN EVALUATION JUMP BAR (For Assessor / Reviewer) ── */}
      <div className="bg-[#181716] text-[#FAF9F6] px-3 py-1.5 text-[11px] font-sans overflow-x-auto scrollbar-none w-full max-w-full touch-pan-x">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 min-w-max">
          <span className="font-mono text-[#96918A] uppercase tracking-wider shrink-0">
            Evaluation Tour:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setSimulateEmptyWardrobe(false)
                setActiveTab('wardrobe')
              }}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                activeTab === 'wardrobe' && !simulateEmptyWardrobe && !workflowOpen && !detailDialogOpen
                  ? 'bg-neutral-800 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              1. Wardrobe
            </button>

            <button
              onClick={() => {
                setWorkflowMode('upload')
                setWorkflowOpen(true)
              }}
              className="px-2 py-0.5 text-neutral-400 hover:text-white text-[11px] rounded transition-colors"
            >
              2. Add Clothes
            </button>

            <button
              onClick={() => {
                setWorkflowMode('review')
                setWorkflowOpen(true)
              }}
              className="px-2 py-0.5 text-neutral-400 hover:text-white text-[11px] rounded transition-colors"
            >
              3. Review Details
            </button>

            <button
              onClick={() => garments[0] && openItemDetails(garments[0])}
              className="px-2 py-0.5 text-neutral-400 hover:text-white text-[11px] rounded transition-colors"
            >
              4. Item Details
            </button>

            <button
              onClick={() => {
                startCreatingOutfit()
              }}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                activeTab === 'outfits'
                  ? 'bg-neutral-800 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              5. Outfit Creator
            </button>

            <button
              onClick={() => setActiveTab('collections')}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                activeTab === 'collections'
                  ? 'bg-neutral-800 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              6. Collections
            </button>

            <button
              onClick={() => {
                setWorkflowMode('ambiguous_state')
                setWorkflowOpen(true)
              }}
              className="px-2 py-0.5 text-neutral-400 hover:text-white text-[11px] rounded transition-colors"
            >
              7A. Flagged Details
            </button>

            <button
              onClick={() => {
                setSimulateEmptyWardrobe(!simulateEmptyWardrobe)
                setActiveTab('wardrobe')
              }}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                simulateEmptyWardrobe
                  ? 'bg-amber-900/60 text-amber-200 font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              7B. Empty State: {simulateEmptyWardrobe ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={resetToDefaults}
              className="px-2 py-0.5 text-neutral-400 hover:text-red-300 text-[11px] rounded transition-colors ml-2 flex items-center gap-1"
              title="Reset all items, outfits & collections back to demo defaults"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── TOP EDITORIAL MASTHEAD & NAVIGATION ── */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E8E4DC] bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-10 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand Wordmark */}
          <div
            onClick={() => setActiveTab('wardrobe')}
            className="flex items-baseline gap-2 sm:gap-3 cursor-pointer select-none shrink-0"
          >
            <span className="font-serif text-2xl tracking-tight text-[#181716]">
              Atelier
            </span>
            <span className="text-[10px] font-sans tracking-[0.16em] uppercase text-[#6E6962] hidden xs:inline">
              Personal Wardrobe
            </span>
          </div>

          {/* Desktop Primary Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => {
                setSimulateEmptyWardrobe(false)
                setActiveTab('wardrobe')
              }}
              className={`px-3.5 py-1.5 text-xs font-sans tracking-wide uppercase transition-colors ${
                activeTab === 'wardrobe'
                  ? 'text-[#181716] font-semibold border-b border-[#181716]'
                  : 'text-[#6E6962] hover:text-[#181716]'
              }`}
            >
              Wardrobe ({garments.length})
            </button>

            <button
              onClick={() => setActiveTab('outfits')}
              className={`px-3.5 py-1.5 text-xs font-sans tracking-wide uppercase transition-colors ${
                activeTab === 'outfits'
                  ? 'text-[#181716] font-semibold border-b border-[#181716]'
                  : 'text-[#6E6962] hover:text-[#181716]'
              }`}
            >
              Outfits ({outfits.length})
            </button>

            <button
              onClick={() => setActiveTab('collections')}
              className={`px-3.5 py-1.5 text-xs font-sans tracking-wide uppercase transition-colors ${
                activeTab === 'collections'
                  ? 'text-[#181716] font-semibold border-b border-[#181716]'
                  : 'text-[#6E6962] hover:text-[#181716]'
              }`}
            >
              Collections ({collections.length})
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3.5 py-1.5 text-xs font-sans tracking-wide uppercase transition-colors ${
                activeTab === 'insights'
                  ? 'text-[#181716] font-semibold border-b border-[#181716]'
                  : 'text-[#6E6962] hover:text-[#181716]'
              }`}
            >
              Insights
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#6E6962] font-mono">
              <CloudSun className="w-3.5 h-3.5" />
              <span>16°C Paris</span>
            </div>

            <Button
              onClick={() => {
                setWorkflowMode('upload')
                setWorkflowOpen(true)
              }}
              size="sm"
              className="h-9 sm:h-8 px-2.5 sm:px-3 bg-[#181716] hover:bg-[#2D2B28] active:bg-[#333] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider rounded-md shadow-none gap-1 sm:gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Add Clothes</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-10 py-5 sm:py-8">
        {/* DOMAIN 1: WARDROBE HOME (THE HANGING RAIL & GRID) */}
        {activeTab === 'wardrobe' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-2 sm:pb-3">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-[#96918A] block mb-1">
                  Wardrobe Archive
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#181716] tracking-tight">
                  My Clothes
                </h2>
              </div>

              <div className="text-xs text-[#6E6962] font-mono flex items-center gap-3">
                <span>{visibleGarments.length} Pieces</span>
                {showArchived && (
                  <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Showing Archived
                  </span>
                )}
              </div>
            </div>

            <ProductRailGallery
              garments={visibleGarments}
              onToggleFavorite={toggleFavorite}
              onAddClothes={() => {
                setWorkflowMode('upload')
                setWorkflowOpen(true)
              }}
              onAddToOutfit={(g) => startCreatingOutfit(g)}
              onMarkWorn={markGarmentWorn}
              onOpenDetails={openItemDetails}
              onToggleHide={toggleHide}
              showArchived={showArchived}
              onToggleShowArchived={() => setShowArchived(!showArchived)}
            />
          </div>
        )}

        {/* DOMAIN 2: OUTFITS (ALL LOOKS + OUTFIT CREATOR CANVAS) */}
        {activeTab === 'outfits' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-2 sm:pb-3">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-[#96918A] block mb-1">
                  Outfits
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#181716] tracking-tight">
                  Saved Looks
                </h2>
              </div>

              <div className="text-xs text-[#6E6962] font-mono">
                <span>{outfits.length} Outfits</span>
              </div>
            </div>

            <OutfitsSection
              outfits={outfits}
              garments={garments}
              onSaveOutfit={saveOutfit}
              onWearOutfit={wearOutfit}
              onMarkGarmentWorn={markGarmentWorn}
              onDeleteOutfit={deleteOutfit}
              editingOutfit={editingOutfit}
              onStartEditingOutfit={startEditingOutfit}
            />
          </div>
        )}

        {/* DOMAIN 3: COLLECTIONS & CAPSULES */}
        {activeTab === 'collections' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-2 sm:pb-3">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-[#96918A] block mb-1">
                  Capsules & Trips
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#181716] tracking-tight">
                  Collections
                </h2>
              </div>

              <div className="text-xs text-[#6E6962] font-mono">
                <span>{collections.length} Capsules</span>
              </div>
            </div>

            <CollectionsView
              collections={collections}
              garments={garments}
              outfits={outfits}
              onWearOutfit={wearOutfit}
              onSelectGarment={openItemDetails}
              onCreateCollection={createCollection}
              onUpdateCollection={updateCollection}
              onDeleteCollection={deleteCollection}
              onAddGarmentToCollection={addGarmentToCollection}
              onRemoveGarmentFromCollection={removeGarmentFromCollection}
              onAddOutfitToCollection={addOutfitToCollection}
              onRemoveOutfitFromCollection={removeOutfitFromCollection}
            />
          </div>
        )}

        {/* DOMAIN 4: INSIGHTS & ROTATION ANALYTICS */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-2 sm:pb-3">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-[#96918A] block mb-1">
                  Usage Analytics
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#181716] tracking-tight">
                  Wardrobe Insights
                </h2>
              </div>
            </div>

            <InsightsView garments={garments} outfits={outfits} />
          </div>
        )}
      </main>

      {/* ── SCREEN 2, 3 & 7A: ADD CLOTHES WORKFLOW MODAL ── */}
      <AddClothesWorkflow
        open={workflowOpen}
        onOpenChange={setWorkflowOpen}
        onAddGarments={addGarments}
        initialMode={workflowMode}
      />

      {/* ── SCREEN 4: DEDICATED CLOTHING ITEM DETAILS DIALOG ── */}
      <GarmentDetailDialog
        garment={selectedGarmentForDetail}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        outfits={outfits}
        onToggleFavorite={toggleFavorite}
        onAddToOutfit={(g) => {
          startCreatingOutfit(g)
          setDetailDialogOpen(false)
        }}
        onMarkWorn={markGarmentWorn}
        onUpdateGarment={updateGarment}
        onToggleHide={toggleHide}
        onDeleteGarment={deleteGarment}
      />

      {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#FAF9F6] border-t border-[#E8E4DC] px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around"
      >
        <button
          onClick={() => {
            setSimulateEmptyWardrobe(false)
            setActiveTab('wardrobe')
          }}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 min-w-[64px] min-h-[48px] text-[10px] uppercase font-sans tracking-wider transition-colors active:opacity-70 ${
            activeTab === 'wardrobe'
              ? 'text-[#181716] font-semibold'
              : 'text-[#96918A] hover:text-[#181716]'
          }`}
        >
          <Shirt className="w-4 h-4" />
          <span>Wardrobe</span>
          {activeTab === 'wardrobe' && (
            <span className="w-1 h-1 rounded-full bg-[#181716] -mt-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('outfits')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 min-w-[64px] min-h-[48px] text-[10px] uppercase font-sans tracking-wider transition-colors active:opacity-70 ${
            activeTab === 'outfits'
              ? 'text-[#181716] font-semibold'
              : 'text-[#96918A] hover:text-[#181716]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Outfits</span>
          {activeTab === 'outfits' && (
            <span className="w-1 h-1 rounded-full bg-[#181716] -mt-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 min-w-[64px] min-h-[48px] text-[10px] uppercase font-sans tracking-wider transition-colors active:opacity-70 ${
            activeTab === 'collections'
              ? 'text-[#181716] font-semibold'
              : 'text-[#96918A] hover:text-[#181716]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Capsules</span>
          {activeTab === 'collections' && (
            <span className="w-1 h-1 rounded-full bg-[#181716] -mt-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 min-w-[64px] min-h-[48px] text-[10px] uppercase font-sans tracking-wider transition-colors active:opacity-70 ${
            activeTab === 'insights'
              ? 'text-[#181716] font-semibold'
              : 'text-[#96918A] hover:text-[#181716]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Insights</span>
          {activeTab === 'insights' && (
            <span className="w-1 h-1 rounded-full bg-[#181716] -mt-0.5" />
          )}
        </button>
      </nav>

      {/* ── FOOTER ── */}
      <footer className="bg-[#FAF9F6] py-14 mt-auto text-xs text-[#96918A]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-sm tracking-tight text-[#181716]">
            Atelier
          </span>
          <div className="flex items-center gap-4 text-xs font-light">
            <span>Personal wardrobe & styling archive. Locally persisted.</span>
            <span>•</span>
            <button
              onClick={resetToDefaults}
              className="text-[#6E6962] hover:text-[#181716] underline"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function PersonalWardrobeApp() {
  return (
    <WardrobeProvider>
      <WardrobeAppContent />
    </WardrobeProvider>
  )
}
