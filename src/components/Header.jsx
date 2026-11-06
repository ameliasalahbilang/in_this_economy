import React from "react";
import { Download } from "lucide-react";
import useHideOnScroll from "../hooks/useHideOnScroll";

export default function Header({
  darkMode,
  setDarkMode,
  handleInstallClick,
  isAppInstalled,
  currentUser,
  activeTab,
  setActiveTab,
  savedDeals,
  setShowLoginModal,
  setShowLogoutConfirm,
}) {
  const isVisible = useHideOnScroll();

  return (
    <header
      className={`sticky top-0 z-30 border-b py-3 px-4 md:px-6 backdrop-blur-md transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        darkMode
          ? "bg-slate-950/80 border-slate-800 text-slate-100"
          : "bg-white/80 border-slate-200 text-slate-800"
      }`}
    >
      <div
        className={`${
          currentUser?.role === "admin"
            ? "w-full"
            : currentUser
              ? "max-w-6xl"
              : "max-w-7xl"
        } mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div className="w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black leading-tight tracking-tight text-emerald-500 sm:text-xl md:text-2xl">
              In This Economy
            </h1>
            <span className="whitespace-nowrap rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-500">
              STUDENT DEALS
            </span>
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">
            {currentUser
              ? `Mode Dashboard ${currentUser.role === "admin" ? "Super Admin" : "Mitra"} (${currentUser.name})`
              : "Alokasi Budget & Smart Partner Platform"}
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center justify-start gap-2 pt-1 sm:w-auto sm:justify-end sm:pt-0">
          {!isAppInstalled && (
            <button
              type="button"
              onClick={handleInstallClick}
              aria-label="Install App"
              className={`inline-flex items-center gap-1.5 rounded-xl border bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-600 transition-all hover:bg-emerald-500/20 active:scale-95 dark:text-emerald-400 ${
                darkMode ? "border-emerald-500/20" : "border-emerald-200"
              }`}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Install App</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center justify-center rounded-xl border p-2 transition-all ${
              darkMode
                ? "border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700"
                : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="Ubah Tema"
            aria-label="Ubah Tema"
          >
            {darkMode ? (
              <svg
                className="h-4 w-4 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l1.41 1.41"></path>
              </svg>
            ) : (
              <svg
                className="h-4 w-4 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            )}
          </button>

          {!currentUser ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveTab(activeTab === "saved" ? "feed" : "saved")
                }
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                  activeTab === "saved"
                    ? "border-amber-400 bg-amber-500 text-white shadow-md"
                    : darkMode
                      ? "border-slate-800 bg-slate-900 text-slate-200"
                      : "border-slate-200 bg-slate-100 text-slate-700"
                }`}
              >
                <span>{activeTab === "saved" ? "← Feed" : "★ Favorit"}</span>
                {savedDeals.length > 0 && activeTab !== "saved" && (
                  <span className="rounded-full bg-amber-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                    {savedDeals.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-95"
              >
                Daftar UMKM
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-md transition-all hover:bg-rose-500"
            >
              Keluar / Mode Konsumen
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
