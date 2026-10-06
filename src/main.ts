import './style.css'

// ============================================================
// GRIDWATCH — PHASE 13 MASTER DASHBOARD ARCHITECTURE
// FINAL EXAMINER-READY UX, DECISION SUPPORT & SYSTEM INTEGRATION
// ============================================================

export type TransformerSummary = {
  id: string
  observations: number
  coverageDays: number
  firstObs: string
  latestObs: string
  totalAnomalies: number
  totalAnomalyRate: number
  episodes: number
  maxRun: number
  recentObs: number
  recentAnomalies: number
  recentAnomalyRate: number
  daysSinceLatestAnomaly: number
  p95AnomalyScore: number
  maxAnomalyScore: number
  p95BaselineScore: number
  p95RecentBaselineScore: number
  trendDelta: number
  missingRate: number
  medianGapHours: number
  largeGapRate: number
  strongestReason: string
  components: {
    intensity: number // 30%
    persistence: number // 20%
    recency: number // 20%
    specificBaseline: number // 15%
    trend: number // 15%
  }
  conditionIndicator: number
  conditionBand: 'HIGH REVIEW' | 'REVIEW' | 'MONITOR' | 'NORMAL'
  confidence: 'High confidence' | 'Moderate confidence' | 'Limited confidence'
  reviewPriority: 'P1 — High Review Priority' | 'P2 — Review' | 'P3 — Monitor' | 'P4 — Routine'
  priorityCode: 'P1' | 'P2' | 'P3' | 'P4'
  reasonCodes: string[]
  engineeringAction: string
  robustnessStability: 'CONSISTENTLY HIGH' | 'MODERATELY STABLE' | 'METHOD-SENSITIVE / UNCERTAIN' | 'INSUFFICIENT DATA'
  robustnessTag: 'STABLE' | 'MODERATELY STABLE' | 'SENSITIVE' | 'INSUFFICIENT DATA'
  robustnessRunRange: string
  robustnessTop3Count: string
  phasesCount: string
}

