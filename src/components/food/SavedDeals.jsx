import React from "react";
import FoodCard from "./FoodCard";

export default function SavedDeals({
  savedDeals,
  onClaim,
  onBookmark,
  darkMode,
  onBackToFeed,
  currentUser,
  onOpenLogin,
}) {
  return (
    <div
      className={` mt-6 p-6 rounded-3xl border shadow-sm max-w-4xl mx-auto transition-all ${
        darkMode
          ? "bg-slate-900 border-slate-800 text-slate-100"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      {/* Header Tab Favorit */}
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base md:text-lg font-black tracking-tight">
            Promo Favorit Tersimpan
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Daftar promo mitra UMKM yang kamu simpan untuk diklaim nanti.
          </p>
        </div>

        <button
          onClick={onBackToFeed}
          className={`text-xs font-extrabold px-3.5 py-2 rounded-xl border transition-all ${
            darkMode
              ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
              : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
          }`}
        >
          ← Kembali ke Feed
        </button>
      </div>

      {/* {!currentUser && savedDeals.length > 0 && (
        <div className={`mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs ${
          darkMode ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Daftar favorit ini tersimpan sementara di perangkat ini.</span>
          </div>
          <button
            onClick={onOpenLogin}
            className="font-black text-emerald-600 dark:text-emerald-400 hover:underline whitespace-nowrap"
          >
            Masuk Akun untuk Simpan Permanen →
          </button>
        </div>
      )} */}

      {/* Grid List Promo Tersimpan */}
      {savedDeals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {savedDeals.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onClaim={onClaim}
              onBookmark={onBookmark}
              isSaved={true}
              darkMode={darkMode}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
            Belum Ada Promo yang Disimpan
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Klik ikon bintang (☆) pada kartu promo di feed untuk menyimpannya di
            sini.
          </p>
          <button
            onClick={onBackToFeed}
            className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            Cari Promo Sekarang
          </button>
        </div>
      )}
    </div>
  );
}
