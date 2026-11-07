import React, { useState } from "react";

export default function AdminDashboard({
  foods = [],
  merchants = [],
  onToggleMerchantStatus,
  onToggleProductStatus,
  darkMode,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState("merchants");
  const [productFilter, setProductFilter] = useState("all");

  // State Pagination (5 Item Per Halaman)
  const [merchantPage, setMerchantPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // State Modal Konfirmasi In-App
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    actionType: null,
    targetId: null,
  });
  const [confirmActionError, setConfirmActionError] = useState("");

  const triggerMerchantStatusToggle = (merchant) => {
    const isCurrentlyActive = merchant.isActive !== false;
    setConfirmActionError("");
    setConfirmModal({
      isOpen: true,
      title: isCurrentlyActive
        ? "Nonaktifkan Mitra UMKM?"
        : "Aktifkan Kembali Mitra?",
      message: isCurrentlyActive
        ? `Apakah kamu yakin ingin me-nonaktifkan "${merchant.name}"? Seluruh produk toko ini akan disembunyikan dari katalog mahasiswa secara real-time.`
        : `Aktifkan kembali "${merchant.name}" agar promonya tayang kembali di feed mahasiswa.`,
      actionType: "toggle_merchant",
      targetId: merchant.id,
    });
  };

  const triggerProductStatusToggle = (product) => {
    const isCurrentlyActive = product.isActive !== false;
    setConfirmActionError("");
    setConfirmModal({
      isOpen: true,
      title: isCurrentlyActive
        ? "Nonaktifkan Produk?"
        : "Aktifkan Kembali Produk?",
      message: isCurrentlyActive
        ? `Apakah kamu yakin ingin me-nonaktifkan "${product.name}" dari toko "${product.storeName}"? Produk ini akan disembunyikan dari katalog mahasiswa.`
        : `Aktifkan kembali "${product.name}" agar muncul kembali di katalog mahasiswa.`,
      actionType: "toggle_product",
      targetId: product.id,
    });
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmModal.actionType === "toggle_merchant") {
        if (onToggleMerchantStatus)
          await onToggleMerchantStatus(confirmModal.targetId);
      } else if (confirmModal.actionType === "toggle_product") {
        if (onToggleProductStatus)
          await onToggleProductStatus(confirmModal.targetId);
      }
    } catch (error) {
      console.error("Gagal memperbarui status:", error);
      setConfirmActionError(
        error.message || "Gagal memperbarui status. Silakan coba lagi.",
      );
      return;
    }
    setConfirmActionError("");
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      actionType: null,
      targetId: null,
    });
  };

  // Filter & Pagination Produk
  const filteredProducts = foods.filter((item) => {
    if (productFilter === "latenight") return item.isLateNight;
    if (productFilter === "promo")
      return item.promoTag && item.promoTag !== "Reguler";
    if (productFilter === "regular")
      return (
        !item.isLateNight && (!item.promoTag || item.promoTag === "Reguler")
      );
    return true;
  });

  const totalMerchantPages = Math.ceil(merchants.length / ITEMS_PER_PAGE) || 1;
  const paginatedMerchants = merchants.slice(
    (merchantPage - 1) * ITEMS_PER_PAGE,
    merchantPage * ITEMS_PER_PAGE,
  );

  const totalProductPages =
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * ITEMS_PER_PAGE,
    productPage * ITEMS_PER_PAGE,
  );

  // Summary Metrics
  const totalMerchantsCount = merchants.length;
  const totalProductsCount = foods.length;
  const totalPromoCount = foods.filter(
    (f) => f.promoTag && f.promoTag !== "Reguler",
  ).length;
  const totalMidnightCount = foods.filter((f) => f.isLateNight).length;

  return (
    <div
      className={`w-full min-h-screen max-w-full flex flex-col md:flex-row transition-colors ${
        darkMode
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-100/70 text-slate-800"
      }`}
    >
      {/* SIDEBAR SUPER ADMIN */}
      <aside
        className={`w-full md:w-64 shrink-0 p-4 md:p-5 border-b md:border-b-0 md:border-r flex flex-col justify-between transition-colors self-stretch md:min-h-[calc(100vh-80px)] ${
          darkMode
            ? "bg-slate-900/90 border-slate-800"
            : "bg-white border-slate-200/80 shadow-sm"
        }`}
      >
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between md:block">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 inline-block">
                SUPER ADMIN PANEL
              </span>
              <h2
                className={`text-base font-black tracking-tight truncate mt-1 ${darkMode ? "text-slate-100" : "text-slate-900"}`}
              >
                Moderasi Sistem
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate hidden md:block">
                In This Economy Platform
              </p>
            </div>

            <button
              onClick={onLogout || (() => {})}
              className="md:hidden text-xs font-bold px-3 py-1.5 rounded-lg text-rose-600 bg-rose-500/10 border border-rose-500/20 active:scale-95 transition-all"
            >
              Keluar
            </button>
          </div>

          <nav className="flex md:flex-col gap-1.5 overflow-x-auto no-scrollbar md:overflow-visible pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab("merchants")}
              className={`shrink-0 md:w-full text-xs font-extrabold px-3.5 py-3 rounded-2xl transition-all flex items-center justify-between gap-3 ${
                activeTab === "merchants"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                  : darkMode
                    ? "text-slate-400 hover:bg-slate-800/60"
                    : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg
                  className="w-4 h-4 stroke-current shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Data Mitra UMKM</span>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition-colors ${
                  activeTab === "merchants"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {merchants.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`shrink-0 md:w-full text-xs font-extrabold px-3.5 py-3 rounded-2xl transition-all flex items-center justify-between gap-3 ${
                activeTab === "products"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                  : darkMode
                    ? "text-slate-400 hover:bg-slate-800/60"
                    : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg
                  className="w-4 h-4 stroke-current shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <span>Data Produk</span>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition-colors ${
                  activeTab === "products"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {foods.length}
              </span>
            </button>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="min-w-0 max-w-full flex-1 w-full p-4 md:p-8 space-y-6">
        {/* SUMMARY METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div
            className={`p-4 md:p-5 rounded-3xl border transition-all ${darkMode ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total Mitra
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {totalMerchantsCount}
              </span>
              <span className="text-xs font-bold text-slate-400">Toko</span>
            </div>
          </div>

          <div
            className={`p-4 md:p-5 rounded-3xl border transition-all ${darkMode ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total Produk
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {totalProductsCount}
              </span>
              <span className="text-xs font-bold text-slate-400">Item</span>
            </div>
          </div>

          <div
            className={`p-4 md:p-5 rounded-3xl border transition-all ${darkMode ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Promo Diskon
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-black text-amber-500">
                {totalPromoCount}
              </span>
              <span className="text-xs font-bold text-slate-400">Aktif</span>
            </div>
          </div>

          <div
            className={`p-4 md:p-5 rounded-3xl border transition-all ${darkMode ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Midnight Deals
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {totalMidnightCount}
              </span>
              <span className="text-xs font-bold text-slate-400">Deals</span>
            </div>
          </div>
        </div>

        {/* TAB 1: TABEL MITRA UMKM */}
        {activeTab === "merchants" && (
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3
                className={`text-base md:text-lg font-black tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}
              >
                Tabel Mitra UMKM
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Pengawasan data registrasi toko dan verifikasi titik lokasi
                Google Maps.
              </p>
            </div>

            {merchants.length > 0 ? (
              <div
                className={`max-w-full overflow-hidden rounded-3xl border shadow-sm ${darkMode ? "border-slate-800 bg-slate-900/60" : "border-slate-200/90 bg-white"}`}
              >
                <div className="max-w-full overflow-x-auto md:overflow-y-auto md:max-h-[calc(100vh-200px)] scrollbar-thin">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead
                      className={`font-black uppercase text-[10px] tracking-wider border-b ${darkMode ? "bg-slate-900/80 border-slate-800 text-slate-400" : "bg-slate-50/90 border-slate-200 text-slate-700"}`}
                    >
                      <tr>
                        <th className="p-4 w-12 text-center">No</th>
                        <th className="p-4">Nama Toko / Pemilik</th>
                        <th className="p-4">Kontak WhatsApp</th>
                        <th className="p-4">Lokasi Google Maps</th>
                        <th className="p-4">Kategori Usaha</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Aksi Moderasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                      {paginatedMerchants.map((m, idx) => {
                        const isMerchantActive = m.isActive !== false;
                        const globalIndex =
                          (merchantPage - 1) * ITEMS_PER_PAGE + idx + 1;

                        return (
                          <tr
                            key={m.id}
                            className={`transition-colors ${darkMode ? "hover:bg-slate-900/80" : "hover:bg-slate-50/80"}`}
                          >
                            <td className="p-4 text-center font-bold text-slate-400 dark:text-slate-500">
                              {globalIndex}
                            </td>

                            {/* NAMA TOKO & PEMILIK (Bisa membaca storeName/name & ownerName/owner) */}
                            <td className="p-4">
                              <span
                                className={`font-extrabold text-xs md:text-sm block transition-colors duration-200 ${
                                  darkMode ? "text-slate-100" : "text-slate-900"
                                }`}
                              >
                                {m.storeName || m.name || "Nama Toko"}
                              </span>
                              <span
                                className={`text-[11px] font-medium block transition-colors duration-200 ${
                                  darkMode ? "text-slate-400" : "text-slate-500"
                                }`}
                              >
                                Pemilik: {m.ownerName || m.owner || "-"}
                              </span>
                            </td>

                            {/* KONTAK WHATSAPP */}
                            <td
                              className={`p-4 font-mono font-extrabold transition-colors duration-200 ${
                                darkMode ? "text-slate-200" : "text-slate-900"
                              }`}
                            >
                              {m.phone}
                            </td>

                            <td className="p-4">
                              <a
                                href={m.gmapsUrl || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 dark:text-emerald-400 hover:underline font-extrabold inline-flex items-center gap-1 text-xs"
                              >
                                <span>Verifikasi Maps</span> &rarr;
                              </a>
                            </td>

                            <td className="p-4">
                              <span
                                className={`uppercase text-[10px] font-black px-2.5 py-1 rounded-lg border ${
                                  darkMode
                                    ? "text-slate-300 bg-slate-800 border-slate-700/80"
                                    : "text-slate-800 bg-slate-100 border-slate-200"
                                }`}
                              >
                                {m.category || "Kuliner"}
                              </span>
                            </td>

                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                  isMerchantActive
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                }`}
                              >
                                {isMerchantActive ? "Aktif" : "Nonaktif"}
                              </span>
                            </td>

                            <td className="p-4 text-right">
                              <button
                                onClick={() => triggerMerchantStatusToggle(m)}
                                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-[11px] transition-all whitespace-nowrap ${
                                  isMerchantActive
                                    ? "bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-500/20"
                                    : "bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-500/20"
                                }`}
                              >
                                {isMerchantActive ? "Nonaktifkan" : "Aktifkan"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION MITRA */}
                {totalMerchantPages > 1 && (
                  <div
                    className={`p-4 border-t flex items-center justify-between text-xs font-bold ${darkMode ? "border-slate-800 bg-slate-900/40 text-slate-400" : "border-slate-200 bg-slate-50/50 text-slate-600"}`}
                  >
                    <span>
                      Halaman {merchantPage} dari {totalMerchantPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setMerchantPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={merchantPage === 1}
                        className="px-3 py-1.5 rounded-lg border font-extrabold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                      >
                        &larr; Prev
                      </button>
                      <button
                        onClick={() =>
                          setMerchantPage((p) =>
                            Math.min(p + 1, totalMerchantPages),
                          )
                        }
                        disabled={merchantPage === totalMerchantPages}
                        className="px-3 py-1.5 rounded-lg border font-extrabold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                      >
                        Next &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-3xl text-xs text-slate-400 dark:border-slate-800">
                Belum ada data mitra UMKM terdaftar.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TABEL DATA PROMO & KATALOG */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3
                  className={`text-base md:text-lg font-black tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}
                >
                  Tabel Produk
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Daftar seluruh item menu, baik harga reguler maupun promo
                  diskon khusus.
                </p>
              </div>

              {/* SUB-FILTER PRODUK ADMIN */}
              <div
                className={`flex items-center gap-1 p-1 rounded-2xl text-[11px] font-extrabold border overflow-x-auto max-w-full ${darkMode ? "bg-slate-900 border-slate-800" : "bg-slate-200/60 border-slate-300/40"}`}
              >
                <button
                  onClick={() => {
                    setProductFilter("all");
                    setProductPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${productFilter === "all" ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                >
                  Semua ({foods.length})
                </button>
                <button
                  onClick={() => {
                    setProductFilter("regular");
                    setProductPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${productFilter === "regular" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                >
                  Reguler (
                  {
                    foods.filter(
                      (f) =>
                        !f.isLateNight &&
                        (!f.promoTag || f.promoTag === "Reguler"),
                    ).length
                  }
                  )
                </button>
                <button
                  onClick={() => {
                    setProductFilter("promo");
                    setProductPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${productFilter === "promo" ? "bg-amber-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                >
                  Diskon (
                  {
                    foods.filter((f) => f.promoTag && f.promoTag !== "Reguler")
                      .length
                  }
                  )
                </button>
                <button
                  onClick={() => {
                    setProductFilter("latenight");
                    setProductPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${productFilter === "latenight" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                >
                  Midnight ({foods.filter((f) => f.isLateNight).length})
                </button>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div
                className={`max-w-full overflow-hidden rounded-3xl border shadow-sm ${darkMode ? "border-slate-800 bg-slate-900/60" : "border-slate-200/90 bg-white"}`}
              >
                <div className="max-w-full overflow-x-auto md:overflow-y-auto md:max-h-[calc(100vh-200px)] scrollbar-thin">
                  <table className="w-full text-left text-xs min-w-[780px]">
                    <thead
                      className={`font-black uppercase text-[10px] tracking-wider border-b ${darkMode ? "bg-slate-900/80 border-slate-800 text-slate-400" : "bg-slate-50/90 border-slate-200 text-slate-700"}`}
                    >
                      <tr>
                        <th className="p-4 w-12 text-center">No</th>
                        <th className="p-4">Produk & Foto</th>
                        <th className="p-4">Kategori</th>
                        <th className="p-4">Nama UMKM</th>
                        <th className="p-4">Tag Promo</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Aksi Moderasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                      {paginatedProducts.map((item, idx) => {
                        const isProductActive = item.isActive !== false;
                        const globalIndex =
                          (productPage - 1) * ITEMS_PER_PAGE + idx + 1;

                        return (
                          <tr
                            key={item.id}
                            className={`transition-colors ${darkMode ? "hover:bg-slate-900/80" : "hover:bg-slate-50/80"}`}
                          >
                            <td className="p-4 text-center font-bold text-slate-400 dark:text-slate-500">
                              {globalIndex}
                            </td>

                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    item.image ||
                                    "https://via.placeholder.com/80"
                                  }
                                  alt={item.name}
                                  className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm"
                                />
                                <span
                                  className={`font-extrabold text-xs block transition-colors duration-200 ${
                                    darkMode
                                      ? "text-slate-100"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {item.name}
                                </span>
                              </div>
                            </td>

                            <td className="p-4">
                              <span
                                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                                  darkMode
                                    ? "text-slate-300 bg-slate-800 border-slate-700/80"
                                    : "text-slate-800 bg-slate-100 border-slate-200"
                                }`}
                              >
                                {item.category}
                              </span>
                            </td>
                            <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              {item.merchants?.store_name ||
                                item.store_name ||
                                item.storeName ||
                                "-"}
                            </td>

                            <td className="p-4">
                              {item.isLateNight ? (
                                <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 whitespace-nowrap">
                                  MIDNIGHT DEALS
                                </span>
                              ) : item.promoTag &&
                                item.promoTag !== "Reguler" ? (
                                <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-amber-500 text-white shadow-sm shadow-amber-500/20 whitespace-nowrap">
                                  {item.promoTag}
                                </span>
                              ) : (
                                <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                  REGULER
                                </span>
                              )}
                            </td>

                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                  isProductActive
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                }`}
                              >
                                {isProductActive ? "Aktif" : "Nonaktif"}
                              </span>
                            </td>

                            <td className="p-4 text-right">
                              <button
                                onClick={() => triggerProductStatusToggle(item)}
                                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-[11px] transition-all whitespace-nowrap ${
                                  isProductActive
                                    ? "bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-500/20"
                                    : "bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-500/20"
                                }`}
                              >
                                {isProductActive ? "Nonaktifkan" : "Aktifkan"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION PRODUK */}
                {totalProductPages > 1 && (
                  <div
                    className={`p-4 border-t flex items-center justify-between text-xs font-bold ${darkMode ? "border-slate-800 bg-slate-900/40 text-slate-400" : "border-slate-200 bg-slate-50/50 text-slate-600"}`}
                  >
                    <span>
                      Halaman {productPage} dari {totalProductPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setProductPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={productPage === 1}
                        className="px-3 py-1.5 rounded-lg border font-extrabold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                      >
                        &larr; Prev
                      </button>
                      <button
                        onClick={() =>
                          setProductPage((p) =>
                            Math.min(p + 1, totalProductPages),
                          )
                        }
                        disabled={productPage === totalProductPages}
                        className="px-3 py-1.5 rounded-lg border font-extrabold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                      >
                        Next &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-3xl text-xs text-slate-400 dark:border-slate-800">
                Tidak ada data produk dalam kategori filter ini.
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL KONFIRMASI IN-APP */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl space-y-4 ${darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"}`}
          >
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <svg
                  className="w-5 h-5 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3 className="font-black text-base">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {confirmModal.message}
            </p>
            {confirmActionError && (
              <p role="alert" className="text-xs font-bold text-rose-500">
                {confirmActionError}
              </p>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    title: "",
                    message: "",
                    actionType: null,
                    targetId: null,
                  })
                }
                className={`w-1/2 py-2.5 rounded-xl font-extrabold text-xs border transition-all ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"}`}
              >
                Batal
              </button>

              <button
                onClick={handleConfirmAction}
                className="w-1/2 py-2.5 rounded-xl font-extrabold text-xs bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/20"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
