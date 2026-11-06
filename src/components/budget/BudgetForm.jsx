import React, { useState, useEffect } from "react";
import PieChart from "./PieChart";

export default function BudgetForm({
  onBudgetCalculated,
  darkMode,
  calculation,
}) {
  // Helper Format Ribuan dengan Titik (misal 50000 -> 50.000)
  const formatNumberWithDots = (val) => {
    if (val === undefined || val === null || val === "") return "";
    const cleanNum = val.toString().replace(/\D/g, "");
    return cleanNum ? parseInt(cleanNum, 10).toLocaleString("id-ID") : "";
  };

  const [budgetValue, setBudgetValue] = useState(() => {
    const saved = localStorage.getItem("user_budget_amount");
    return saved || "";
  });
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const saved = localStorage.getItem("user_selected_categories");
    return saved ? JSON.parse(saved) : [];
  });
  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // 1. Inisialisasi State Input dengan Fallback Aman saat calculation = null
const [displayBudget, setDisplayBudget] = useState(() => {
    return calculation?.totalBudget
      ? formatNumberWithDots(calculation.totalBudget)
      : "";
  });

  const [daysSelect, setDaysSelect] = useState(() => {
    const savedDays = calculation?.days ? String(calculation.days) : "1";
    return ["1", "3", "7", "30"].includes(savedDays)
      ? savedDays
      : calculation?.days
        ? "custom"
        : "1";
  });

  const [customDays, setCustomDays] = useState(() => {
    return calculation?.days ? String(calculation.days) : "5";
  });

  const [selectedAllocations, setSelectedAllocations] = useState(() => {
    return Array.isArray(calculation?.allocations) &&
      calculation.allocations.length > 0
      ? calculation.allocations
      : [];
  });

  // 2. Sync state jika calculation berubah / di-reset
  useEffect(() => {
    if (calculation) {
      if (calculation.totalBudget) {
        setDisplayBudget(formatNumberWithDots(calculation.totalBudget));
      }
      if (calculation.days) {
        const d = String(calculation.days);
        if (["1", "3", "7", "30"].includes(d)) {
          setDaysSelect(d);
        } else {
          setDaysSelect("custom");
          setCustomDays(d);
        }
      }
      if (Array.isArray(calculation.allocations)) {
        setSelectedAllocations(calculation.allocations);
      }
    }
  }, [calculation]);

  const handleBudgetInputChange = (e) => {
    setDisplayBudget(formatNumberWithDots(e.target.value));
  };

  const toggleAllocation = (id) => {
    if (selectedAllocations.includes(id)) {
      if (selectedAllocations.length === 1) return;
      setSelectedAllocations(selectedAllocations.filter((item) => item !== id));
    } else {
      setSelectedAllocations([...selectedAllocations, id]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawNumber = parseInt(displayBudget.replace(/\./g, ""), 10);
    const numericDays =
      daysSelect === "custom"
        ? parseInt(customDays, 10)
        : parseInt(daysSelect, 10);

    if (isNaN(rawNumber) || rawNumber <= 0) {
      alert("Masukkan nominal budget yang valid.");
      return;
    }

    if (isNaN(numericDays) || numericDays <= 0) {
      alert("Masukkan jumlah hari yang valid.");
      return;
    }

    const dailyBudget = rawNumber / numericDays;
    const budgetPerMeal = dailyBudget / 3;

    onBudgetCalculated({
      totalBudget: rawNumber,
      days: numericDays,
      dailyBudget,
      budgetPerMeal,
      allocations: selectedAllocations,
    });
  };

  return (
    <div className="space-y-4">
      {/* PieChart hanya muncul kalau calculation sudah ada */}
      {calculation && (
        <PieChart calculation={calculation} darkMode={darkMode} />
      )}

      {/* FORM BUDGET SELALU MUNCUL BERSIH */}
      <div
        className={`p-5 md:p-6 rounded-3xl border shadow-sm transition-all duration-300 ${
          darkMode
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        <div
          style={{ borderBottomColor: "#cbd5e1" }}
          className="flex items-center gap-3 mb-5 pb-3 border-b dark:border-b-slate-800"
        >
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <svg
              className="w-5 h-5 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <rect x="2" y="4" width="20" height="16" rx="3"></rect>
              <path d="M6 10h4M6 14h2M16 10h2M16 14h2"></path>
            </svg>
          </div>
          <div>
            <h2 className="font-black text-sm md:text-base tracking-tight">
              Kalkulator Budget
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Hitung alokasi harian sesuai kebutuhanmu
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Total Budget (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">
                Rp
              </span>
              <input
                type="text"
                value={displayBudget}
                onChange={handleBudgetInputChange}
                placeholder="50.000"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  darkMode
                    ? "bg-slate-800/60 border-slate-700 text-slate-100"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Periode Pengeluaran
            </label>
            <select
              value={daysSelect}
              onChange={(e) => setDaysSelect(e.target.value)}
              className={`w-full px-3.5 py-2.5 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all ${
                darkMode
                  ? "bg-slate-800/60 border-slate-700 text-slate-100"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value="1">Per Hari (1 Hari)</option>
              <option value="3">3 Hari</option>
              <option value="7">Mingguan (7 Hari)</option>
              <option value="30">Bulanan (30 Hari)</option>
              <option value="custom">Input Hari Sendiri...</option>
            </select>

            {daysSelect === "custom" && (
              <div className="mt-2 relative">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="Masukkan jumlah hari (misal: 14)"
                  className={`w-full px-3.5 py-2 border rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-extrabold text-slate-400">
                  Hari
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Pilih Kebutuhan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: "makan",
                  label: "Makan",
                  icon: (
                    <svg
                      className="w-4 h-4 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z"></path>
                      <path d="M7 8V4M12 8V4M17 8V4"></path>
                    </svg>
                  ),
                },
                {
                  id: "perlengkapan",
                  label: "Perlengkapan",
                  icon: (
                    <svg
                      className="w-4 h-4 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                  ),
                },
                {
                  id: "main",
                  label: "Main",
                  icon: (
                    <svg
                      className="w-4 h-4 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <line x1="6" y1="12" x2="10" y2="12"></line>
                      <line x1="8" y1="10" x2="8" y2="14"></line>
                      <circle cx="15" cy="13" r="1"></circle>
                      <circle cx="18" cy="11" r="1"></circle>
                      <rect x="2" y="6" width="20" height="12" rx="4"></rect>
                    </svg>
                  ),
                },
                {
                  id: "jasa",
                  label: "Jasa",
                  icon: (
                    <svg
                      className="w-4 h-4 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <rect x="1" y="3" width="15" height="13" rx="2"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  ),
                },
              ].map((cat) => {
                const isSelected = selectedAllocations.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleAllocation(cat.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      isSelected
                        ? darkMode
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm"
                          : "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                        : darkMode
                          ? "bg-slate-800/40 border-slate-700/80 text-slate-400 hover:text-slate-200"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold py-3 rounded-xl transition-all text-xs tracking-wide uppercase shadow-md shadow-emerald-600/20 mt-2"
          >
            Hitung & Cari Mitra
          </button>
        </form>
      </div>
    </div>
  );
}
