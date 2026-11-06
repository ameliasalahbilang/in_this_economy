import React from 'react';

export default function ClaimHistory({ historyList, currentUser, darkMode, onBackToFeed, onClaimAgain }) {
  const isUMKM = currentUser?.role === 'umkm';

  // Hitung Total Penghematan untuk Mahasiswa
  const totalSavedMoney = historyList.reduce((acc, item) => {
    const savedPerItem = (item.originalPrice || item.discountPrice) - item.discountPrice;
    return acc + (savedPerItem > 0 ? savedPerItem : 0);
  }, 0);

  return (
    <div className={`p-6 rounded-3xl border shadow-sm max-w-4xl mx-auto transition-all ${
      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      {/* Header Riwayat */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base md:text-lg font-black tracking-tight flex items-center gap-2">
            <span>{isUMKM ? 'Dashboard & Riwayat Promo Toko' : 'Riwayat Klaim Promo Kamu'}</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {isUMKM 
              ? 'Daftar promo yang diterbitkan dan performa klaim dari pengguna.' 
              : 'Daftar promo mitra yang pernah kamu hubungi via WhatsApp atau Google Maps.'}
          </p>
        </div>

        <button
          onClick={onBackToFeed}
          className={`text-xs font-extrabold px-3.5 py-2 rounded-xl border transition-all ${
            darkMode 
              ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ← Kembali ke Feed
        </button>
      </div>

      {/* Banner Summary (Gamification Penghematan Mahasiswa) */}
      {!isUMKM && historyList.length > 0 && (
        <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 ${
          darkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white font-black">
              <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Total Estimasi Penghematan
              </span>
              <span className="text-base font-black">
                Rp {totalSavedMoney.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <span className="text-xs font-extrabold bg-emerald-600 text-white px-3 py-1 rounded-xl">
            {historyList.length} Promo Diklaim
          </span>
        </div>
      )}

      {/* List Riwayat Items */}
      {historyList.length > 0 ? (
        <div className="space-y-3">
          {historyList.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                darkMode ? 'bg-slate-800/50 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700" 
                />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    {item.storeName}
                  </span>
                  <h4 className="font-extrabold text-xs md:text-sm text-slate-800 dark:text-slate-100 line-clamp-1">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                      Rp {item.discountPrice.toLocaleString('id-ID')}
                    </span>
                    {item.claimedAt && (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        • {item.claimedAt}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => onClaimAgain(item)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
                >
                  Hubungi Lagi
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
            Belum Ada Riwayat Klaim
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {isUMKM 
              ? 'Belum ada promo yang berhasil diklaim pelanggan.' 
              : 'Klik "Ambil / Detail Promo" dan hubungi mitra via WA / GMaps untuk mencatat riwayat kehematanmu.'}
          </p>
          <button
            onClick={onBackToFeed}
            className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            Jelajahi Promo
          </button>
        </div>
      )}

    </div>
  );
}