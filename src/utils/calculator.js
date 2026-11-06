export const MIN_MEAL_COST = 8000; // Standar minimal makan per porsi

// Helper Kalkulasi Budget Harian & Porsi Makan
export const calculateDailyBudget = (totalBudget = 0, days = 1, allocations = ['makan']) => {
  const numericBudget = Number(totalBudget) || 0;
  const numDays = Math.max(1, Number(days) || 1);
  
  // Pastikan allocations selalu berupa Array
  const safeAllocations = Array.isArray(allocations) && allocations.length > 0 
    ? allocations 
    : ['makan'];

  // Hitung alokasi harian
  const dailyBudget = Math.floor(numericBudget / numDays);

  // Alokasi porsi makan (asumsi 60% dari daily budget dibagi 3 kali makan)
  // Jika kategori makan di-uncheck, porsi makan disesuaikan
  const hasMakan = safeAllocations.includes('makan');
  const foodBudgetRatio = hasMakan ? 0.6 : 0.3;
  const dailyFoodBudget = dailyBudget * foodBudgetRatio;
  const budgetPerMeal = Math.floor(dailyFoodBudget / 3);

  // Batas anggaran kritis/peringatan (dibawah Rp 10.000 / porsi)
  const isCritical = budgetPerMeal < 10000;
  const suggestedMinBudget = numDays * 30000; // Minimal Rp 10.000 x 3 makan x jumlah hari

  return {
    rawBudget: numericBudget,
    days: numDays,
    dailyBudget,
    dailyFoodBudget,
    budgetPerMeal,
    isCritical,
    suggestedMinBudget,
    allocations: safeAllocations
  };
};