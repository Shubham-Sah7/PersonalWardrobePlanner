'use client'

import React from 'react'
import { Garment } from '@/types/wardrobe'

interface WardrobeAnalyticsProps {
  garments: Garment[]
}

export function WardrobeAnalytics({ garments }: WardrobeAnalyticsProps) {
  const totalPieces = garments.length
  const totalValuation = garments.reduce((sum, g) => sum + g.price, 0)
  const totalWears = garments.reduce((sum, g) => sum + g.wearCount, 0)

  const activePieces = garments.filter((g) => g.wearCount >= 5).length
  const activeRotationPercent = totalPieces > 0 ? Math.round((activePieces / totalPieces) * 100) : 0

  const cpwLeaders = [...garments]
    .filter((g) => g.wearCount > 0)
    .sort((a, b) => a.price / a.wearCount - b.price / b.wearCount)
    .slice(0, 3)

  const underutilized = [...garments]
    .sort((a, b) => a.wearCount - b.wearCount)
    .slice(0, 3)

  return (
    <div className="w-full bg-[#FAF9F6] text-[#181716] border border-[#E8E4DC] p-6 sm:p-10 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E4DC]">
        <h2 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#181716]">
          Wardrobe Intelligence & Usage Metrics
        </h2>
        <p className="text-xs text-[#6E6962] font-light mt-1">
          Quantitative tracking of cost-per-wear utility, active rotation balance, and closet utilization.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white border border-[#E8E4DC]">
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block mb-2">
            Archived Pieces
          </span>
          <div className="text-3xl font-serif font-normal text-[#181716] mb-1">
            {totalPieces}
          </div>
          <span className="text-[11px] text-[#6E6962]">Current capsule size</span>
        </div>

        <div className="p-6 bg-white border border-[#E8E4DC]">
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block mb-2">
            Total Valuation
          </span>
          <div className="text-3xl font-serif font-normal text-[#181716] mb-1">
            ${totalValuation.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#6E6962]">Avg ${(totalValuation / totalPieces).toFixed(0)} per garment</span>
        </div>

        <div className="p-6 bg-white border border-[#E8E4DC]">
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block mb-2">
            Active Rotation
          </span>
          <div className="text-3xl font-serif font-normal text-[#181716] mb-1">
            {activeRotationPercent}%
          </div>
          <span className="text-[11px] text-[#6E6962]">Worn $\ge$ 5 times</span>
        </div>

        <div className="p-6 bg-white border border-[#E8E4DC]">
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#96918A] block mb-2">
            Total Wears Logged
          </span>
          <div className="text-3xl font-serif font-normal text-[#181716] mb-1">
            {totalWears}
          </div>
          <span className="text-[11px] text-[#6E6962]">Across entire collection</span>
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CPW Leaders */}
        <div className="p-6 bg-white border border-[#E8E4DC] space-y-4">
          <div>
            <h3 className="text-lg font-serif font-normal text-[#181716]">
              Highest Utility Investments (Lowest CPW)
            </h3>
            <p className="text-xs text-[#6E6962] font-light mt-0.5">
              Garments delivering the strongest cost-per-wear return.
            </p>
          </div>

          <div className="space-y-3 pt-3">
            {cpwLeaders.map((item) => {
              const cpw = (item.price / Math.max(1, item.wearCount)).toFixed(2)
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#E8E4DC]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageFront}
                      alt={item.name}
                      className="w-10 h-12 object-cover"
                    />
                    <div>
                      <div className="text-xs font-serif text-[#181716] truncate max-w-[200px]">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[#6E6962] font-mono">
                        {item.brand} • {item.wearCount} wears
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-serif font-normal text-[#181716]">
                      ${cpw} / wear
                    </div>
                    <div className="text-[10px] text-[#96918A] font-mono">Original ${item.price}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Underutilized Pieces */}
        <div className="p-6 bg-white border border-[#E8E4DC] space-y-4">
          <div>
            <h3 className="text-lg font-serif font-normal text-[#181716]">
              Underutilized Archive Items
            </h3>
            <p className="text-xs text-[#6E6962] font-light mt-0.5">
              Garments with low wear frequency. Consider styling in upcoming looks or evaluating for resale.
            </p>
          </div>

          <div className="space-y-3 pt-3">
            {underutilized.map((item) => {
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#E8E4DC]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageFront}
                      alt={item.name}
                      className="w-10 h-12 object-cover"
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
                    <span className="text-[10px] font-mono text-[#6E6962] px-2 py-0.5 bg-white border border-[#E8E4DC]">
                      {item.wearCount} wears
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
