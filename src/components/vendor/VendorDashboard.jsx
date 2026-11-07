import React, { useState } from "react";
import VendorForm from "./VendorForm";

export default function VendorDashboard({
  products,
  onAddProduct,
  onUpdateProduct,
  onToggleProductStatus,
  currentUser,
  userLocation,
  onLogout,
  darkMode,
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const merchantProducts = (products || []).filter(
    (product) => product.vendor_id === currentUser?.id,
  );

  const isPromoItem = (product) => Boolean(product.promo_tag);
  const isNightItem = (product) => Boolean(product.is_late_night);
  const isRegularItem = (p) => !isPromoItem(p) && !isNightItem(p);

  const counts = {
    all: merchantProducts.length,
    night: merchantProducts.filter(isNightItem).length,
    promo: merchantProducts.filter(isPromoItem).length,
    regular: merchantProducts.filter(isRegularItem).length,
  };

  const filteredProducts = merchantProducts.filter((p) => {
    if (activeTab === "night") return isNightItem(p);
    if (activeTab === "promo") return isPromoItem(p);
    if (activeTab === "regular") return isRegularItem(p);
    return true;
  });

  const handleAddProduct = async (newProduct) => {
    await onAddProduct(newProduct);
    setToastMessage("Menu baru berhasil diterbitkan!");
  };

  const handleUpdateProduct = async (updatedProduct) => {
    await onUpdateProduct(updatedProduct);
    setToastMessage("Perubahan menu berhasil disimpan!");
  };

  const executeToggleActive = async () => {
    if (!confirmTarget) return;

    const targetId = confirmTarget.id;
    const isCurrentlyActive = confirmTarget.is_active !== false;

    try {
      await onToggleProductStatus(targetId);
    } catch (error) {
      console.error("Gagal mengubah status produk:", error);
      setConfirmTarget(null);
      setToastMessage("Gagal memperbarui status menu. Silakan coba lagi.");
      return;
    }

    const message = isCurrentlyActive
      ? `Menu "${confirmTarget.name}" berhasil dinonaktifkan.`
      : `Menu "${confirmTarget.name}" berhasil diaktifkan kembali.`;

    setConfirmTarget(null);
    setToastMessage(message);
  };

  const storeGmapsUrl = currentUser?.gmaps_url || "https://maps.google.com";

  return (
    <div
      className={`min-h-screen px-4 md:px-6 pt-6 pb-12 transition-colors ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div
          className={`relative overflow-hidden p-6 md:p-8 rounded-3xl border transition-all duration-300 shadow-sm ${
            darkMode
              ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-slate-950/40"
              : "bg-white border-slate-200/80 text-slate-900 shadow-slate-200/50"
          }`}
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 backdrop-blur-md">
                  <svg
                    className="w-3.5 h-3.5 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Mitra Verified
                </span>
                {currentUser?.category && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    {currentUser.category}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none">
                  {currentUser?.store_name || "Toko"}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-slate-400">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                    darkMode
                      ? "bg-slate-800/50 border-slate-700/80 text-slate-300"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <svg
                    className="w-3.5 h-3.5 text-emerald-500 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>
                    Pengelola:{" "}
                    <strong
                      className={darkMode ? "text-slate-100" : "text-slate-900"}
                    >
                      {currentUser?.owner_name || "-"}
                    </strong>
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                    darkMode
                      ? "bg-slate-800/50 border-slate-700/80 text-slate-300"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <svg
                    className="w-3.5 h-3.5 text-emerald-500 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>{currentUser?.phone || "-"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60 dark:border-slate-800">
              <a
                href={storeGmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-extrabold text-xs transition-all border active:scale-95 ${
                  darkMode
                    ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-emerald-400 hover:text-emerald-300"
                    : "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200/60 text-emerald-700"
                }`}
                title="Buka Lokasi Google Maps Toko"
              >
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span className="hidden sm:inline">Lokasi Toko</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-5 py-3 rounded-2xl font-extrabold text-xs transition-all shadow-lg shadow-emerald-600/25 tracking-wide"
              >
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Tambah Menu</span>
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-3 rounded-2xl font-extrabold text-xs transition-all border bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20 active:scale-95"
                  title="Keluar Sesi Toko"
                >
                  <svg
                    className="w-4 h-4 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LIST DAFTAR MENU DENGAN TAB FILTER */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xs md:text-sm font-extrabold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <span>DAFTAR MENU</span>
              <span className="text-slate-400 font-bold">
                ({filteredProducts.length})
              </span>
            </h2>

            <div
              className={`flex items-center gap-2 p-2 rounded-3xl border overflow-x-auto scrollbar-none shadow-sm ${
                darkMode
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                  activeTab === "all"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                </svg>
                <span>Semua</span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                    activeTab === "all"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("night")}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                  activeTab === "night"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <span>Midnight Deals</span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                    activeTab === "night"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {counts.night}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("promo")}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                  activeTab === "promo"
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <span>Promo Potongan</span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                    activeTab === "promo"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {counts.promo}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("regular")}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                  activeTab === "regular"
                    ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-md shadow-slate-900/20"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>Reguler</span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                    activeTab === "regular"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {counts.regular}
                </span>
              </button>
            </div>
          </div>

          {/* GRID KATALOG 2 KOLOM */}
          {filteredProducts.length === 0 ? (
            <div
              className={`p-10 text-center rounded-3xl border border-dashed transition-all ${
                darkMode
                  ? "border-slate-800 text-slate-500 bg-slate-900/30"
                  : "border-slate-300 text-slate-400 bg-white"
              }`}
            >
              <p className="text-xs font-bold">
                {activeTab === "all"
                  ? "Belum ada menu yang diterbitkan untuk toko ini."
                  : `Tidak ada menu dalam kategori '${activeTab}'.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsFormOpen(true);
                }}
                className="mt-3 inline-flex items-center gap-1 text-xs font-black text-emerald-500 hover:underline"
              >
                + Tambah Menu Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => {
                const isActive = product.is_active !== false;

                return (
                  <div
                    key={product.id}
                    className={`p-4 rounded-3xl border flex gap-4 transition-all duration-300 shadow-sm hover:shadow-xl ${
                      !isActive
                        ? darkMode
                          ? "bg-slate-900/40 border-slate-800 opacity-60"
                          : "bg-slate-100/70 border-slate-200 opacity-60"
                        : darkMode
                          ? "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-slate-950/40"
                          : "bg-white border-slate-200/80 hover:border-slate-300 shadow-slate-200/50"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={product.image_url || ""}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-2xl"
                      />
                      {!isActive && (
                        <span className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-sm text-slate-200 text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
                          Nonaktif
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            {product.category}
                          </span>
                          {product.is_late_night && (
                            <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <svg
                                className="w-2.5 h-2.5 stroke-current"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2.5"
                              >
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                              </svg>
                              Midnight Deal
                            </span>
                          )}
                          {product.promo_tag && (
                            <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <svg
                                className="w-2.5 h-2.5 stroke-current"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2.5"
                              >
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                              </svg>
                              {product.promo_tag}
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-sm leading-snug line-clamp-1">
                          {product.name}
                        </h3>

                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-black text-emerald-500">
                            Rp {Number(product.price).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex items-center gap-4 pt-2.5 mt-2">
                        {/* TOMBOL EDIT DATA (HOVER KUNING/AMBER) */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsFormOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-400 hover:text-amber-500 transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          <span>Edit Data</span>
                        </button>

                        {/* TOMBOL TOGGLE STATUS (HOVER MERAH SAAT NONAKTIFKAN / HOVER EMERALD SAAT AKTIFKAN KEMBALI) */}
                        <button
                          type="button"
                          onClick={() => setConfirmTarget(product)}
                          className={`inline-flex items-center gap-1.5 text-xs font-extrabold transition-colors ${
                            isActive
                              ? "text-slate-400 hover:text-rose-500"
                              : "text-emerald-500 hover:text-emerald-400"
                          }`}
                        >
                          <svg
                            className="w-3.5 h-3.5 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line
                              x1="4.93"
                              y1="4.93"
                              x2="19.07"
                              y2="19.07"
                            ></line>
                          </svg>
                          <span>
                            {isActive ? "Nonaktifkan" : "Aktifkan Kembali"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FORM EDIT / CREATE */}
        {isFormOpen && (
          <VendorForm
            darkMode={darkMode}
            currentUser={currentUser}
            userLocation={userLocation}
            initialData={editingProduct}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onClose={() => {
              setIsFormOpen(false);
              setEditingProduct(null);
            }}
          />
        )}

        {/* MODAL CONFIRM KONFIRMASI NONAKTIFKAN */}
        {confirmTarget && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div
              className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl space-y-4 ${
                darkMode
                  ? "bg-slate-900 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="text-center space-y-2">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                    confirmTarget.is_active !== false
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  }`}
                >
                  <svg
                    className="w-6 h-6 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>

                <h3 className="font-extrabold text-base leading-snug">
                  {confirmTarget.is_active !== false
                    ? "Nonaktifkan Menu?"
                    : "Aktifkan Kembali Menu?"}
                </h3>

                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Kamu akan{" "}
                  <span className="font-extrabold text-amber-500">
                    {confirmTarget.is_active !== false
                      ? "menonaktifkan"
                      : "mengaktifkan kembali"}
                  </span>{" "}
                  menu{" "}
                  <strong
                    className={darkMode ? "text-slate-200" : "text-slate-800"}
                  >
                    "{confirmTarget.name}"
                  </strong>
                  .
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmTarget(null)}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs border transition-all ${
                    darkMode
                      ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                      : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={executeToggleActive}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs text-white transition-all shadow-md ${
                    confirmTarget.is_active !== false
                      ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20"
                      : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                  }`}
                >
                  {confirmTarget.is_active !== false
                    ? "Ya, Nonaktifkan"
                    : "Ya, Aktifkan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL TOAST BERHASIL */}
        {toastMessage && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div
              className={`w-full max-w-xs rounded-3xl p-6 border shadow-2xl text-center space-y-3 ${
                darkMode
                  ? "bg-slate-900 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto mb-1">
                <svg
                  className="w-6 h-6 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>

              <h3 className="font-extrabold text-base">Berhasil!</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                {toastMessage}
              </p>

              <button
                type="button"
                onClick={() => setToastMessage("")}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 uppercase tracking-wider"
              >
                Oke, Siap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
