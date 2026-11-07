import React, { useState } from "react";

export default function PieChart({ calculation, darkMode }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  if (!calculation) return null;

  const dailyBudget = calculation.dailyBudget || 0;
  const days = calculation.days || 1;
  const totalBudget = calculation.totalBudget || 0;

  const rawAllocations =
    Array.isArray(calculation.allocations) && calculation.allocations.length > 0
      ? calculation.allocations
      : ["makan"];
  const allocations = [...new Set(rawAllocations)];

  const amountPerCategory = Math.floor(dailyBudget / allocations.length);

  // Palet Warna Kontras per Kategori
  const categoryConfig = {
    makan: {
      label: "Makan",
      color: "#10B981",
      glow: "rgba(16, 185, 129, 0.6)",
    }, // Hijau Emerald
    perlengkapan: {
      label: "Perlengkapan",
      color: "#3B82F6",
      glow: "rgba(59, 130, 246, 0.6)",
    },
    main: { label: "Main", color: "#F59E0B", glow: "rgba(245, 158, 11, 0.6)" }, // Amber/Kuning
    jasa: { label: "Jasa", color: "#8B5CF6", glow: "rgba(139, 92, 246, 0.6)" }, // Ungu
  };

  const totalSegments = allocations.length;
  const size = 260;
  const center = size / 2;
  const radius = 95;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  // Pembagian porsi busur melingkar
  const segmentLength = circumference / totalSegments;
  const gap = totalSegments > 1 ? 6 : 0;
  const visibleLength = segmentLength - gap;

  return (
    <div
      className={`p-5 rounded-3xl border shadow-sm transition-all duration-300 ${
        darkMode
          ? "bg-slate-900 border-slate-800 text-slate-100"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div
        style={{ borderBottomColor: "#cbd5e1" }}
        className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800"
      >
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          SIMULASI ALOKASI
        </span>
        <span className="text-xs font-black text-emerald-500">
          Rp {Math.floor(totalBudget).toLocaleString("id-ID")} ({days} Hari)
        </span>
      </div>

      {/* RING CHART MULTI-WARNA */}
      <div className="relative w-full flex items-center justify-center my-3">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90 transition-all duration-300"
          >
            {allocations.map((catKey, index) => {
              const config = categoryConfig[catKey] || {
                label: catKey,
                color: "#10B981",
                glow: "rgba(16, 185, 129, 0.5)",
              };
              const isHovered = hoveredCategory === catKey;

              const dashArray = `${visibleLength} ${circumference - visibleLength}`;
              const dashOffset = -(index * segmentLength);

              return (
                <circle
                  key={`${catKey}-${index}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={config.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredCategory(catKey)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="cursor-pointer transition-all duration-300 origin-center"
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 0 12px ${config.glow})`
                      : "none",
                    opacity: hoveredCategory && !isHovered ? 0.35 : 1,
                  }}
                />
              );
            })}
          </svg>

          {/* TEKS DITINGGIKAN (CENTER INFO) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
            {hoveredCategory ? (
              <>
                <span className="text-lg md:text-xl font-black text-emerald-500 animate-fadeIn">
                  Rp {amountPerCategory.toLocaleString("id-ID")}
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mt-0.5">
                  {categoryConfig[hoveredCategory]?.label} / hari
                </span>
              </>
            ) : (
              <>
                <span className="text-lg md:text-xl font-black text-emerald-500">
                  Rp {Math.floor(dailyBudget).toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-slate-400 font-bold mt-0.5 max-w-[150px] leading-tight">
                  per hari
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
