import React from "react";

export default function FoodCard({
  item,
  onClaim,
  onBookmark,
  isSaved,
  darkMode,
  distance,
}) {
  const originalPrice =
    item.originalPrice || Math.round((item.discountPrice * 1.25) / 1000) * 1000;

  return (
    <div
      onClick={() => onClaim(item)}
      className={`group rounded-3xl border overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer ${
        darkMode
          ? "bg-slate-900 border-slate-800 hover:border-emerald-500/50 text-slate-100"
          : "bg-white border-slate-200 hover:border-emerald-500/40 text-slate-800 shadow-sm"
      }`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            {item.isLateNight ? (
              <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/20 backdrop-blur-md">
                MIDNIGHT DEALS
              </span>
            ) : item.promoTag && item.promoTag !== "Reguler" ? (
              <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500 text-white shadow-md shadow-amber-500/20 backdrop-blur-md">
                {item.promoTag}
              </span>
            ) : null}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(item);
            }}
            className={`p-2 rounded-xl backdrop-blur-md transition-all active:scale-90 ${
              isSaved
                ? "bg-amber-500 text-white shadow-md"
                : "bg-slate-950/40 text-white hover:bg-slate-950/60"
            }`}
            title={isSaved ? "Hapus dari Simpanan" : "Simpan Promo"}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider leading-tight">
              {item.storeName}
            </span>

            <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">
              {distance !== null && distance !== undefined
                ? `${distance.toFixed(1)} km`
                : "Jarak tidak tersedia"}
            </span>
          </div>
          <div className="min-h-[2.75rem] flex items-center">
            <h3
              className={`font-extrabold text-base leading-snug group-hover:text-emerald-500 transition-colors duration-200 ${
                darkMode ? "text-slate-100" : "text-slate-900"
              }`}
            >
              {item.name}
            </h3>
          </div>
        </div>

        <div
          style={{ borderTopColor: "#cbd5e1" }}
          className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-0.5"
        >
          <div className="text-lg md:text-xl font-black text-emerald-500 leading-none">
            Rp {item.discountPrice.toLocaleString("id-ID")}
          </div>
          <div className="text-xs text-slate-400 font-bold line-through">
            Rp {originalPrice.toLocaleString("id-ID")}
          </div>
        </div>
      </div>
    </div>
  );
}
