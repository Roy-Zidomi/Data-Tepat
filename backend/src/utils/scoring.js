/**
 * Scoring Algorithm for BantuTepat
 */

const calculateIncomeScore = (monthlyIncome) => {
  if (monthlyIncome === null || monthlyIncome === undefined) return 0;
  const income = Number(monthlyIncome);
  
  if (income <= 500000) return 25;
  if (income <= 1000000) return 20;
  if (income <= 2000000) return 15;
  if (income <= 3000000) return 10;
  return 5;
};

const calculateDependentsScore = (dependentsCount) => {
  if (dependentsCount === null || dependentsCount === undefined) return 0;
  const count = Number(dependentsCount);

  if (count >= 5) return 15;
  if (count >= 3) return 12;
  if (count >= 1) return 8;
  return 3;
};

const calculateHousingScore = (houseCondition) => {
  if (!houseCondition) return 0;
  
  switch (houseCondition) {
    case 'tidak_layak': return 20;
    case 'semi_layak': return 12;
    case 'layak': return 5;
    default: return 0;
  }
};

const calculateAssetScore = (assets) => {
  if (!assets) return 0;
  
  const hasCar = assets.has_car;
  const hasMotorcycle = assets.has_motorcycle;
  const hasLand = assets.has_other_land;
  
  let assetCount = 0;
  if (hasCar) assetCount++;
  if (hasMotorcycle) assetCount++;
  if (hasLand) assetCount++;
  
  if (assetCount === 0) return 15;
  if (assetCount === 1) return 10;
  return 5;
};

const calculateVulnerabilityScore = (vulnerabilities) => {
  if (!vulnerabilities) return 0;
  
  let score = 0;
  if (vulnerabilities.is_disaster_victim) score += 3;
  if (vulnerabilities.lost_job_recently) score += 3;
  if (vulnerabilities.has_severe_ill_member) score += 3;
  if (vulnerabilities.has_disabled_member) score += 3;
  if (vulnerabilities.has_elderly_member) score += 3;
  
  // Cap at 15
  return Math.min(score, 15);
};

const calculateHistoryScore = (everReceivedAid) => {
  if (everReceivedAid === false) return 10;
  return 3; 
};

/**
 * Calculate total score and return component breakdowns
 */
const calculateTotalScore = (data) => {
  const { 
    economicCond, 
    housingCond, 
    assets, 
    vulnerability 
  } = data;

  const incomeScore = calculateIncomeScore(economicCond?.monthly_income_total);
  const dependentsScore = calculateDependentsScore(economicCond?.dependents_count);
  const housingScore = calculateHousingScore(housingCond?.house_condition);
  const assetScore = calculateAssetScore(assets);
  const vulnerabilityScore = calculateVulnerabilityScore(vulnerability);
  const historyAidScore = calculateHistoryScore(vulnerability?.ever_received_aid_before);

  const totalScore = incomeScore + dependentsScore + housingScore + assetScore + vulnerabilityScore + historyAidScore;

  return {
    incomeScore,
    dependentsScore,
    housingScore,
    assetScore,
    vulnerabilityScore,
    historyAidScore,
    totalScore
  };
};

const determinePriorityLevel = (totalScore) => {
  if (totalScore >= 75) return 'sangat_layak';
  if (totalScore >= 55) return 'layak';
  if (totalScore >= 40) return 'verifikasi_tambahan';
  return 'tidak_prioritas';
};

module.exports = {
  calculateTotalScore,
  determinePriorityLevel
};
