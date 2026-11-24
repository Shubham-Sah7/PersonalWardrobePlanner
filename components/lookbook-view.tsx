'use client'

import React from 'react'
import { Outfit } from '@/types/wardrobe'
import { Button } from '@/components/ui/button'
import { Check, Plus } from 'lucide-react'

interface LookbookViewProps {
  outfits: Outfit[]
  onWearOutfit: (outfitId: string) => void
  onNavigateToStudio: () => void
}

export function LookbookView({
  outfits,
  onWearOutfit,
  onNavigateToStudio,
}: LookbookViewProps) {
  return (
    <div className="w-full bg-[#FAF9F6] text-[#181716] border border-[#E8E4DC] p-6 sm:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E4DC] gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#181716]">
            The Curated Lookbook
          </h2>
          <p className="text-xs text-[#6E6962] font-light mt-1">
            Pre-assembled editorial looks archived for effortless morning dressing.
          </p>
        </div>

        <Button
          onClick={onNavigateToStudio}
          size="sm"
          className="h-9 px-4 bg-[#181716] hover:bg-[#2D2B28] text-[#FAF9F6] text-xs font-medium uppercase tracking-wider rounded-none shadow-none gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Outfit</span>
        </Button>
      </div>

      {/* Grid of Outfits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
        {outfits.map((outfit) => {
          return (
            <div
              key={outfit.id}
              className="bg-white border border-[#E8E4DC] flex flex-col justify-between"
            >
              {/* Outfit Composite Grid */}
              <div className="p-4 bg-[#FAF9F6] border-b border-[#E8E4DC]">
                <div className="grid grid-cols-4 gap-2 aspect-[16/10] bg-white border border-[#E8E4DC] p-2">
                  {outfit.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="relative overflow-hidden bg-[#FAF9F6] border border-[#E8E4DC]"
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
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-[10px] font-sans uppercase tracking-widest text-[#96918A]">
                    <span>{outfit.occasion}</span>
                    <span>•</span>
                    <span>{outfit.season}</span>
                  </div>

                  <h3 className="text-xl font-serif font-normal text-[#181716] tracking-tight mb-2">
                    {outfit.title}
                  </h3>

                  {outfit.notes && (
                    <p className="text-xs font-serif italic text-[#6E6962] line-clamp-2 mb-4 leading-relaxed">
                      &ldquo;{outfit.notes}&rdquo;
                    </p>
                  )}

                  {/* Brand tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#F0ECE4]">
                    {outfit.items.map((i) => (
                      <span
                        key={i.id}
                        className="text-[10px] px-2 py-0.5 bg-[#FAF9F6] text-[#6E6962] border border-[#E8E4DC] tracking-wider uppercase"
                      >
                        {i.brand}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="pt-4 border-t border-[#E8E4DC] flex items-center justify-between">
                  <span className="text-xs text-[#6E6962] font-mono">
                    {outfit.wearCount} recorded wears
                  </span>

                  <Button
                    size="sm"
                    onClick={() => onWearOutfit(outfit.id)}
                    className="h-8 px-3 bg-white border border-[#E8E4DC] hover:border-[#181716] text-[#181716] text-xs font-medium uppercase tracking-wider rounded-none shadow-none gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Wore Today</span>
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
