'use client'

import React from 'react'
import { Garment, Outfit } from '@/types/wardrobe'

interface InsightsViewProps {
  garments: Garment[]
  outfits: Outfit[]
}

export function InsightsView({ garments, outfits }: InsightsViewProps) {
  const totalPieces = garments.length
  const totalWears = garments.reduce((sum, g) => sum + g.wearCount, 0)

  // Most worn garments (Top 4)
  const mostWorn = [...garments].sort((a, b) => b.wearCount - a.wearCount).slice(0, 4)

  // Least worn garments (Bottom 4)
  const leastWorn = [...garments].sort((a, b) => a.wearCount - b.wearCount).slice(0, 4)

  // Active rotation percentage (worn >= 5 times)
  const activeCount = garments.filter((g) => g.wearCount >= 5).length
  const rotationRate = totalPieces > 0 ? Math.round((activeCount / totalPieces) * 100) : 0

  // Category usage breakdown
  const categoryStats = [
    'Tops',
    'Bottoms',
    'Jackets & Outerwear',
    'Shoes',
    'Accessories',
  ].map((cat) => {
    const items = garments.filter((g) => g.category === cat)
    const wears = items.reduce((sum, i) => sum + i.wearCount, 0)
    return {
      category: cat,
      count: items.length,
      wears,
      avgWears: items.length > 0 ? (wears / items.length).toFixed(1) : '0',
    }
  })

  // Top outfit combinations
  const topOutfits = [...outfits].sort((a, b) => b.wearCount - a.wearCount).slice(0, 3)

  return (
    <div className="w-full bg-[#FAF9F6] text-[#181716] p-0 sm:p-2 space-y-6 sm:space-y-10">
      {/* ── Header ── */}
      <div className="pb-4 sm:pb-6">
        <h2 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#181716]">
          Wardrobe Insights
        </h2>
        <p className="text-xs text-[#6E6962] font-light mt-1">
          Simple, actionable metrics tracking clothing utility, active rotation, and repeatable combinations.
        </p>
      </div>

      {/* ── Key Indicators ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="p-4 sm:p-6 bg-white rounded-md">
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block mb-1 sm:mb-2">
            Wardrobe Size
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-normal text-[#181716] mb-1">
            {totalPieces} Pieces
          </div>
          <span className="text-[10px] sm:text-[11px] text-[#6E6962]">Total catalogued items</span>
        </div>

        <div className="p-4 sm:p-6 bg-white rounded-md">
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block mb-1 sm:mb-2">
            Rotation Rate
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-normal text-[#181716] mb-1">
            {rotationRate}%
          </div>
          <span className="text-[10px] sm:text-[11px] text-[#6E6962]">Worn 5 or more times</span>
        </div>

        <div className="p-4 sm:p-6 bg-white rounded-md">
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block mb-1 sm:mb-2">
            Total Wears
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-normal text-[#181716] mb-1">
            {totalWears} Wears
          </div>
          <span className="text-[10px] sm:text-[11px] text-[#6E6962]">Logged across all pieces</span>
        </div>

        <div className="p-4 sm:p-6 bg-white rounded-md">
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block mb-1 sm:mb-2">
            Saved Outfits
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-normal text-[#181716] mb-1">
            {outfits.length} Outfits
          </div>
          <span className="text-[10px] sm:text-[11px] text-[#6E6962]">Ready-to-wear looks</span>
        </div>
      </div>

      {/* ── Dual Lists: Most Worn vs. Least Worn ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Worn */}
        <div className="p-6 bg-white space-y-4 rounded-md">
          <div>
            <h3 className="text-lg font-serif font-normal text-[#181716]">
              Most Worn Pieces
            </h3>
            <p className="text-xs text-[#6E6962] font-light mt-0.5">
              Your highest-rotation daily staples.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {mostWorn.map((item) => {
              const cpw = (item.price / Math.max(1, item.wearCount)).toFixed(2)
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageFront}
                      alt={item.name}
                      className="w-10 h-12 object-cover rounded"
                    />
                    <div>
                      <div className="text-xs font-serif text-[#181716] truncate max-w-[200px]">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[#6E6962] font-mono">
                        {item.brand} • {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-serif text-[#181716]">
                      {item.wearCount} wears
                    </div>
                    <div className="text-[10px] text-[#96918A] font-mono">${cpw} / wear</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Least Worn */}
        <div className="p-6 bg-white space-y-4 rounded-md">
          <div>
            <h3 className="text-lg font-serif font-normal text-[#181716]">
              Least Worn Pieces
            </h3>
            <p className="text-xs text-[#6E6962] font-light mt-0.5">
              Garments that could be styled into new outfits or archived.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {leastWorn.map((item) => {
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageFront}
                      alt={item.name}
                      className="w-10 h-12 object-cover rounded"
                    />
                    <div>
                      <div className="text-xs font-serif text-[#181716] truncate max-w-[200px]">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[#6E6962] font-mono">
                        {item.brand} • {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#6E6962] px-2 py-0.5 bg-white rounded">
                      {item.wearCount} wears
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Category Usage Breakdown & Top Outfit Combinations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        {/* Category Breakdown Table */}
        <div className="p-6 bg-white space-y-4 rounded-md">
          <div>
            <h3 className="text-lg font-serif font-normal text-[#181716]">
              Category Breakdown
            </h3>
            <p className="text-xs text-[#6E6962] font-light mt-0.5">
              Wear distribution and piece count across wardrobe categories.
            </p>
          </div>

          <div className="text-xs rounded-md overflow-hidden">
            <div className="grid grid-cols-12 p-2.5 bg-[#FAF9F6] text-[10px] font-sans uppercase tracking-wider text-[#96918A]">
              <span className="col-span-5">Category</span>
              <span className="col-span-2 text-right">Items</span>
              <span className="col-span-2 text-right">Wears</span>
              <span className="col-span-3 text-right">Avg / Piece</span>
            </div>
            {categoryStats.map((c) => (
              <div
                key={c.category}
                className="grid grid-cols-12 p-2.5 text-[#181716] hover:bg-[#FAF9F6]/50 transition-colors"
              >
                <span className="col-span-5 font-serif">{c.category}</span>
                <span className="col-span-2 text-right font-mono text-[#6E6962]">{c.count}</span>
                <span className="col-span-2 text-right font-mono text-[#6E6962]">{c.wears}</span>
                <span className="col-span-3 text-right font-mono text-[#181716] font-medium">
                  {c.avgWears}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Outfit Combinations */}
        <div className="p-6 bg-white space-y-4 rounded-md">
          <div>
            <h3 className="text-lg font-serif font-normal text-[#181716]">
              Signature Outfit Combinations
            </h3>
            <p className="text-xs text-[#6E6962] font-light mt-0.5">
              Your most repeated and reliable multi-piece looks.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {topOutfits.map((outfit) => (
              <div
                key={outfit.id}
                className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-md"
              >
                <div>
                  <h4 className="text-xs font-serif text-[#181716] mb-0.5">
                    {outfit.title}
                  </h4>
                  <div className="text-[10px] text-[#6E6962]">
                    {outfit.items.length} pieces • {outfit.occasion}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-[#181716] font-medium">
                    {outfit.wearCount} wears
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