export const REAL_TRANSFORMERS: TransformerSummary[] = [
  {
    id: 'TX-I',
    observations: 5754,
    coverageDays: 709.7,
    firstObs: '2013-07-29',
    latestObs: '2015-07-09',
    totalAnomalies: 1118,
    totalAnomalyRate: 0.1943,
    episodes: 632,
    maxRun: 47,
    recentObs: 1620,
    recentAnomalies: 760,
    recentAnomalyRate: 0.4691,
    daysSinceLatestAnomaly: 0.04,
    p95AnomalyScore: 0.391,
    maxAnomalyScore: 0.948,
    p95BaselineScore: 15.19,
    p95RecentBaselineScore: 6.27,
    trendDelta: 0.0725,
    missingRate: 0.0,
    medianGapHours: 1.0,
    largeGapRate: 0.0007,
    strongestReason: 'carbon_monoxide_ppm_delta',
    components: { intensity: 0.923, persistence: 1.0, recency: 1.0, specificBaseline: 0.538, trend: 0.997 },
    conditionIndicator: 90.72,
    conditionBand: 'HIGH REVIEW',
    confidence: 'High confidence',
    reviewPriority: 'P1 — High Review Priority',
    priorityCode: 'P1',
    reasonCodes: ['Strong DGA deviation: carbon monoxide change', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity'],
    engineeringAction: 'Review recent DGA history, compare with the transformer-specific baseline, verify sampling continuity, and consider qualified engineering inspection.',
    robustnessStability: 'CONSISTENTLY HIGH',
    robustnessTag: 'SENSITIVE',
    robustnessRunRange: '35.96–91.50',
    robustnessTop3Count: '17/18',
    phasesCount: '3 phases',
  },
  {
    id: 'TX-M',
    observations: 5545,
    coverageDays: 617.0,
    firstObs: '2013-10-30',
    latestObs: '2015-07-09',
    totalAnomalies: 1981,
    totalAnomalyRate: 0.3573,
    episodes: 1008,
    maxRun: 128,
    recentObs: 1621,
    recentAnomalies: 795,
    recentAnomalyRate: 0.4904,
    daysSinceLatestAnomaly: 0.0,
    p95AnomalyScore: 0.394,
    maxAnomalyScore: 0.553,
    p95BaselineScore: 7.73,
    p95RecentBaselineScore: 6.92,
    trendDelta: 0.0057,
    missingRate: 0.0,
    medianGapHours: 3.0,
    largeGapRate: 0.0002,
    strongestReason: 'ethane_ppm_log1p',
    components: { intensity: 1.0, persistence: 1.0, recency: 1.0, specificBaseline: 0.154, trend: 0.539 },
    conditionIndicator: 80.40,
    conditionBand: 'HIGH REVIEW',
    confidence: 'High confidence',
    reviewPriority: 'P1 — High Review Priority',
    priorityCode: 'P1',
    reasonCodes: ['Strong DGA deviation: ethane concentration', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity'],
    engineeringAction: 'Review recent DGA history, compare with the transformer-specific baseline, verify sampling continuity, and consider qualified engineering inspection.',
    robustnessStability: 'CONSISTENTLY HIGH',
    robustnessTag: 'SENSITIVE',
    robustnessRunRange: '6.92–87.31',
    robustnessTop3Count: '16/18',
    phasesCount: '3 phases',
  },
  {
    id: 'TX-J',
    observations: 21390,
    coverageDays: 1826.5,
    firstObs: '2010-07-09',
    latestObs: '2015-07-09',
    totalAnomalies: 4376,
    totalAnomalyRate: 0.2046,
    episodes: 3983,
    maxRun: 38,
    recentObs: 3173,
    recentAnomalies: 453,
    recentAnomalyRate: 0.1428,
    daysSinceLatestAnomaly: 0.08,
    p95AnomalyScore: 0.358,
    maxAnomalyScore: 0.991,
    p95BaselineScore: 358.75,
    p95RecentBaselineScore: 1068.25,
    trendDelta: -0.0736,
    missingRate: 0.4027,
    medianGapHours: 2.0,
    largeGapRate: 0.0003,
    strongestReason: 'hydrogen_ppm_delta',
    components: { intensity: 0.846, persistence: 1.0, recency: 1.0, specificBaseline: 1.0, trend: 0.0 },
    conditionIndicator: 80.38,
    conditionBand: 'HIGH REVIEW',
    confidence: 'Limited confidence',
    reviewPriority: 'P2 — Review',
    priorityCode: 'P2',
    reasonCodes: ['Strong DGA deviation: hydrogen change', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity', 'Transformer-specific baseline deviation', 'Data-quality or sampling limitation (40.27% missing gases)'],
    engineeringAction: 'Review the recent DGA trend and transformer-specific history; verify data quality before changing inspection cadence.',
    robustnessStability: 'INSUFFICIENT DATA',
    robustnessTag: 'INSUFFICIENT DATA',
    robustnessRunRange: '51.10–100.00',
    robustnessTop3Count: '17/18',
    phasesCount: '3 phases',
  },
  {
    id: 'TX-L',
    observations: 14501,
    coverageDays: 1495.7,
    firstObs: '2011-06-04',
    latestObs: '2015-07-09',
    totalAnomalies: 42,
    totalAnomalyRate: 0.0029,
    episodes: 19,
    maxRun: 7,
    recentObs: 1587,
    recentAnomalies: 7,
    recentAnomalyRate: 0.0044,
    daysSinceLatestAnomaly: 5.33,
    p95AnomalyScore: 0.195,
    maxAnomalyScore: 0.903,
    p95BaselineScore: 136.32,
    p95RecentBaselineScore: 159.60,
    trendDelta: -0.0107,
    missingRate: 0.0,
    medianGapHours: 2.0,
    largeGapRate: 0.0006,
    strongestReason: 'oxygen_ppm_roll_std_3',
    components: { intensity: 0.692, persistence: 1.0, recency: 0.086, specificBaseline: 0.923, trend: 0.426 },
    conditionIndicator: 62.73,
    conditionBand: 'REVIEW',
    confidence: 'High confidence',
    reviewPriority: 'P2 — Review',
    priorityCode: 'P2',
    reasonCodes: ['Strong DGA deviation: oxygen variability', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity', 'Transformer-specific baseline deviation'],
    engineeringAction: 'Review the recent DGA trend and transformer-specific history; verify data quality before changing inspection cadence.',
    robustnessStability: 'MODERATELY STABLE',
    robustnessTag: 'MODERATELY STABLE',
    robustnessRunRange: '52.26–92.72',
    robustnessTop3Count: '2/18',
    phasesCount: '3 phases',
  },
  {
    id: 'TX-F',
    observations: 18288,
    coverageDays: 1826.3,
    firstObs: '2010-07-09',
    latestObs: '2015-07-09',
    totalAnomalies: 1228,
    totalAnomalyRate: 0.0671,
    episodes: 477,
    maxRun: 435,
    recentObs: 1860,
    recentAnomalies: 4,
    recentAnomalyRate: 0.0022,
    daysSinceLatestAnomaly: 8.08,
    p95AnomalyScore: 0.305,
    maxAnomalyScore: 0.981,
    p95BaselineScore: 11.33,
    p95RecentBaselineScore: 2.77,
    trendDelta: 0.0009,
    missingRate: 0.0,
    medianGapHours: 1.0,
    largeGapRate: 0.0001,
    strongestReason: 'ethane_ppm_roll_std_3',
    components: { intensity: 0.769, persistence: 1.0, recency: 0.041, specificBaseline: 0.385, trend: 0.506 },
    conditionIndicator: 57.26,
    conditionBand: 'REVIEW',
    confidence: 'High confidence',
    reviewPriority: 'P2 — Review',
    priorityCode: 'P2',
    reasonCodes: ['Strong DGA deviation: ethane variability', 'Persistent or repeated anomaly behaviour (longest run 435)', 'Recent anomaly activity'],
    engineeringAction: 'Review the recent DGA trend and transformer-specific history; verify data quality before changing inspection cadence.',
    robustnessStability: 'METHOD-SENSITIVE / UNCERTAIN',
    robustnessTag: 'SENSITIVE',
    robustnessRunRange: '37.31–76.39',
    robustnessTop3Count: '1/18',
    phasesCount: '3 phases',
  },
  {
    id: 'TX-D',
    observations: 9075,
    coverageDays: 1833.3,
    firstObs: '2010-07-02',
    latestObs: '2015-07-09',
    totalAnomalies: 178,
    totalAnomalyRate: 0.0196,
    episodes: 56,
    maxRun: 11,
    recentObs: 547,
    recentAnomalies: 9,
    recentAnomalyRate: 0.0165,
    daysSinceLatestAnomaly: 56.33,
    p95AnomalyScore: 0.148,
    maxAnomalyScore: 1.0,
    p95BaselineScore: 20.57,
    p95RecentBaselineScore: 10.90,
    trendDelta: 0.0103,
    missingRate: 0.0,
    medianGapHours: 4.0,
    largeGapRate: 0.0010,
    strongestReason: 'oxygen_ppm_delta',
    components: { intensity: 0.308, persistence: 1.0, recency: 0.241, specificBaseline: 0.769, trend: 0.571 },
    conditionIndicator: 54.14,
    conditionBand: 'REVIEW',
    confidence: 'High confidence',
    reviewPriority: 'P2 — Review',
    priorityCode: 'P2',
    reasonCodes: ['Strong DGA deviation: oxygen change', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity', 'Transformer-specific baseline deviation'],
    engineeringAction: 'Review the recent DGA trend and transformer-specific history; verify data quality before changing inspection cadence.',
    robustnessStability: 'MODERATELY STABLE',
    robustnessTag: 'MODERATELY STABLE',
    robustnessRunRange: '45.66–67.01',
    robustnessTop3Count: '0/18',
    phasesCount: '1 phase',
  },
  {
    id: 'TX-C',
    observations: 7936,
    coverageDays: 1758.5,
    firstObs: '2010-09-14',
    latestObs: '2015-07-09',
    totalAnomalies: 48,
    totalAnomalyRate: 0.0060,
    episodes: 15,
    maxRun: 5,
    recentObs: 547,
    recentAnomalies: 9,
    recentAnomalyRate: 0.0165,
    daysSinceLatestAnomaly: 56.33,
    p95AnomalyScore: 0.121,
    maxAnomalyScore: 0.956,
    p95BaselineScore: 29.28,
    p95RecentBaselineScore: 32.60,
    trendDelta: 0.0015,
    missingRate: 0.0,
    medianGapHours: 4.0,
    largeGapRate: 0.0011,
    strongestReason: 'oxygen_ppm_roll_std_3',
    components: { intensity: 0.231, persistence: 1.0, recency: 0.241, specificBaseline: 0.846, trend: 0.510 },
    conditionIndicator: 52.08,
    conditionBand: 'REVIEW',
    confidence: 'High confidence',
    reviewPriority: 'P2 — Review',
    priorityCode: 'P2',
    reasonCodes: ['Strong DGA deviation: oxygen variability', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity', 'Transformer-specific baseline deviation'],
    engineeringAction: 'Review the recent DGA trend and transformer-specific history; verify data quality before changing inspection cadence.',
    robustnessStability: 'METHOD-SENSITIVE / UNCERTAIN',
    robustnessTag: 'SENSITIVE',
    robustnessRunRange: '37.89–85.65',
    robustnessTop3Count: '1/18',
    phasesCount: '1 phase',
  },
  {
    id: 'TX-A',
    observations: 3021,
    coverageDays: 336.0,
    firstObs: '2014-08-07',
    latestObs: '2015-07-09',
    totalAnomalies: 6,
    totalAnomalyRate: 0.0020,
    episodes: 3,
    maxRun: 3,
    recentObs: 1620,
    recentAnomalies: 3,
    recentAnomalyRate: 0.0019,
    daysSinceLatestAnomaly: 97.71,
    p95AnomalyScore: 0.182,
    maxAnomalyScore: 0.553,
    p95BaselineScore: 6.67,
    p95RecentBaselineScore: 6.76,
    trendDelta: 0.0541,
    missingRate: 0.0,
    medianGapHours: 1.0,
    largeGapRate: 0.0003,
    strongestReason: 'carbon_dioxide_ppm_log1p',
    components: { intensity: 0.615, persistence: 0.880, recency: 0.022, specificBaseline: 0.077, trend: 0.871 },
    conditionIndicator: 50.71,
    conditionBand: 'REVIEW',
    confidence: 'Moderate confidence',
    reviewPriority: 'P2 — Review',
    priorityCode: 'P2',
    reasonCodes: ['Strong DGA deviation: carbon dioxide concentration', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity'],
    engineeringAction: 'Review the recent DGA trend and transformer-specific history; verify data quality before changing inspection cadence.',
    robustnessStability: 'METHOD-SENSITIVE / UNCERTAIN',
    robustnessTag: 'SENSITIVE',
    robustnessRunRange: '8.08–57.69',
    robustnessTop3Count: '0/18',
    phasesCount: '3 phases',
  },
  {
    id: 'TX-H',
    observations: 23788,
    coverageDays: 1826.1,
    firstObs: '2010-07-09',
    latestObs: '2015-07-09',
    totalAnomalies: 187,
    totalAnomalyRate: 0.0079,
    episodes: 119,
    maxRun: 5,
    recentObs: 1620,
    recentAnomalies: 0,
    recentAnomalyRate: 0.0,
    daysSinceLatestAnomaly: 1027.79,
    p95AnomalyScore: 0.154,
    maxAnomalyScore: 0.789,
    p95BaselineScore: 15.73,
    p95RecentBaselineScore: 18.67,
    trendDelta: 0.0039,
    missingRate: 0.0,
    medianGapHours: 1.0,
    largeGapRate: 0.00004,
    strongestReason: 'ethane_ppm_log1p',
    components: { intensity: 0.385, persistence: 1.0, recency: 0.0, specificBaseline: 0.615, trend: 0.527 },
    conditionIndicator: 48.67,
    conditionBand: 'MONITOR',
    confidence: 'High confidence',
    reviewPriority: 'P3 — Monitor',
    priorityCode: 'P3',
    reasonCodes: ['Strong DGA deviation: ethane concentration', 'Persistent or repeated anomaly behaviour'],
    engineeringAction: 'Continue monitoring, review repeated deviations, and confirm that sampling continuity supports interpretation.',
    robustnessStability: 'MODERATELY STABLE',
    robustnessTag: 'MODERATELY STABLE',
    robustnessRunRange: '33.77–56.92',
    robustnessTop3Count: '0/18',
    phasesCount: '3 phases',
  },
  {
    id: 'TX-E',
    observations: 23934,
    coverageDays: 1826.2,
    firstObs: '2010-07-09',
    latestObs: '2015-07-09',
    totalAnomalies: 114,
    totalAnomalyRate: 0.0048,
    episodes: 41,
    maxRun: 26,
    recentObs: 1621,
    recentAnomalies: 0,
    recentAnomalyRate: 0.0,
    daysSinceLatestAnomaly: 195.92,
    p95AnomalyScore: 0.173,
    maxAnomalyScore: 0.919,
    p95BaselineScore: 8.61,
    p95RecentBaselineScore: 14.22,
    trendDelta: -0.0014,
    missingRate: 0.0,
    medianGapHours: 1.0,
    largeGapRate: 0.0002,
    strongestReason: 'hydrogen_ppm_log1p',
    components: { intensity: 0.5, persistence: 1.0, recency: 0.0, specificBaseline: 0.269, trend: 0.490 },
    conditionIndicator: 46.39,
    conditionBand: 'MONITOR',
    confidence: 'High confidence',
    reviewPriority: 'P3 — Monitor',
    priorityCode: 'P3',
    reasonCodes: ['Strong DGA deviation: hydrogen concentration', 'Persistent or repeated anomaly behaviour'],
    engineeringAction: 'Continue monitoring, review repeated deviations, and confirm that sampling continuity supports interpretation.',
    robustnessStability: 'METHOD-SENSITIVE / UNCERTAIN',
    robustnessTag: 'SENSITIVE',
    robustnessRunRange: '12.12–54.04',
    robustnessTop3Count: '0/18',
    phasesCount: '3 phases',
  },
  {
    id: 'TX-G',
    observations: 23934,
    coverageDays: 1826.2,
    firstObs: '2010-07-09',
    latestObs: '2015-07-09',
    totalAnomalies: 114,
    totalAnomalyRate: 0.0048,
    episodes: 41,
    maxRun: 26,
    recentObs: 1621,
    recentAnomalies: 0,
    recentAnomalyRate: 0.0,
    daysSinceLatestAnomaly: 195.92,
    p95AnomalyScore: 0.173,
    maxAnomalyScore: 0.919,
    p95BaselineScore: 8.61,
    p95RecentBaselineScore: 14.22,
    trendDelta: -0.0014,
    missingRate: 0.0,
    medianGapHours: 1.0,
    largeGapRate: 0.0002,
    strongestReason: 'hydrogen_ppm_log1p',
    components: { intensity: 0.5, persistence: 1.0, recency: 0.0, specificBaseline: 0.269, trend: 0.490 },
    conditionIndicator: 46.39,
    conditionBand: 'MONITOR',
    confidence: 'High confidence',
    reviewPriority: 'P3 — Monitor',
    priorityCode: 'P3',
    reasonCodes: ['Strong DGA deviation: hydrogen concentration', 'Persistent or repeated anomaly behaviour'],
    engineeringAction: 'Continue monitoring, review repeated deviations, and confirm that sampling continuity supports interpretation.',
    robustnessStability: 'METHOD-SENSITIVE / UNCERTAIN',
    robustnessTag: 'SENSITIVE',
    robustnessRunRange: '12.12–54.04',
    robustnessTop3Count: '0/18',
    phasesCount: '3 phases',
  },
  {
    id: 'TX-B',
    observations: 17540,
    coverageDays: 1588.3,
    firstObs: '2011-01-10',
    latestObs: '2015-05-18',
    totalAnomalies: 303,
    totalAnomalyRate: 0.0173,
    episodes: 160,
    maxRun: 7,
    recentObs: 1620,
    recentAnomalies: 0,
    recentAnomalyRate: 0.0,
    daysSinceLatestAnomaly: 1081.79,
    p95AnomalyScore: 0.085,
    maxAnomalyScore: 0.699,
    p95BaselineScore: 19.10,
    p95RecentBaselineScore: 9.47,
    trendDelta: -0.0021,
    missingRate: 0.0,
    medianGapHours: 1.0,
    largeGapRate: 0.0002,
    strongestReason: 'oxygen_ppm_log1p',
    components: { intensity: 0.154, persistence: 1.0, recency: 0.0, specificBaseline: 0.692, trend: 0.486 },
    conditionIndicator: 42.29,
    conditionBand: 'MONITOR',
    confidence: 'High confidence',
    reviewPriority: 'P3 — Monitor',
    priorityCode: 'P3',
    reasonCodes: ['Strong DGA deviation: oxygen concentration', 'Persistent or repeated anomaly behaviour'],
    engineeringAction: 'Continue monitoring, review repeated deviations, and confirm that sampling continuity supports interpretation.',
    robustnessStability: 'METHOD-SENSITIVE / UNCERTAIN',
    robustnessTag: 'SENSITIVE',
    robustnessRunRange: '23.27–53.46',
    robustnessTop3Count: '0/18',
    phasesCount: '3 phases',
  },
  {
    id: 'TX-K',
    observations: 28508,
    coverageDays: 1745.6,
    firstObs: '2010-09-27',
    latestObs: '2015-07-09',
    totalAnomalies: 466,
    totalAnomalyRate: 0.0163,
    episodes: 173,
    maxRun: 101,
    recentObs: 1619,
    recentAnomalies: 0,
    recentAnomalyRate: 0.0,
    daysSinceLatestAnomaly: 602.04,
    p95AnomalyScore: 0.079,
    maxAnomalyScore: 0.830,
    p95BaselineScore: 15.09,
    p95RecentBaselineScore: 7.76,
    trendDelta: 0.0016,
    missingRate: 0.0,
    medianGapHours: 1.0,
    largeGapRate: 0.00004,
    strongestReason: 'water_ppm_roll_std_3',
    components: { intensity: 0.077, persistence: 1.0, recency: 0.0, specificBaseline: 0.462, trend: 0.511 },
    conditionIndicator: 36.89,
    conditionBand: 'MONITOR',
    confidence: 'High confidence',
    reviewPriority: 'P3 — Monitor',
    priorityCode: 'P3',
    reasonCodes: ['Strong DGA deviation: water variability', 'Persistent or repeated anomaly behaviour (longest run 101)'],
    engineeringAction: 'Continue monitoring, review repeated deviations, and confirm that sampling continuity supports interpretation.',
    robustnessStability: 'MODERATELY STABLE',
    robustnessTag: 'MODERATELY STABLE',
    robustnessRunRange: '25.38–48.46',
    robustnessTop3Count: '0/18',
    phasesCount: '3 phases',
  },
]

export const REAL_GAS_SUMMARY = [
  { gas: 'Hydrogen (H₂)', formula: 'H2', measurements: '214,337', mean: '33.09 ppm', median: '19.4 ppm', p95: '118.6 ppm' },
  { gas: 'Methane (CH₄)', formula: 'CH4', measurements: '214,337', mean: '35.29 ppm', median: '31.6 ppm', p95: '94.9 ppm' },
  { gas: 'Acetylene (C₂H₂)', formula: 'C2H2', measurements: '214,337', mean: '0.39 ppm', median: '0.3 ppm', p95: '1.4 ppm' },
  { gas: 'Ethylene (C₂H₄)', formula: 'C2H4', measurements: '214,337', mean: '9.30 ppm', median: '7.3 ppm', p95: '23.7 ppm' },
  { gas: 'Ethane (C₂H₆)', formula: 'C2H6', measurements: '214,337', mean: '103.41 ppm', median: '35.8 ppm', p95: '421.8 ppm' },
  { gas: 'Carbon Monoxide (CO)', formula: 'CO', measurements: '214,337', mean: '197.37 ppm', median: '191.4 ppm', p95: '393.0 ppm' },
  { gas: 'Carbon Dioxide (CO₂)', formula: 'CO2', measurements: '214,337', mean: '1,388.70 ppm', median: '1,303.0 ppm', p95: '2,863.0 ppm' },
  { gas: 'Oxygen (O₂)', formula: 'O2', measurements: '205,721', mean: '2,014.88 ppm', median: '611.3 ppm', p95: '11,898.3 ppm' },
  { gas: 'Water (H₂O)', formula: 'H2O', measurements: '214,337', mean: '4.43 ppm', median: '3.6 ppm', p95: '9.0 ppm' },
]

export const MONTHLY_FLEET_DATA = [
  { m: '2010-07', obs: 2101, rate: 9.90, mean: 0.157 },
  { m: '2010-08', obs: 2232, rate: 9.27, mean: 0.136 },
  { m: '2010-09', obs: 2159, rate: 7.74, mean: 0.119 },
  { m: '2010-10', obs: 2981, rate: 5.80, mean: 0.095 },
  { m: '2010-11', obs: 2562, rate: 0.86, mean: 0.081 },
  { m: '2010-12', obs: 2860, rate: 4.30, mean: 0.108 },
  { m: '2011-01', obs: 3363, rate: 9.90, mean: 0.135 },
  { m: '2011-02', obs: 3227, rate: 0.00, mean: 0.080 },
  { m: '2011-03', obs: 3528, rate: 0.03, mean: 0.073 },
  { m: '2011-04', obs: 3881, rate: 0.05, mean: 0.073 },
  { m: '2011-05', obs: 4099, rate: 0.10, mean: 0.072 },
  { m: '2011-06', obs: 4192, rate: 1.60, mean: 0.081 },
  { m: '2011-07', obs: 4138, rate: 3.55, mean: 0.093 },
  { m: '2011-08', obs: 4279, rate: 2.69, mean: 0.088 },
  { m: '2011-09', obs: 3861, rate: 0.52, mean: 0.073 },
  { m: '2011-10', obs: 4288, rate: 3.52, mean: 0.077 },
  { m: '2011-11', obs: 3979, rate: 3.22, mean: 0.072 },
  { m: '2011-12', obs: 3905, rate: 0.05, mean: 0.062 },
  { m: '2012-01', obs: 3813, rate: 0.26, mean: 0.067 },
  { m: '2012-02', obs: 3941, rate: 7.05, mean: 0.118 },
  { m: '2012-03', obs: 3802, rate: 12.34, mean: 0.120 },
  { m: '2012-04', obs: 3958, rate: 7.00, mean: 0.103 },
  { m: '2012-05', obs: 4367, rate: 4.90, mean: 0.099 },
  { m: '2012-06', obs: 4254, rate: 2.21, mean: 0.109 },
  { m: '2012-07', obs: 4284, rate: 2.52, mean: 0.108 },
  { m: '2012-08', obs: 4258, rate: 2.02, mean: 0.103 },
  { m: '2012-09', obs: 4142, rate: 1.93, mean: 0.092 },
  { m: '2012-10', obs: 4290, rate: 0.84, mean: 0.088 },
  { m: '2012-11', obs: 4073, rate: 1.79, mean: 0.086 },
  { m: '2012-12', obs: 4487, rate: 0.98, mean: 0.084 },
  { m: '2013-01', obs: 4492, rate: 2.00, mean: 0.085 },
  { m: '2013-02', obs: 3873, rate: 5.60, mean: 0.103 },
  { m: '2013-03', obs: 2564, rate: 4.13, mean: 0.108 },
  { m: '2013-04', obs: 2367, rate: 4.52, mean: 0.111 },
  { m: '2013-05', obs: 2490, rate: 4.10, mean: 0.103 },
  { m: '2013-06', obs: 2368, rate: 4.05, mean: 0.107 },
  { m: '2013-07', obs: 2447, rate: 5.23, mean: 0.114 },
  { m: '2013-08', obs: 2697, rate: 13.53, mean: 0.141 },
  { m: '2013-09', obs: 2194, rate: 4.51, mean: 0.110 },
  { m: '2013-10', obs: 2249, rate: 6.00, mean: 0.123 },
  { m: '2013-11', obs: 2781, rate: 6.44, mean: 0.131 },
  { m: '2013-12', obs: 3009, rate: 3.22, mean: 0.122 },
  { m: '2014-01', obs: 2989, rate: 3.58, mean: 0.125 },
  { m: '2014-02', obs: 2687, rate: 3.39, mean: 0.120 },
  { m: '2014-03', obs: 2975, rate: 3.16, mean: 0.123 },
  { m: '2014-04', obs: 2842, rate: 3.55, mean: 0.129 },
  { m: '2014-05', obs: 2976, rate: 3.63, mean: 0.131 },
  { m: '2014-06', obs: 2881, rate: 7.39, mean: 0.141 },
  { m: '2014-07', obs: 2984, rate: 11.60, mean: 0.149 },
  { m: '2014-08', obs: 2525, rate: 12.40, mean: 0.154 },
  { m: '2014-09', obs: 2886, rate: 11.82, mean: 0.164 },
  { m: '2014-10', obs: 3130, rate: 7.41, mean: 0.132 },
  { m: '2014-11', obs: 4154, rate: 8.43, mean: 0.125 },
  { m: '2014-12', obs: 4085, rate: 8.81, mean: 0.135 },
  { m: '2015-01', obs: 3524, rate: 9.42, mean: 0.143 },
  { m: '2015-02', obs: 3196, rate: 10.45, mean: 0.143 },
  { m: '2015-03', obs: 3533, rate: 6.88, mean: 0.140 },
  { m: '2015-04', obs: 3385, rate: 7.18, mean: 0.147 },
  { m: '2015-05', obs: 3654, rate: 8.57, mean: 0.157 },
  { m: '2015-06', obs: 3082, rate: 16.19, mean: 0.176 },
  { m: '2015-07', obs: 891, rate: 20.31, mean: 0.181 },
]

export const REAL_REASON_DISTRIBUTION = [
  { reason: 'ethane_ppm_roll_std_3', pct: 14.18, label: 'Ethane rolling variability' },
  { reason: 'hydrogen_ppm_delta', pct: 12.14, label: 'Hydrogen first delta' },
  { reason: 'ethylene_ppm_delta', pct: 9.56, label: 'Ethylene first delta' },
  { reason: 'ethane_ppm_log1p', pct: 8.37, label: 'Ethane log concentration' },
  { reason: 'oxygen_ppm_roll_std_3', pct: 6.26, label: 'Oxygen rolling variability' },
  { reason: 'carbon_monoxide_ppm_delta', pct: 5.81, label: 'Carbon monoxide delta' },
  { reason: 'water_ppm_roll_std_3', pct: 4.92, label: 'Water rolling variability' },
  { reason: 'carbon_dioxide_ppm_log1p', pct: 4.15, label: 'Carbon dioxide concentration' },
  { reason: 'hydrogen_ppm_log1p', pct: 3.90, label: 'Hydrogen concentration' },
]

export const PHASE12_METHODS = [
  { name: 'Isolation Forest (Fleet Baseline)', spearman: '1.000', kendall: '1.000', top3: '1.000', priorityAgreement: '1.000', type: 'Fleet global model' },
  { name: 'Transformer-Specific Robust MAD', spearman: '0.996', kendall: '0.985', top3: '0.200', priorityAgreement: '0.308', type: 'Asset-specific distribution' },
  { name: 'Within-Transformer Percentile', spearman: '0.997', kendall: '0.987', top3: '0.500', priorityAgreement: '0.615', type: 'Asset-specific empirical rank' },
]

export const PHASE12_THRESHOLDS = [
  { cut: 'Top 1.0%', rows: '2,033', topAssets: 'TX-M → TX-I → TX-J', changes: '2 priority changes' },
  { cut: 'Top 2.5%', rows: '5,081', topAssets: 'TX-I → TX-M → TX-J', changes: '1 priority change' },
  { cut: 'Top 5.0% (Baseline)', rows: '10,161', topAssets: 'TX-I → TX-M → TX-J', changes: '0 (Reference baseline)' },
  { cut: 'Top 7.5%', rows: '15,241', topAssets: 'TX-I → TX-M → TX-J', changes: '0 priority changes' },
  { cut: 'Top 10.0%', rows: '20,322', topAssets: 'TX-I → TX-M → TX-J', changes: '2 priority changes' },
]

export const SYNTHETIC_METRICS = [
  { model: 'Logistic Regression', precision: '0.655', recall: '0.662', f1: '0.659', roc_auc: '0.652', pr_auc: '0.648', accuracy: '0.636' },
  { model: 'Random Forest', precision: '0.618', recall: '0.681', f1: '0.648', roc_auc: '0.592', pr_auc: '0.608', accuracy: '0.607' },
]

export const SYNTHETIC_PREDICTIONS = [
  { asset: 'TX-010', probability: '72.9%', band: 'Elevated', health: '59.9', priority: 'P1', action: 'Prioritise engineering review of recent operating history and maintenance records.' },
  { asset: 'TX-011', probability: '63.7%', band: 'Moderate', health: '65.0', priority: 'P2', action: 'Review recent trend windows and confirm data quality before changing inspection cadence.' },
  { asset: 'TX-008', probability: '58.7%', band: 'Moderate', health: '67.7', priority: 'P3', action: 'Review recent trend windows and confirm data quality before changing inspection cadence.' },
  { asset: 'TX-009', probability: '57.3%', band: 'Moderate', health: '68.5', priority: 'P4', action: 'Review recent trend windows and confirm data quality before changing inspection cadence.' },
  { asset: 'TX-007', probability: '55.7%', band: 'Moderate', health: '69.4', priority: 'P5', action: 'Review recent trend windows and confirm data quality before changing inspection cadence.' },
]

export const SYNTHETIC_GLOBAL_FEATURES = [
  { name: 'maintenance_age_days', value: '26.6%' },
  { name: 'transformer_age_years', value: '10.3%' },
  { name: 'oil_temp_c_roll_max_12h', value: '7.7%' },
  { name: 'load_pct_roll_std_6h', value: '4.6%' },
  { name: 'oil_temp_c_roll_mean_12h', value: '4.0%' },
]

// ============================================================
// HELPER UTILITIES
// ============================================================

const icon = (name: string): string => {
  const paths: Record<string, string> = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.1 7.8 7.5 9.5 4.4-1.7 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
    pulse: '<path d="M3 12h4l2.2-6 4.2 12 2.2-6H21"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    chevron: '<path d="m7 10 5 5 5-5"/>',
    alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  }
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] ?? paths.arrow}</svg>`
}

// Generate SVG Line Chart for Fleet Monthly Anomaly Proxy Rates
export function renderFleetMonthlySvg(): string {
  const width = 860
  const height = 240
  const padL = 45
  const padR = 25
  const padT = 20
  const padB = 40
  const plotW = width - padL - padR
  const plotH = height - padT - padB
  const maxRate = 22

  const points = MONTHLY_FLEET_DATA.map((d, i) => {
    const x = padL + (i / (MONTHLY_FLEET_DATA.length - 1)) * plotW
    const y = padT + plotH - (d.rate / maxRate) * plotH
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaD = `${pathD} L ${(padL + plotW).toFixed(1)} ${(padT + plotH).toFixed(1)} L ${padL.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`

  // Grid lines
  const gridLines = [0, 5, 10, 15, 20].map((v) => {
    const y = padT + plotH - (v / maxRate) * plotH
    return `<line x1="${padL}" y1="${y}" x2="${padL + plotW}" y2="${y}" stroke="var(--line)" stroke-dasharray="3 3"/>
            <text x="${padL - 8}" y="${y + 3}" fill="var(--muted)" font-size="9" text-anchor="end" font-family="var(--mono)">${v}%</text>`
  }).join('')

  // Year markers
  const yearMarkers = ['2010', '2011', '2012', '2013', '2014', '2015'].map((yr, idx) => {
    const x = padL + (idx / 5) * plotW
    return `<text x="${x}" y="${padT + plotH + 20}" fill="var(--muted)" font-size="10" text-anchor="middle" font-family="var(--mono)">${yr}</text>
            <line x1="${x}" y1="${padT + plotH}" x2="${x}" y2="${padT + plotH + 5}" stroke="var(--line)"/>`
  }).join('')

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Monthly Fleet Anomaly Proxy Rate Chart">
      <defs>
        <linearGradient id="fleetAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#00e5ff" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      ${yearMarkers}
      <path d="${areaD}" fill="url(#fleetAreaGrad)"/>
      <path d="${pathD}" fill="none" stroke="#00e5ff" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Key Callout: July 2015 Peak (20.31%) -->
      <circle cx="${points[points.length - 1].x}" cy="${points[points.length - 1].y}" r="4.5" fill="#f59e0b" stroke="#080d1a" stroke-width="2"/>
      <text x="${points[points.length - 1].x - 10}" y="${points[points.length - 1].y - 10}" fill="#f59e0b" font-size="10" font-weight="600" text-anchor="end" font-family="var(--mono)">Peak: 20.31% (Jul 2015)</text>
      <!-- Reference Baseline 5% line -->
      <line x1="${padL}" y1="${padT + plotH - (5 / maxRate) * plotH}" x2="${padL + plotW}" y2="${padT + plotH - (5 / maxRate) * plotH}" stroke="#10b981" stroke-width="1.2" stroke-dasharray="4 2"/>
      <text x="${padL + 12}" y="${padT + plotH - (5 / maxRate) * plotH - 5}" fill="#10b981" font-size="9" font-family="var(--mono)">5.0% Fleet Average Anomaly Proxy</text>
    </svg>
  `
}

// Generate SVG Component Radar / Bar comparison for the selected asset
export function renderAssetComponentsSvg(asset: TransformerSummary): string {
  const width = 460
  const height = 190
  const labels = [
    { name: 'Intensity (30%)', val: asset.components.intensity, weight: '30%' },
    { name: 'Persistence (20%)', val: asset.components.persistence, weight: '20%' },
    { name: 'Recency (20%)', val: asset.components.recency, weight: '20%' },
    { name: 'Specific Baseline (15%)', val: asset.components.specificBaseline, weight: '15%' },
    { name: 'Trend / Delta (15%)', val: asset.components.trend, weight: '15%' },
  ]

  const bars = labels.map((item, i) => {
    const y = 20 + i * 32
    const barW = Math.max(2, Math.round(item.val * 240))
    const pct = Math.round(item.val * 100)
    return `
      <g>
        <text x="10" y="${y + 11}" fill="var(--paper-2)" font-size="10.5" font-family="var(--mono)">${item.name}</text>
        <rect x="175" y="${y}" width="240" height="14" rx="3" fill="#1e293b"/>
        <rect x="175" y="${y}" width="${barW}" height="14" rx="3" fill="${item.val > 0.75 ? '#f43f5e' : item.val > 0.4 ? '#00e5ff' : '#10b981'}"/>
        <text x="${175 + barW + 8}" y="${y + 11}" fill="var(--paper)" font-size="10.5" font-weight="600" font-family="var(--mono)">${pct}%</text>
      </g>
    `
  }).join('')

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Component Decomposition Chart">
      ${bars}
    </svg>
  `
}

// Generate SVG Persistence Comparison Chart for all 13 Transformers
export function renderFleetPersistenceSvg(): string {
  const width = 860
  const height = 210
  const padL = 40
  const padR = 20
  const padT = 20
  const padB = 40
  const plotW = width - padL - padR
  const plotH = height - padT - padB
  const maxRun = 450

  const bars = REAL_TRANSFORMERS.map((t, idx) => {
    const barW = Math.max(16, (plotW / REAL_TRANSFORMERS.length) - 14)
    const x = padL + idx * (plotW / REAL_TRANSFORMERS.length) + 6
    const barH = (t.maxRun / maxRun) * plotH
    const y = padT + plotH - barH
    const color = t.maxRun > 100 ? '#f59e0b' : t.maxRun > 20 ? '#00e5ff' : '#64748b'

    return `
      <g>
        <rect x="${x}" y="${y}" width="${barW}" height="${Math.max(2, barH)}" rx="3" fill="${color}"/>
        <text x="${x + barW / 2}" y="${y - 6}" fill="var(--paper)" font-size="9.5" font-weight="600" text-anchor="middle" font-family="var(--mono)">${t.maxRun}</text>
        <text x="${x + barW / 2}" y="${padT + plotH + 18}" fill="var(--paper-2)" font-size="10" font-weight="500" text-anchor="middle" font-family="var(--mono)">${t.id}</text>
      </g>
    `
  }).join('')

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Fleet Longest Consecutive Anomaly Run">
      <line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="var(--line)"/>
      ${bars}
    </svg>
  `
}

// ============================================================
// APPLICATION STATE MANAGEMENT
// ============================================================

class DashboardState {
  selectedAssetId: string = 'TX-I'
  filterPriority: string = 'ALL'
  filterBand: string = 'ALL'
  filterConfidence: string = 'ALL'
  searchQuery: string = ''
  activeSyntheticTab: 'evaluation' | 'risk' | 'explainability' | 'maintenance' = 'evaluation'
  activeMethodologyTab: 'pipeline' | 'gates' | 'differences' = 'pipeline'

  getSelectedAsset(): TransformerSummary {
    return REAL_TRANSFORMERS.find((t) => t.id === this.selectedAssetId) || REAL_TRANSFORMERS[0]
  }

  getFilteredTransformers(): TransformerSummary[] {
    return REAL_TRANSFORMERS.filter((t) => {
      if (this.filterPriority !== 'ALL' && t.priorityCode !== this.filterPriority) return false
      if (this.filterBand !== 'ALL' && t.conditionBand !== this.filterBand) return false
      if (this.filterConfidence !== 'ALL' && !t.confidence.startsWith(this.filterConfidence)) return false
      if (this.searchQuery.trim() !== '') {
        const q = this.searchQuery.toLowerCase()
        const matchId = t.id.toLowerCase().includes(q)
        const matchReason = t.strongestReason.toLowerCase().includes(q)
        if (!matchId && !matchReason) return false
      }
      return true
    })
  }
}

const state = new DashboardState()

// ============================================================
// UI RENDERERS
// ============================================================

export function renderApp(): void {
  const root = document.querySelector<HTMLDivElement>('#app')
  if (!root) return

  const selectedAsset = state.getSelectedAsset()
  const filteredList = state.getFilteredTransformers()

  root.innerHTML = `
    <div class="site-shell">
      <!-- TOP GLOBAL APP BAR -->
      <header class="topbar">
        <a class="brand" href="#overview" aria-label="GridWatch Home">
          <span class="brand-mark"><i></i><i></i><b></b></span>
          <span class="brand-name">Grid<span>Watch</span></span>
          <span class="brand-sub">Health Intelligence</span>
        </a>

        <div class="topbar-meta">
          <span class="live-dot"></span>
          <span class="badge-real">REAL UK DGA DATA</span>
          <span class="meta-divider"></span>
          <span class="badge-gate">TARGET GATE LOCKED (NO FAILURE LABELS)</span>
          <span class="meta-divider"></span>
          <span class="badge-seed">PHASE 13 INTEGRATED</span>
        </div>

        <div class="topbar-actions">
          <label class="topbar-select-wrap">
            <span class="tiny-label">TX JUMPER:</span>
            <select id="quick-asset-select" aria-label="Quick Select Transformer">
              ${REAL_TRANSFORMERS.map((t) => `<option value="${t.id}" ${t.id === selectedAsset.id ? 'selected' : ''}>${t.id} (${t.priorityCode} · ${t.conditionBand})</option>`).join('')}
            </select>
          </label>
          <a class="button button-primary" href="#review-queue">Review Queue ${icon('arrow')}</a>
        </div>
      </header>

      <div class="page-grid">
        <!-- STICKY SIDE RAIL NAVIGATION -->
        <aside class="side-rail" aria-label="Sections Navigation">
          <div class="rail-stamp">GRIDWATCH / P13</div>
          <nav class="rail-nav">
            <a href="#overview" class="rail-nav-link" data-section="overview"><span class="rail-num">01</span><span class="rail-txt">Overview</span></a>
            <a href="#real-monitoring" class="rail-nav-link" data-section="real-monitoring"><span class="rail-num">02</span><span class="rail-txt">DGA Monitoring</span></a>
            <a href="#review-queue" class="rail-nav-link" data-section="review-queue"><span class="rail-num">03</span><span class="rail-txt">Review Queue</span></a>
            <a href="#transformer-detail" class="rail-nav-link" data-section="transformer-detail"><span class="rail-num">04</span><span class="rail-txt">TX Detail</span></a>
            <a href="#condition-assessment" class="rail-nav-link" data-section="condition-assessment"><span class="rail-num">05</span><span class="rail-txt">Condition Bands</span></a>
            <a href="#dga-trends" class="rail-nav-link" data-section="dga-trends"><span class="rail-num">06</span><span class="rail-txt">DGA Trends</span></a>
            <a href="#explainability" class="rail-nav-link" data-section="explainability"><span class="rail-num">07</span><span class="rail-txt">Reason Codes</span></a>
            <a href="#robustness" class="rail-nav-link" data-section="robustness"><span class="rail-num">08</span><span class="rail-txt">Robustness (P12)</span></a>
            <a href="#synthetic-lab" class="rail-nav-link" data-section="synthetic-lab"><span class="rail-num">09</span><span class="rail-txt">Synthetic ML</span></a>
            <a href="#methodology" class="rail-nav-link" data-section="methodology"><span class="rail-num">10</span><span class="rail-txt">Methodology</span></a>
            <a href="#limitations" class="rail-nav-link" data-section="limitations"><span class="rail-num">11</span><span class="rail-txt">Limitations</span></a>
          </nav>
          <div class="rail-bottom">
            <span class="rail-year">2026</span>
          </div>
        </aside>

        <!-- MAIN DASHBOARD CONTENT -->
        <main class="main-content">
          
          <!-- SECTION 1: OVERVIEW PAGE -->
          <section id="overview" class="section-pad hero-section">
            <div class="hero-copy">
              <div class="kicker-pill"><span class="kicker-dot"></span> 01 · SYSTEM OVERVIEW</div>
              <h1 class="hero-title">GridWatch<br/><em>Transformer Health Intelligence</em></h1>
              <p class="hero-subtitle">Data-driven DGA anomaly and condition-monitoring decision-support prototype</p>
              <p class="hero-description">
                GridWatch integrates validated unsupervised DGA anomaly screening, transformer-specific baseline evaluation, and multi-factor condition prioritisation across 13 high-voltage transformers in the UK power-station network (2010–2015).
              </p>
              
              <!-- Prominent Responsible-Use Disclaimer Banner -->
              <div class="responsible-banner" role="alert">
                <div class="banner-icon">${icon('shield')}</div>
                <div class="banner-body">
                  <strong>RESPONSIBLE USE & EVIDENCE BOUNDARY</strong>
                  <p>
                    This system provides analytical screening information intended to support qualified engineering review. It is not a diagnosis, failure probability, engineering standard, or autonomous maintenance decision.
                  </p>
                </div>
              </div>

              <div class="hero-actions">
                <a class="button button-primary" href="#review-queue">Open Review Queue ${icon('arrow')}</a>
                <a class="button button-secondary" href="#robustness">Inspect Robustness ${icon('arrow')}</a>
                <a class="button button-ghost" href="#methodology">View Methodology</a>
              </div>
            </div>

            <div class="hero-stats-panel">
              <div class="stat-card featured-stat">
                <span class="stat-label">TOTAL TRANSFORMERS</span>
                <strong class="stat-value">13</strong>
                <span class="stat-sub">Real UK power station fleet</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">RAW OBSERVATIONS</span>
                <strong class="stat-value">316,203</strong>
                <span class="stat-sub">1.92M normalized DGA points</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">SCORED FEATURE ROWS</span>
                <strong class="stat-value">203,214</strong>
                <span class="stat-sub">48 engineered gas features</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">TEMPORAL SPAN</span>
                <strong class="stat-value">2010 → 2015</strong>
                <span class="stat-sub">5 years continuous telemetry</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">P1 HIGH REVIEW</span>
                <strong class="stat-value text-rose">2 ASSETS</strong>
                <span class="stat-sub">TX-I (90.72) · TX-M (80.40)</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">P2 REVIEW</span>
                <strong class="stat-value text-cyan">6 ASSETS</strong>
                <span class="stat-sub">TX-J · TX-L · TX-F · TX-D · TX-C · TX-A</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">P3 MONITOR</span>
                <strong class="stat-value text-amber">5 ASSETS</strong>
                <span class="stat-sub">TX-H · TX-E · TX-G · TX-B · TX-K</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">DATA CONFIDENCE</span>
                <strong class="stat-value text-emerald">11 HIGH / 1 MOD / 1 LIM</strong>
                <span class="stat-sub">TX-J limited by 40.27% missingness</span>
              </div>
            </div>
          </section>

          <!-- SECTION 2: REAL DGA MONITORING -->
          <section id="real-monitoring" class="section-pad section-dark">
            <div class="section-head">
              <div>
                <div class="kicker-pill"><span class="kicker-dot"></span> 02 · REAL DGA MONITORING</div>
                <h2>Fleet Telemetry & <em>Gas Distribution</em></h2>
              </div>
              <div class="chip-badge chip-real">REAL UK DGA DATA</div>
            </div>

            <p class="section-lede">
              The real UK DGA dataset comprises 9 dissolved gas families measured in parts-per-million (ppm). Telemetry is irregular across assets with intervals between 1 to 4 hours. No load, temperature, or outage variables exist.
            </p>

            <!-- Gas Distributions Table -->
            <div class="card table-card">
              <div class="card-header">
                <h3>9 Dissolved Gas Families Across Scored Telemetry</h3>
                <span class="badge-neutral">Validated Source Metadata</span>
              </div>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Gas Family</th>
                      <th>Formula</th>
                      <th>Valid Measurements</th>
                      <th>Mean (ppm)</th>
                      <th>Median (ppm)</th>
                      <th>P95 Baseline (ppm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${REAL_GAS_SUMMARY.map((g) => `
                      <tr>
                        <td><strong>${g.gas}</strong></td>
                        <td><code>${g.formula}</code></td>
                        <td>${g.measurements}</td>
                        <td>${g.mean}</td>
                        <td>${g.median}</td>
                        <td class="text-cyan font-bold">${g.p95}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <p class="footnote">
                * Note: Oxygen (O₂) has 205,721 non-null observations; all other gases contain 214,337 valid raw observations. Feature engineering calculates log1p transforms, trailing deltas, rolling 3-period means, and rolling standard deviations.
              </p>
            </div>
          </section>

          <!-- SECTION 3: TRANSFORMER REVIEW QUEUE -->
          <section id="review-queue" class="section-pad">
            <div class="section-head">
              <div>
                <div class="kicker-pill"><span class="kicker-dot"></span> 03 · ENGINEERING REVIEW QUEUE</div>
                <h2>Prioritised Transformer <em>Worklist</em></h2>
              </div>
              <div class="chip-badge chip-real">REAL UK DGA DATA</div>
            </div>

            <p class="section-lede">
              Transformers are ranked by Phase 11 multi-factor Condition Indicator and sorted primarily by Review Priority (P1 → P2 → P3 → P4). High indicator scores reflect concentrated recent anomaly activity and baseline deviations, not guaranteed equipment failure.
            </p>

            <!-- Interactive Filter Controls -->
            <div class="filter-toolbar">
              <div class="filter-group">
                <label for="filter-priority" class="filter-label">Priority:</label>
                <select id="filter-priority" class="filter-select">
                  <option value="ALL" ${state.filterPriority === 'ALL' ? 'selected' : ''}>All Priorities (P1–P3)</option>
                  <option value="P1" ${state.filterPriority === 'P1' ? 'selected' : ''}>P1 (High Review)</option>
                  <option value="P2" ${state.filterPriority === 'P2' ? 'selected' : ''}>P2 (Review)</option>
                  <option value="P3" ${state.filterPriority === 'P3' ? 'selected' : ''}>P3 (Monitor)</option>
                </select>
              </div>

              <div class="filter-group">
                <label for="filter-band" class="filter-label">Condition Band:</label>
                <select id="filter-band" class="filter-select">
                  <option value="ALL" ${state.filterBand === 'ALL' ? 'selected' : ''}>All Bands</option>
                  <option value="HIGH REVIEW" ${state.filterBand === 'HIGH REVIEW' ? 'selected' : ''}>HIGH REVIEW (75–100)</option>
                  <option value="REVIEW" ${state.filterBand === 'REVIEW' ? 'selected' : ''}>REVIEW (50–<75)</option>
                  <option value="MONITOR" ${state.filterBand === 'MONITOR' ? 'selected' : ''}>MONITOR (25–<50)</option>
                </select>
              </div>

              <div class="filter-group">
                <label for="filter-confidence" class="filter-label">Confidence:</label>
                <select id="filter-confidence" class="filter-select">
                  <option value="ALL" ${state.filterConfidence === 'ALL' ? 'selected' : ''}>All Levels</option>
                  <option value="High" ${state.filterConfidence === 'High' ? 'selected' : ''}>High Confidence</option>
                  <option value="Moderate" ${state.filterConfidence === 'Moderate' ? 'selected' : ''}>Moderate Confidence</option>
                  <option value="Limited" ${state.filterConfidence === 'Limited' ? 'selected' : ''}>Limited Confidence</option>
                </select>
              </div>

              <div class="filter-search">
                <input type="text" id="filter-search-input" placeholder="Search transformer ID or reason..." value="${state.searchQuery}"/>
              </div>
            </div>

            <!-- Review Queue Table -->
            <div class="card table-card">
              <div class="table-responsive">
                <table class="data-table review-table">
                  <thead>
                    <tr>
                      <th>Transformer</th>
                      <th>Condition Indicator</th>
                      <th>Condition Band</th>
                      <th>Review Priority</th>
                      <th>Confidence</th>
                      <th>Recent Anomaly (180d)</th>
                      <th>Persistence (Run)</th>
                      <th>Strongest Reason</th>
                      <th>Methodological Stability</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredList.length === 0 ? `
                      <tr>
                        <td colspan="10" class="text-center py-6">
                          <p class="text-muted">No transformers match the selected filters.</p>
                          <button class="button button-ghost" id="reset-filters-btn">Reset All Filters</button>
                        </td>
                      </tr>
                    ` : filteredList.map((t) => `
                      <tr class="tx-row ${t.id === selectedAsset.id ? 'row-active' : ''}" data-tx-id="${t.id}">
                        <td>
                          <div class="tx-id-badge">
                            <strong>${t.id}</strong>
                            <small>${t.phasesCount}</small>
                          </div>
                        </td>
                        <td>
                          <div class="indicator-meter-wrap">
                            <span class="indicator-num">${t.conditionIndicator.toFixed(2)}</span>
                            <div class="indicator-track">
                              <div class="indicator-fill ${t.conditionBand === 'HIGH REVIEW' ? 'fill-rose' : t.conditionBand === 'REVIEW' ? 'fill-cyan' : 'fill-amber'}" style="width: ${t.conditionIndicator}%"></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="band-tag band-${t.conditionBand.toLowerCase().replace(' ', '-')}">${t.conditionBand}</span>
                        </td>
                        <td>
                          <span class="priority-badge priority-${t.priorityCode.toLowerCase()}">${t.priorityCode}</span>
                        </td>
                        <td>
                          <span class="confidence-badge ${t.confidence.startsWith('Limited') ? 'conf-limited' : t.confidence.startsWith('Moderate') ? 'conf-mod' : 'conf-high'}">${t.confidence.replace(' confidence', '')}</span>
                        </td>
                        <td>
                          <div class="recent-stat">
                            <strong>${t.recentAnomalies} flags</strong>
                            <small>${(t.recentAnomalyRate * 100).toFixed(1)}% rate</small>
                          </div>
                        </td>
                        <td>
                          <strong>${t.maxRun} obs</strong>
                        </td>
                        <td>
                          <code class="reason-code-tag">${t.strongestReason}</code>
                        </td>
                        <td>
                          <span class="stability-tag stability-${t.robustnessTag.toLowerCase().replace(' ', '-')}">${t.robustnessStability}</span>
                        </td>
                        <td>
                          <button class="button button-sm button-select-tx" data-tx-id="${t.id}">
                            ${t.id === selectedAsset.id ? 'Selected' : 'Inspect'}
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- SECTION 4: TRANSFORMER DETAIL PAGE -->
          <section id="transformer-detail" class="section-pad section-dark">
            <div class="section-head">
              <div>
                <div class="kicker-pill"><span class="kicker-dot"></span> 04 · TRANSFORMER DETAIL</div>
                <h2>Deep Dive: <em>${selectedAsset.id}</em></h2>
              </div>
              <div class="asset-header-badges">
                <span class="priority-badge priority-${selectedAsset.priorityCode.toLowerCase()}">${selectedAsset.priorityCode}</span>
                <span class="band-tag band-${selectedAsset.conditionBand.toLowerCase().replace(' ', '-')}">${selectedAsset.conditionBand}</span>
                <span class="confidence-badge ${selectedAsset.confidence.startsWith('Limited') ? 'conf-limited' : 'conf-high'}">${selectedAsset.confidence}</span>
              </div>
            </div>

            <!-- Detail Grid -->
            <div class="detail-grid">
              
              <!-- Column 1: Core Metrics & Indicators -->
              <div class="card">
                <div class="card-header">
                  <h3>Condition & Baseline Profile</h3>
                  <span class="badge-neutral">P11 Analytical Score</span>
                </div>

                <div class="score-display">
                  <div class="score-main">
                    <span class="score-label">CONDITION INDICATOR</span>
                    <strong class="score-big ${selectedAsset.conditionBand === 'HIGH REVIEW' ? 'text-rose' : selectedAsset.conditionBand === 'REVIEW' ? 'text-cyan' : 'text-amber'}">${selectedAsset.conditionIndicator.toFixed(2)} / 100</strong>
                    <span class="score-caption">Composite screening rank across 13 fleet assets</span>
                  </div>
                  <div class="score-bar-wrap">
                    <div class="score-bar-fill ${selectedAsset.conditionBand === 'HIGH REVIEW' ? 'fill-rose' : selectedAsset.conditionBand === 'REVIEW' ? 'fill-cyan' : 'fill-amber'}" style="width: ${selectedAsset.conditionIndicator}%"></div>
                  </div>
                </div>

                <div class="metrics-subgrid">
                  <div class="metric-item">
                    <span class="m-label">Total Observations</span>
                    <strong class="m-val">${selectedAsset.observations.toLocaleString()}</strong>
                  </div>
                  <div class="metric-item">
                    <span class="m-label">Historical Coverage</span>
                    <strong class="m-val">${selectedAsset.coverageDays.toFixed(1)} days (${selectedAsset.firstObs} → ${selectedAsset.latestObs})</strong>
                  </div>
                  <div class="metric-item">
                    <span class="m-label">Recent 180d Flags</span>
                    <strong class="m-val ${selectedAsset.recentAnomalies > 0 ? 'text-rose' : 'text-muted'}">${selectedAsset.recentAnomalies} (${(selectedAsset.recentAnomalyRate * 100).toFixed(1)}%)</strong>
                  </div>
                  <div class="metric-item">
                    <span class="m-label">Longest Anomaly Run</span>
                    <strong class="m-val">${selectedAsset.maxRun} consecutive obs</strong>
                  </div>
                  <div class="metric-item">
                    <span class="m-label">Days Since Last Flag</span>
                    <strong class="m-val">${selectedAsset.daysSinceLatestAnomaly.toFixed(2)} days</strong>
                  </div>
                  <div class="metric-item">
                    <span class="m-label">Fleet P95 Score</span>
                    <strong class="m-val">${selectedAsset.p95AnomalyScore.toFixed(3)} (Max: ${selectedAsset.maxAnomalyScore.toFixed(3)})</strong>
                  </div>
                  <div class="metric-item">
                    <span class="m-label">Asset Baseline P95</span>
                    <strong class="m-val">${selectedAsset.p95BaselineScore.toFixed(2)} (Recent: ${selectedAsset.p95RecentBaselineScore.toFixed(2)})</strong>
                  </div>
                  <div class="metric-item">
                    <span class="m-label">Missingness & Sampling</span>
                    <strong class="m-val ${selectedAsset.missingRate > 0 ? 'text-amber' : 'text-emerald'}">${(selectedAsset.missingRate * 100).toFixed(1)}% missing · ${selectedAsset.medianGapHours}h median gap</strong>
                  </div>
                </div>
              </div>

              <!-- Column 2: 5-Component Decomposition & Action -->
              <div class="card">
                <div class="card-header">
                  <h3>Component Contribution Weights</h3>
                  <span class="badge-neutral">Formula Breakdown</span>
                </div>

                <div class="component-chart-wrap">
                  ${renderAssetComponentsSvg(selectedAsset)}
                </div>

                <div class="reasons-box">
                  <h4>Evidence-Bound Deviation Reasons</h4>
                  <ul class="reasons-list">
                    ${selectedAsset.reasonCodes.map((r) => `<li><span class="reason-bullet"></span>${r}</li>`).join('')}
                  </ul>
                </div>

                <div class="action-card">
                  <div class="action-icon">${icon('pulse')}</div>
                  <div class="action-body">
                    <strong>RECOMMENDED ENGINEERING-REVIEW ACTION</strong>
                    <p>${selectedAsset.engineeringAction}</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          <!-- SECTION 5: CONDITION ASSESSMENT METHODOLOGY -->
          <section id="condition-assessment" class="section-pad">
            <div class="section-head">
              <div>
                <div class="kicker-pill"><span class="kicker-dot"></span> 05 · CONDITION ASSESSMENT</div>
                <h2>Condition Indicator <em>Bands & Formula</em></h2>
              </div>
              <div class="chip-badge chip-real">PHASE 11 METHODOLOGY</div>
            </div>

            <p class="section-lede">
              The condition indicator is a prototype analytical screening metric that combines fleet anomaly intensity (30%), persistence (20%), recency (20%), transformer-specific baseline deviation (15%), and trend (15%).
            </p>

            <div class="bands-grid">
              <div class="card band-card band-card-high">
                <div class="band-header">
                  <span class="band-tag band-high-review">HIGH REVIEW</span>
                  <span class="band-range">75 – 100</span>
                </div>
                <h4>Concentrated Anomaly Activity</h4>
                <p>High anomaly frequency in the recent 180-day window, prolonged consecutive episode runs, and strong deviation from transformer historical baseline.</p>
                <div class="band-count"><strong>2</strong> Assets (TX-I, TX-M) + TX-J (Capped to P2 due to missingness)</div>
              </div>

              <div class="card band-card band-card-review">
                <div class="band-header">
                  <span class="band-tag band-review">REVIEW</span>
                  <span class="band-range">50 – <75</span>
                </div>
                <h4>Elevated Deviation / Persistence</h4>
                <p>Notable deviation from fleet or transformer baseline, moderate persistence history, or recent anomaly activity warranting engineering check.</p>
                <div class="band-count"><strong>5</strong> Assets (TX-L, TX-F, TX-D, TX-C, TX-A)</div>
              </div>

              <div class="card band-card band-card-monitor">
                <div class="band-header">
                  <span class="band-tag band-monitor">MONITOR</span>
                  <span class="band-range">25 – <50</span>
                </div>
                <h4>Routine Historical Variation</h4>
                <p>Low or zero recent anomaly flags, older historical isolated spikes, and stable gas concentration trends conforming to normal fleet baseline.</p>
                <div class="band-count"><strong>5</strong> Assets (TX-H, TX-E, TX-G, TX-B, TX-K)</div>
              </div>

              <div class="card band-card band-card-normal">
                <div class="band-header">
                  <span class="band-tag band-normal">NORMAL</span>
                  <span class="band-range">0 – <25</span>
                </div>
                <h4>Baseline Quiescence</h4>
                <p>Zero anomaly flags, low variance across all 9 gas families, and perfect sampling continuity. (No real assets fell below 25 in Phase 11).</p>
                <div class="band-count"><strong>0</strong> Assets</div>
              </div>
            </div>
          </section>

          <!-- SECTION 6: DGA TRENDS VISUALISATIONS -->
          <section id="dga-trends" class="section-pad section-dark">
            <div class="section-head">
              <div>
                <div class="kicker-pill"><span class="kicker-dot"></span> 06 · DGA TREND VISUALISATIONS</div>
                <h2>Fleet & Transformer <em>Historical Trends</em></h2>
              </div>
              <div class="chip-badge chip-real">REAL UK DGA DATA (2010–2015)</div>
            </div>

            <!-- Chart 1: Fleet Monthly Anomaly Proxy Rate -->
            <div class="card chart-card mb-8">
              <div class="card-header">
                <div>
                  <h3>Monthly Fleet Anomaly Proxy Rate (2010–2015)</h3>
                  <span class="text-muted text-xs">Percentage of scored telemetry flagged in top 5% Isolation Forest threshold</span>
                </div>
                <div class="chart-legend">
                  <span class="legend-item"><i class="legend-color bg-cyan"></i> Fleet Proxy Rate (%)</span>
                  <span class="legend-item"><i class="legend-color bg-emerald"></i> 5.0% Baseline Reference</span>
                </div>
              </div>
              <div class="svg-container">
                ${renderFleetMonthlySvg()}
              </div>
              <p class="footnote">
                Historical peak occurred in July 2015 (20.31% proxy rate), driven by simultaneous anomaly episodes on TX-I and TX-M.
              </p>
            </div>

            <!-- Chart 2: Fleet Longest Consecutive Anomaly Run -->
            <div class="card chart-card">
              <div class="card-header">
                <div>
                  <h3>Maximum Consecutive Anomaly Run Length Across Fleet</h3>
                  <span class="text-muted text-xs">Longest uninterrupted sequence of top-5% anomaly flags (Number of observations)</span>
                </div>
                <div class="chart-legend">
                  <span class="legend-item"><i class="legend-color bg-amber"></i> High Persistence (>100)</span>
                  <span class="legend-item"><i class="legend-color bg-cyan"></i> Moderate (>20)</span>
                  <span class="legend-item"><i class="legend-color bg-slate"></i> Low (≤20)</span>
                </div>
              </div>
              <div class="svg-container">
                ${renderFleetPersistenceSvg()}
              </div>
              <p class="footnote">
                TX-F exhibited a prolonged historical run of 435 consecutive anomaly flags in 2011 (ethane variability), while TX-M experienced 128 consecutive flags in 2015.
              </p>
            </div>
          </section>

          <!-- SECTION 7: EXPLAINABILITY & REASON CODES -->
          <section id="explainability" class="section-pad">
            <div class="section-head">
              <div>
                <div class="kicker-pill"><span class="kicker-dot"></span> 07 · EXPLAINABILITY & REASON CODES</div>
                <h2>Why Is A Transformer <em>Flagged?</em></h2>
              </div>
              <div class="chip-badge chip-real">STATISTICAL DEVIATION ONLY</div>
            </div>

            <p class="section-lede">
              Reason codes represent the maximum standardised feature deviation relative to historical baseline distributions. They identify which gas family or feature drove the anomaly flag—they do not assert a physical failure cause.
            </p>

            <div class="grid-2col">
              <!-- Top Reason Distribution -->
              <div class="card">
                <div class="card-header">
                  <h3>Top Driving Features Across Fleet Anomaly Flags</h3>
                  <span class="badge-neutral">P9B & P10 Analysis</span>
                </div>
                <div class="reason-bars-list">
                  ${REAL_REASON_DISTRIBUTION.map((r) => `
                    <div class="reason-bar-item">
                      <div class="reason-meta">
                        <span class="reason-name">${r.label} (<code>${r.reason}</code>)</span>
                        <strong class="reason-pct">${r.pct}%</strong>
                      </div>
                      <div class="reason-track">
                        <div class="reason-fill" style="width: ${r.pct * 5}%"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Statistical Interpretation Guidelines -->
              <div class="card">
                <div class="card-header">
                  <h3>Reason Code Interpretation Discipline</h3>
                  <span class="badge-neutral">Evidence Discipline</span>
                </div>
                <div class="discipline-content">
                  <div class="discipline-item">
                    <span class="discipline-icon text-emerald">${icon('check')}</span>
                    <div>
                      <strong>Correct Statistical Interpretation</strong>
                      <p>“Ethane rolling standard deviation shows strong deviation from historical baseline during this measurement window.”</p>
                    </div>
                  </div>
                  <div class="discipline-item">
                    <span class="discipline-icon text-rose">${icon('alert')}</span>
                    <div>
                      <strong>Prohibited Causal Claim</strong>
                      <p>“Ethane concentration caused the transformer to fail.” (Unsupervised screening cannot establish physical causation or failure).</p>
                    </div>
                  </div>
                  <div class="discipline-item">
                    <span class="discipline-icon text-cyan">${icon('info')}</span>
                    <div>
                      <strong>Contextual Multi-Factor Validation</strong>
                      <p>Always cross-reference reason codes with sampling continuity, oil processing records, and sensor calibration status.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 8: ROBUSTNESS & VALIDATION (PHASE 12) -->
          <section id="robustness" class="section-pad section-dark">
            <div class="section-head">
              <div>
                <div class="kicker-pill"><span class="kicker-dot"></span> 08 · ROBUSTNESS & VALIDATION</div>
                <h2>Sensitivity Across <em>18 Analytical Configurations</em></h2>
              </div>
              <div class="chip-badge chip-real">PHASE 12 AUDIT</div>
            </div>

            <p class="section-lede">
              Phase 12 audited methodological stability across anomaly thresholds (1%–10%), alternative algorithms (Isolation Forest vs Robust MAD vs Percentile), condition indicator component weights, missingness filters, and sampling-gap exclusions.
            </p>

            <!-- Robustness Summary Cards -->
            <div class="robustness-summary-grid">
              <div class="stat-card">
                <span class="stat-label">CONSISTENTLY HIGH</span>
                <strong class="stat-value text-rose">2 Assets</strong>
                <span class="stat-sub">TX-I (17/18) · TX-M (16/18)</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">MODERATELY STABLE</span>
                <strong class="stat-value text-cyan">4 Assets</strong>
                <span class="stat-sub">TX-L · TX-D · TX-H · TX-K</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">METHOD-SENSITIVE</span>
                <strong class="stat-value text-amber">6 Assets</strong>
                <span class="stat-sub">TX-F · TX-C · TX-A · TX-E · TX-G · TX-B</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">INSUFFICIENT DATA</span>
                <strong class="stat-value text-muted">1 Asset</strong>
                <span class="stat-sub">TX-J (40.27% missingness)</span>
              </div>
            </div>

            <!-- Alternative Methods Table -->
            <div class="card table-card mb-8">
              <div class="card-header">
                <h3>Alternative Anomaly Methodology Comparison</h3>
                <span class="badge-neutral">Cross-Algorithm Validation</span>
              </div>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Anomaly Method</th>
                      <th>Method Paradigm</th>
                      <th>Spearman Rank Corr.</th>
                      <th>Kendall Tau</th>
                      <th>Top-3 Overlap</th>
                      <th>Priority Agreement</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${PHASE12_METHODS.map((m) => `
                      <tr>
                        <td><strong>${m.name}</strong></td>
                        <td>${m.type}</td>
                        <td class="text-cyan font-bold">${m.spearman}</td>
                        <td>${m.kendall}</td>
                        <td class="${m.top3 === '1.000' ? 'text-emerald font-bold' : 'text-amber'}">${m.top3}</td>
                        <td>${m.priorityAgreement}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <p class="footnote">
                * Method Disagreement Insight: Isolation Forest (fleet-level multidimensional density) and Robust MAD (within-asset univariate deviation) answer fundamentally different questions. Disagreement is transparently reported rather than obscured.
              </p>
            </div>

            <!-- 18-Run Stability Table -->
            <div class="card table-card">
              <div class="card-header">
                <h3>18-Configuration Stability & Consensus Screening Matrix</h3>
                <span class="badge-neutral">Phase 12 Complete Audit</span>
              </div>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Baseline Indicator</th>
                      <th>18-Run Score Range</th>
                      <th>Top-3 In Runs</th>
                      <th>Stability Classification</th>
                      <th>Consensus Screening Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${REAL_TRANSFORMERS.map((t) => `
                      <tr>
                        <td><strong>${t.id}</strong></td>
                        <td class="font-bold">${t.conditionIndicator.toFixed(2)}</td>
                        <td><code>${t.robustnessRunRange}</code></td>
                        <td>${t.robustnessTop3Count}</td>
                        <td><span class="stability-tag stability-${t.robustnessTag.toLowerCase().replace(' ', '-')}">${t.robustnessTag}</span></td>
                        <td><strong>${t.robustnessStability}</strong></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- SECTION 9: SYNTHETIC ML DEMONSTRATION -->
          <section id="synthetic-lab" class="section-pad">
            <div class="section-head">
              <div>
                <div class="kicker-pill"><span class="kicker-dot bg-amber"></span> 09 · SYNTHETIC DEMONSTRATION</div>
                <h2>Supervised ML Lab <em>(Synthetic Only)</em></h2>
              </div>
              <div class="chip-badge chip-synthetic">SYNTHETIC DEMONSTRATION — NOT REAL UTILITY PERFORMANCE</div>
            </div>

            <!-- Synthetic Warning Banner -->
            <div class="synthetic-warning-banner" role="alert">
              <div class="banner-icon text-amber">${icon('alert')}</div>
              <div class="banner-body">
                <strong>SYNTHETIC DATA SEPARATION NOTICE</strong>
                <p>
                  The metrics and risk scores shown in this section originate strictly from a synthetic demonstration dataset (12 simulated assets, 5,760 rows, 1-hour sampling contract, fixed seed 42). They MUST NOT be confused with or applied to the real 13 UK transformers.
                </p>
              </div>
            </div>

            <!-- Supervised Model Metrics Table -->
            <div class="card table-card mb-8">
              <div class="card-header">
                <h3>Phase 3 Supervised Failure-Risk Classification Metrics</h3>
                <span class="badge-neutral">Fixed Seed 42 · Chronological 60/20/20 Split</span>
              </div>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Precision</th>
                      <th>Recall</th>
                      <th>F1 Score</th>
                      <th>ROC-AUC</th>
                      <th>PR-AUC</th>
                      <th>Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${SYNTHETIC_METRICS.map((m) => `
                      <tr>
                        <td><strong>${m.model}</strong></td>
                        <td>${m.precision}</td>
                        <td class="text-cyan font-bold">${m.recall}</td>
                        <td>${m.f1}</td>
                        <td>${m.roc_auc}</td>
                        <td>${m.pr_auc}</td>
                        <td>${m.accuracy}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Synthetic Predictions & Fleet Prioritisation -->
            <div class="grid-2col">
              <div class="card">
                <div class="card-header">
                  <h3>Synthetic Asset Risk Predictions</h3>
                  <span class="badge-neutral">Random Forest Demo</span>
                </div>
                <div class="synthetic-asset-list">
                  ${SYNTHETIC_PREDICTIONS.map((p) => `
                    <div class="synthetic-asset-card">
                      <div class="synthetic-top">
                        <span class="synth-id"><strong>${p.asset}</strong> (${p.priority})</span>
                        <strong class="synth-prob text-rose">${p.probability} Risk</strong>
                      </div>
                      <div class="synth-track">
                        <div class="synth-fill" style="width: ${p.probability}"></div>
                      </div>
                      <p class="synth-action">${p.action}</p>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="card">
                <div class="card-header">
                  <h3>Synthetic Feature Importance</h3>
                  <span class="badge-neutral">Global Permutation Importance</span>
                </div>
                <div class="synthetic-features-list">
                  ${SYNTHETIC_GLOBAL_FEATURES.map((f) => `
                    <div class="reason-bar-item">
                      <div class="reason-meta">
                        <span class="reason-name"><code>${f.name}</code></span>
                        <strong class="reason-pct">${f.value}</strong>
                      </div>
                      <div class="reason-track">
                        <div class="reason-fill fill-amber" style="width: ${parseFloat(f.value) * 3}%"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
                <p class="footnote mt-4">
                  Note: Feature importance reflects synthetic sensor features (maintenance age, transformer age, oil temperature rolling max).
                </p>
              </div>
            </div>
          </section>

          <!-- SECTION 10: METHODOLOGY & AUDIT PIPELINE -->
          <section id="methodology" class="section-pad section-dark">
            <div class="section-head">
              <div>
                <div class="kicker-pill"><span class="kicker-dot"></span> 10 · SYSTEM METHODOLOGY</div>
                <h2>End-to-End Decision <em>Architecture</em></h2>
              </div>
              <div class="chip-badge chip-real">TRANSPARENT WORKFLOW</div>
            </div>

            <div class="pipeline-flow-card card">
              <div class="card-header">
                <h3>Real UK DGA Pipeline vs Synthetic Demonstration Pipeline</h3>
                <span class="badge-neutral">Strict Separation</span>
              </div>
              
              <div class="pipeline-dual-grid">
                <!-- Real Track -->
                <div class="pipeline-track track-real">
                  <div class="track-header">
                    <span class="track-badge bg-cyan">REAL PIPELINE</span>
                    <h4>Real UK DGA Telemetry</h4>
                  </div>
                  <div class="track-steps">
                    <div class="step-box"><span class="step-num">01</span><span>Data Validation (Schema & Timestamps)</span></div>
                    <div class="step-arrow">↓</div>
                    <div class="step-box"><span class="step-num">02</span><span>Preprocessing (Log1p & Imputation)</span></div>
                    <div class="step-arrow">↓</div>
                    <div class="step-box"><span class="step-num">03</span><span>48 Trailing Feature Groups</span></div>
                    <div class="step-arrow">↓</div>
                    <div class="step-box"><span class="step-num">04</span><span>Isolation Forest Anomaly Screening (P9B)</span></div>
                    <div class="step-arrow">↓</div>
                    <div class="step-box"><span class="step-num">05</span><span>Temporal & Leakage Validation (P10)</span></div>
                    <div class="step-arrow">↓</div>
                    <div class="step-box"><span class="step-num">06</span><span>Multi-Factor Condition Assessment (P11)</span></div>
                    <div class="step-arrow">↓</div>
                    <div class="step-box"><span class="step-num">07</span><span>Robustness & Sensitivity Audit (P12)</span></div>
                    <div class="step-arrow">↓</div>
                    <div class="step-box highlight"><span class="step-num">08</span><span>Engineering Review Queue (P1–P4)</span></div>
                  </div>
                </div>

                <!-- Synthetic Track -->
                <div class="pipeline-track track-synthetic">
                  <div class="track-header">
                    <span class="track-badge bg-amber">SYNTHETIC DEMO</span>
                    <h4>Simulated Failure Lab</h4>
                  </div>
                  <div class="track-steps">
                    <div class="step-box"><span class="step-num">01</span><span>Synthetic Telemetry (5,760 Rows)</span></div>
                    <div class="step-arrow">↓</div>
                    <div class="step-box"><span class="step-num">02</span><span>Synthetic Failure Target Definition</span></div>
                    <div class="step-arrow">↓</div>
                    <div class="step-box"><span class="step-num">03</span><span>Logistic Regression & Random Forest</span></div>
                    <div class="step-arrow">↓</div>
                    <div class="step-box"><span class="step-num">04</span><span>Model Evaluation & Explainability</span></div>
                    <div class="step-arrow">↓</div>
                    <div class="step-box highlight"><span class="step-num">05</span><span>Simulated Risk Prioritisation (P1–P5)</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 11: LIMITATIONS & RESPONSIBLE USE -->
          <section id="limitations" class="section-pad">
            <div class="section-head">
              <div>
                <div class="kicker-pill"><span class="kicker-dot"></span> 11 · LIMITATIONS & RESPONSIBLE USE</div>
                <h2>Critical Evidence <em>Boundaries</em></h2>
              </div>
              <div class="chip-badge chip-real">EXAMINER AUDIT CHECKLIST</div>
            </div>

            <div class="limitations-grid">
              <div class="card limit-card">
                <div class="limit-num">01</div>
                <h4>No Authoritative Failure Labels</h4>
                <p>The real UK dataset does not record physical transformer breakdowns, outages, or catastrophic events.</p>
              </div>

              <div class="card limit-card">
                <div class="limit-num">02</div>
                <h4>No Validated Future-Failure Target</h4>
                <p>Supervised target <code>failure_24h</code> cannot be legitimately trained without verified ground-truth event labels.</p>
              </div>

              <div class="card limit-card">
                <div class="limit-num">03</div>
                <h4>No Maintenance Outcome Records</h4>
                <p>Oil reclamation, degasification, and bushing repairs are unrecorded in the source telemetry.</p>
              </div>

              <div class="card limit-card">
                <div class="limit-num">04</div>
                <h4>Irregular DGA Sampling Intervals</h4>
                <p>Measurement intervals vary from 1 hour to several days across different assets and operational regimes.</p>
              </div>

              <div class="card limit-card">
                <div class="limit-num">05</div>
                <h4>Missing Gas Measurements</h4>
                <p>TX-J contains 40.27% missing gas observations; confidence is explicitly downgraded to Limited Confidence.</p>
              </div>

              <div class="card limit-card">
                <div class="limit-num">06</div>
                <h4>Telemetry Gaps & Stale Data</h4>
                <p>Large temporal gaps exist in several assets; calculations strictly enforce trailing cutoffs.</p>
              </div>

              <div class="card limit-card">
                <div class="limit-num">07</div>
                <h4>Method Disagreement</h4>
                <p>Alternative anomaly detection algorithms (Isolation Forest vs Robust MAD) produce varying rankings across 6 assets.</p>
              </div>

              <div class="card limit-card">
                <div class="limit-num">08</div>
                <h4>Prototype Screening Metric</h4>
                <p>The Condition Indicator (0–100) is a project-defined heuristic, not an international electrical standard.</p>
              </div>

              <div class="card limit-card">
                <div class="limit-num">09</div>
                <h4>Review Priority Is Not Risk</h4>
                <p>Priorities P1–P4 denote review urgency and attention allocation, not probability of asset failure.</p>
              </div>

              <div class="card limit-card">
                <div class="limit-num">10</div>
                <h4>Retrospective Offline Analysis</h4>
                <p>All evaluations are conducted retrospectively on historic 2010–2015 data.</p>
              </div>

              <div class="card limit-card">
                <div class="limit-num">11</div>
                <h4>Human-in-the-Loop Requirement</h4>
                <p>Qualified high-voltage electrical engineers must validate all flags before operational intervention.</p>
              </div>

              <div class="card limit-card">
                <div class="limit-num">12</div>
                <h4>No Autonomous SCADA Control</h4>
                <p>GridWatch provides decision support only; it does not connect to automated circuit trip switches.</p>
              </div>
            </div>
          </section>

          <!-- FOOTER -->
          <footer class="site-footer">
            <div class="footer-top">
              <div class="brand">
                <span class="brand-mark small"><i></i><i></i><b></b></span>
                <span class="brand-name">Grid<span>Watch</span></span>
              </div>
              <p class="footer-desc">
                Transformer Health Intelligence — Examiner-Ready Data Science Prototype (Phase 13 Integration).
              </p>
            </div>
            <div class="footer-bottom">
              <span>Decision support prototype · Not for autonomous grid control</span>
              <span>Validated against Phase 9B–12 Evidence Artifacts · 2026</span>
            </div>
          </footer>

        </main>
      </div>
    </div>
  `

  bindEventListeners()
}

// ============================================================
// EVENT LISTENERS & INTERACTION BINDINGS
// ============================================================

function bindEventListeners(): void {
  // Quick asset jumper in topbar
  const quickSelect = document.querySelector<HTMLSelectElement>('#quick-asset-select')
  if (quickSelect) {
    quickSelect.addEventListener('change', () => {
      state.selectedAssetId = quickSelect.value
      renderApp()
      const detailSec = document.querySelector('#transformer-detail')
      if (detailSec) detailSec.scrollIntoView({ behavior: 'smooth' })
    })
  }

  // Row selection buttons in review queue
  document.querySelectorAll<HTMLButtonElement>('.button-select-tx').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const txId = btn.dataset.txId
      if (txId) {
        state.selectedAssetId = txId
        renderApp()
        const detailSec = document.querySelector('#transformer-detail')
        if (detailSec) detailSec.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })

  // Table row click
  document.querySelectorAll<HTMLTableRowElement>('.tx-row').forEach((row) => {
    row.addEventListener('click', () => {
      const txId = row.dataset.txId
      if (txId) {
        state.selectedAssetId = txId
        renderApp()
        const detailSec = document.querySelector('#transformer-detail')
        if (detailSec) detailSec.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })

  // Priority filter
  const filterPriority = document.querySelector<HTMLSelectElement>('#filter-priority')
  if (filterPriority) {
    filterPriority.addEventListener('change', () => {
      state.filterPriority = filterPriority.value
      renderApp()
    })
  }

  // Band filter
  const filterBand = document.querySelector<HTMLSelectElement>('#filter-band')
  if (filterBand) {
    filterBand.addEventListener('change', () => {
      state.filterBand = filterBand.value
      renderApp()
    })
  }

  // Confidence filter
  const filterConfidence = document.querySelector<HTMLSelectElement>('#filter-confidence')
  if (filterConfidence) {
    filterConfidence.addEventListener('change', () => {
      state.filterConfidence = filterConfidence.value
      renderApp()
    })
  }

  // Search filter
  const searchInput = document.querySelector<HTMLInputElement>('#filter-search-input')
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.searchQuery = searchInput.value
      renderApp()
    })
  }

  // Reset filters
  const resetBtn = document.querySelector<HTMLButtonElement>('#reset-filters-btn')
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.filterPriority = 'ALL'
      state.filterBand = 'ALL'
      state.filterConfidence = 'ALL'
      state.searchQuery = ''
      renderApp()
    })
  }
}

// Initial render
renderApp()
