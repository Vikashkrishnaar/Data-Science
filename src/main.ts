import './style.css'

type Phase = {
  id: string
  number: string
  name: string
  eyebrow: string
  description: string
  evidence: string
  gate: string
  state: 'active' | 'queued' | 'conditional'
}

type RiskRow = {
  asset: string
  location: string
  risk: number
  band: string
  status: string
  priority: string
  rationale: string
  next: string
}

type ModelMetric = {
  model: string
  precision: string
  recall: string
  f1: string
  roc_auc: string
  pr_auc: string
  accuracy: string
}

const phases: Phase[] = [
  {
    id: 'data', number: '01', name: 'Data readiness', eyebrow: 'FOUNDATION',
    description: 'Phase 1 is plan-ready but dataset-pending: inspect schema, timestamps, sampling, units, missingness, asset IDs, failure events, licence constraints, and the evidence needed before choosing a target or model.',
    evidence: 'Dataset assessment + quality report + feature dictionary', gate: 'Approval gate: a real dataset is fit for the proposed question', state: 'active',
  },
  {
    id: 'explore', number: '02', name: 'Understand patterns', eyebrow: 'DISCOVERY',
    description: 'Use exploratory analysis to ask useful questions about distributions, trends, asset-level behaviour, abnormal readings, class balance, and pre-failure patterns.',
    evidence: 'Question-led EDA notebook + documented cleaning decisions', gate: 'Approval gate: features are physically defensible', state: 'queued',
  },
  {
    id: 'predict', number: '03', name: 'Estimate risk', eyebrow: 'MODELLING',
    description: 'Define a future-failure target from actual events where possible. Start with interpretable baselines, protect the time axis, and compare models fairly.',
    evidence: 'Chronological evaluation + threshold analysis', gate: 'Approval gate: target and split survive leakage review', state: 'conditional',
  },
  {
    id: 'explain', number: '04', name: 'Make it reviewable', eyebrow: 'DECISION SUPPORT',
    description: 'Translate model output into feature contributions, health status, risk bands, inspection priority, and maintenance-oriented suggestions—never an autonomous diagnosis.',
    evidence: 'Explainability view + limitations log', gate: 'Approval gate: output is safe to interpret in context', state: 'queued',
  },
]

const riskRows: RiskRow[] = [
  { asset: 'TX-014', location: 'Sample / North feeder', risk: 0.72, band: 'Elevated', status: 'Watch', priority: 'P1', rationale: 'Illustrative combination of recent load variability and a rising thermal trend. No real asset data is shown.', next: 'Review recent measurements and maintenance history with an engineer.' },
  { asset: 'TX-007', location: 'Sample / Industrial loop', risk: 0.44, band: 'Moderate', status: 'Stable', priority: 'P2', rationale: 'Illustrative mid-band signal. The interface intentionally withholds any claim about actual sensor availability.', next: 'Keep in routine review; confirm data quality before comparing assets.' },
  { asset: 'TX-021', location: 'Sample / East substation', risk: 0.18, band: 'Lower', status: 'Healthy', priority: 'P3', rationale: 'Illustrative lower-risk row, not a prediction or evidence of normal operation.', next: 'Continue scheduled monitoring and document the confidence context.' },
]

const phase3Metrics: ModelMetric[] = [
  { model: 'Logistic Regression', precision: '0.655', recall: '0.662', f1: '0.659', roc_auc: '0.652', pr_auc: '0.648', accuracy: '0.636' },
  { model: 'Random Forest', precision: '0.618', recall: '0.681', f1: '0.648', roc_auc: '0.592', pr_auc: '0.608', accuracy: '0.607' },
]

const syntheticRiskRows = [
  { asset: 'TX-010', probability: '72.9%', band: 'Elevated', health: 'Watch', priority: 'P1' },
  { asset: 'TX-011', probability: '63.7%', band: 'Moderate', health: 'Stable', priority: 'P2' },
  { asset: 'TX-008', probability: '58.7%', band: 'Moderate', health: 'Stable', priority: 'P3' },
  { asset: 'TX-009', probability: '57.3%', band: 'Moderate', health: 'Stable', priority: 'P4' },
  { asset: 'TX-007', probability: '55.7%', band: 'Moderate', health: 'Stable', priority: 'P5' },
]

const phase4Features = [
  { name: 'maintenance_age_days', value: '26.6%' },
  { name: 'transformer_age_years', value: '10.3%' },
  { name: 'oil_temp_c_roll_max_12h', value: '7.7%' },
  { name: 'load_pct_roll_std_6h', value: '4.6%' },
  { name: 'oil_temp_c_roll_mean_12h', value: '4.0%' },
]

const phase4LocalFactors = [
  { name: 'voltage_dev_kv', direction: 'reduces risk' },
  { name: 'voltage_kv', direction: 'raises risk' },
  { name: 'transformer_age_years', direction: 'raises risk' },
  { name: 'maintenance_age_days', direction: 'raises risk' },
]

const phase4Fleet = [
  { asset: 'TX-010', risk: '72.9%', health: '59.9', band: 'Watch', priority: 'P1', suggestion: 'Prioritise engineering inspection of recent operating history and maintenance records.' },
  { asset: 'TX-011', risk: '63.7%', health: '65.0', band: 'Watch', priority: 'P2', suggestion: 'Review recent trend windows and confirm data quality before changing inspection cadence.' },
  { asset: 'TX-008', risk: '58.7%', health: '67.7', band: 'Watch', priority: 'P3', suggestion: 'Review recent trend windows and confirm data quality before changing inspection cadence.' },
  { asset: 'TX-009', risk: '57.3%', health: '68.5', band: 'Watch', priority: 'P4', suggestion: 'Review recent trend windows and confirm data quality before changing inspection cadence.' },
  { asset: 'TX-007', risk: '55.7%', health: '69.4', band: 'Watch', priority: 'P5', suggestion: 'Review recent trend windows and confirm data quality before changing inspection cadence.' },
]

const realGasSummary = [
  { gas: 'Hydrogen', measurements: '214,337', mean: '33.09', median: '19.4', p95: '118.6' },
  { gas: 'Methane', measurements: '214,337', mean: '35.29', median: '31.6', p95: '94.9' },
  { gas: 'Acetylene', measurements: '214,337', mean: '0.39', median: '0.3', p95: '1.4' },
  { gas: 'Ethylene', measurements: '214,337', mean: '9.30', median: '7.3', p95: '23.7' },
  { gas: 'Ethane', measurements: '214,337', mean: '103.41', median: '35.8', p95: '421.8' },
  { gas: 'Carbon Monoxide', measurements: '214,337', mean: '197.37', median: '191.4', p95: '393.0' },
  { gas: 'Carbon Dioxide', measurements: '214,337', mean: '1,388.70', median: '1,303.0', p95: '2,863.0' },
  { gas: 'Oxygen', measurements: '205,721', mean: '2,014.88', median: '611.3', p95: '11,898.3' },
  { gas: 'Water', measurements: '214,337', mean: '4.43', median: '3.6', p95: '9.0' },
]

const realAssetSummary = [
  ['TX-A', '27,189', '3 phases', '2014-08 → 2015-07'], ['TX-B', '217,638', '3 phases', '2011-01 → 2015-05'], ['TX-C', '71,424', '1 phase', '2010-09 → 2015-07'], ['TX-D', '81,675', '1 phase', '2010-07 → 2015-07'], ['TX-E', '215,424', '3 phases', '2010-07 → 2015-07'], ['TX-F', '164,610', '3 phases', '2010-07 → 2015-07'], ['TX-G', '215,424', '3 phases', '2010-07 → 2015-07'], ['TX-H', '214,110', '3 phases', '2010-07 → 2015-07'], ['TX-I', '51,786', '3 phases', '2013-07 → 2015-07'], ['TX-J', '224,124', '3 phases', '2010-07 → 2015-07'], ['TX-K', '256,599', '3 phases', '2010-09 → 2015-07'], ['TX-L', '130,509', '3 phases', '2011-06 → 2015-07'], ['TX-M', '49,905', '3 phases', '2013-10 → 2015-07'],
]

const realFeatureGroups = [
  ['Raw DGA state', '9', 'ppm concentrations for the nine available gas families'],
  ['Log transforms', '9', 'log1p concentrations for skew-aware comparisons'],
  ['Trailing deltas', '9', 'within-transformer first differences'],
  ['Trailing means', '9', 'three-observation rolling means'],
  ['Trailing variability', '9', 'three-observation rolling standard deviations'],
  ['Data quality / recency', '3', 'observed gases, missing gases, hours since previous record'],
]

const realAnomalyAssets = [
  { asset: 'TX-M', p95: '0.394', proxy: '35.73%', reason: 'ethane_ppm_log1p' },
  { asset: 'TX-I', p95: '0.391', proxy: '19.43%', reason: 'carbon_monoxide_ppm_delta' },
  { asset: 'TX-J', p95: '0.358', proxy: '20.46%', reason: 'oxygen_ppm_roll_std_3' },
  { asset: 'TX-F', p95: '0.305', proxy: '6.71%', reason: 'ethane_ppm_roll_std_3' },
  { asset: 'TX-L', p95: '0.195', proxy: '0.29%', reason: 'hydrogen_ppm_delta' },
]

const realAnomalyReasons = [
  ['ethane_ppm_roll_std_3', '14.18%'], ['hydrogen_ppm_delta', '12.14%'], ['ethylene_ppm_delta', '9.56%'], ['ethane_ppm_log1p', '8.37%'], ['oxygen_ppm_roll_std_3', '6.26%'],
]

type ConditionAsset = {
  asset: string
  indicator: number
  band: string
  priority: string
  confidence: string
  p95: string
  baseline: string
  recent: number
  recentRate: string
  maxRun: number
  daysSince: string
  reasons: string[]
  suggestion: string
  components: [number, number, number, number, number]
}

const realConditionAssets: ConditionAsset[] = [
  { asset: 'TX-I', indicator: 90.72, band: 'HIGH REVIEW', priority: 'P1', confidence: 'High confidence', p95: '0.391', baseline: '15.19', recent: 760, recentRate: '46.91%', maxRun: 47, daysSince: '0.04 d', reasons: ['Strong DGA deviation: carbon monoxide change', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity'], suggestion: 'Review recent DGA history, compare with the transformer-specific baseline, verify sampling continuity, and consider qualified engineering inspection.', components: [0.923, 1, 0.9998, 0.538, 0.997] },
  { asset: 'TX-M', indicator: 80.40, band: 'HIGH REVIEW', priority: 'P1', confidence: 'High confidence', p95: '0.394', baseline: '7.73', recent: 795, recentRate: '49.04%', maxRun: 128, daysSince: '0 d', reasons: ['Strong DGA deviation: ethane concentration', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity'], suggestion: 'Review recent DGA history, compare with the transformer-specific baseline, verify sampling continuity, and consider qualified engineering inspection.', components: [1, 1, 1, 0.154, 0.539] },
  { asset: 'TX-J', indicator: 80.38, band: 'HIGH REVIEW', priority: 'P2', confidence: 'Limited confidence', p95: '0.358', baseline: '358.75', recent: 453, recentRate: '14.28%', maxRun: 38, daysSince: '0.08 d', reasons: ['Strong DGA deviation: hydrogen change', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity', 'Transformer-specific baseline deviation', 'Data-quality or sampling limitation'], suggestion: 'Review the recent DGA trend and transformer-specific history; verify data quality before changing inspection cadence.', components: [0.846, 1, 0.9995, 1, 0] },
  { asset: 'TX-L', indicator: 62.73, band: 'REVIEW', priority: 'P2', confidence: 'High confidence', p95: '0.195', baseline: '136.32', recent: 7, recentRate: '0.44%', maxRun: 7, daysSince: '5.33 d', reasons: ['Strong DGA deviation: oxygen variability', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity', 'Transformer-specific baseline deviation'], suggestion: 'Review the recent DGA trend and transformer-specific history; verify data quality before changing inspection cadence.', components: [0.692, 1, 0.086, 0.923, 0.426] },
  { asset: 'TX-F', indicator: 57.26, band: 'REVIEW', priority: 'P2', confidence: 'High confidence', p95: '0.305', baseline: '11.33', recent: 4, recentRate: '0.22%', maxRun: 435, daysSince: '8.08 d', reasons: ['Strong DGA deviation: ethane variability', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity'], suggestion: 'Review the recent DGA trend and transformer-specific history; verify data quality before changing inspection cadence.', components: [0.769, 1, 0.041, 0.385, 0.506] },
  { asset: 'TX-D', indicator: 54.14, band: 'REVIEW', priority: 'P2', confidence: 'High confidence', p95: '0.148', baseline: '20.57', recent: 9, recentRate: '1.65%', maxRun: 11, daysSince: '56.33 d', reasons: ['Strong DGA deviation: oxygen change', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity', 'Transformer-specific baseline deviation'], suggestion: 'Review the recent DGA trend and transformer-specific history; verify data quality before changing inspection cadence.', components: [0.308, 1, 0.241, 0.769, 0.571] },
  { asset: 'TX-C', indicator: 52.08, band: 'REVIEW', priority: 'P2', confidence: 'High confidence', p95: '0.121', baseline: '29.28', recent: 9, recentRate: '1.65%', maxRun: 5, daysSince: '56.33 d', reasons: ['Strong DGA deviation: oxygen variability', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity', 'Transformer-specific baseline deviation'], suggestion: 'Review the recent DGA trend and transformer-specific history; verify data quality before changing inspection cadence.', components: [0.231, 1, 0.241, 0.846, 0.510] },
  { asset: 'TX-A', indicator: 50.71, band: 'REVIEW', priority: 'P2', confidence: 'Moderate confidence', p95: '0.182', baseline: '6.67', recent: 3, recentRate: '0.19%', maxRun: 3, daysSince: '97.71 d', reasons: ['Strong DGA deviation: carbon dioxide concentration', 'Persistent or repeated anomaly behaviour', 'Recent anomaly activity'], suggestion: 'Review the recent DGA trend and transformer-specific history; verify data quality before changing inspection cadence.', components: [0.615, 0.880, 0.022, 0.077, 0.871] },
  { asset: 'TX-H', indicator: 48.67, band: 'MONITOR', priority: 'P3', confidence: 'High confidence', p95: '0.154', baseline: '15.73', recent: 0, recentRate: '0%', maxRun: 5, daysSince: '1,027.79 d', reasons: ['Strong DGA deviation: ethane concentration', 'Persistent or repeated anomaly behaviour'], suggestion: 'Continue monitoring, review repeated deviations, and confirm that sampling continuity supports interpretation.', components: [0.385, 1, 0, 0.615, 0.527] },
  { asset: 'TX-E', indicator: 46.39, band: 'MONITOR', priority: 'P3', confidence: 'High confidence', p95: '0.173', baseline: '8.61', recent: 0, recentRate: '0%', maxRun: 26, daysSince: '195.92 d', reasons: ['Strong DGA deviation: hydrogen concentration', 'Persistent or repeated anomaly behaviour'], suggestion: 'Continue monitoring, review repeated deviations, and confirm that sampling continuity supports interpretation.', components: [0.5, 1, 0, 0.269, 0.490] },
  { asset: 'TX-G', indicator: 46.39, band: 'MONITOR', priority: 'P3', confidence: 'High confidence', p95: '0.173', baseline: '8.61', recent: 0, recentRate: '0%', maxRun: 26, daysSince: '195.92 d', reasons: ['Strong DGA deviation: hydrogen concentration', 'Persistent or repeated anomaly behaviour'], suggestion: 'Continue monitoring, review repeated deviations, and confirm that sampling continuity supports interpretation.', components: [0.5, 1, 0, 0.269, 0.490] },
  { asset: 'TX-B', indicator: 42.29, band: 'MONITOR', priority: 'P3', confidence: 'High confidence', p95: '0.085', baseline: '19.10', recent: 0, recentRate: '0%', maxRun: 7, daysSince: '1,081.79 d', reasons: ['Strong DGA deviation: oxygen concentration', 'Persistent or repeated anomaly behaviour'], suggestion: 'Continue monitoring, review repeated deviations, and confirm that sampling continuity supports interpretation.', components: [0.154, 1, 0, 0.692, 0.486] },
  { asset: 'TX-K', indicator: 36.89, band: 'MONITOR', priority: 'P3', confidence: 'High confidence', p95: '0.079', baseline: '15.09', recent: 0, recentRate: '0%', maxRun: 101, daysSince: '602.04 d', reasons: ['Strong DGA deviation: water variability', 'Persistent or repeated anomaly behaviour'], suggestion: 'Continue monitoring, review repeated deviations, and confirm that sampling continuity supports interpretation.', components: [0.077, 1, 0, 0.462, 0.511] },
]

const icon = (name: string) => {
  const paths: Record<string, string> = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.1 7.8 7.5 9.5 4.4-1.7 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
    pulse: '<path d="M3 12h4l2.2-6 4.2 12 2.2-6H21"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    chevron: '<path d="m7 10 5 5 5-5"/>',
  }
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] ?? paths.arrow}</svg>`
}

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div class="site-shell">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="GridWatch home">
        <span class="brand-mark"><i></i><i></i><b></b></span>
        <span class="brand-name">Grid<span>Watch</span></span>
      </a>
      <div class="topbar-meta"><span class="live-dot"></span><span>Real data / phase 11 review</span><span class="meta-divider"></span><span>Decision support, not control</span></div>
      <a class="rail-link" href="#next-phase">Next phase ${icon('arrow')}</a>
    </header>

    <div class="page-grid" id="top">
      <aside class="side-rail" aria-label="Page sections">
        <div class="rail-stamp">GW / 001</div>
        <div class="rail-line"><span></span></div>
        <div class="rail-label">TRANSFORMER<br/>HEALTH<br/>INTELLIGENCE</div>
        <div class="rail-bottom"><span class="rail-scroll">SCROLL TO INSPECT</span><span class="rail-year">2026</span></div>
      </aside>

      <main>
        <section class="hero section-pad" aria-labelledby="hero-title">
          <div class="hero-copy">
            <p class="eyebrow"><span class="eyebrow-index">01</span> Smart grid monitoring / student prototype</p>
            <h1 id="hero-title">From raw telemetry<br/>to <em>reviewable</em> signal.</h1>
            <p class="hero-lede">GridWatch brings historical transformer operating data into one inspectable decision-support workflow—so teams can see what the data can support before they ask a model to speak.</p>
            <div class="hero-actions">
              <a class="button button-primary" href="#workflow">Inspect the workflow ${icon('arrow')}</a>
              <a class="text-link" href="#boundaries">Know the boundaries ${icon('arrow')}</a>
            </div>
            <div class="hero-note"><span class="note-mark">↳</span> No autonomous control. No fabricated labels. No novelty claims.</div>
          </div>
          <div class="hero-instrument" aria-label="Prototype status panel">
              <div class="instrument-head"><span>READINESS / 11</span><span class="instrument-status"><i></i> CONDITION REVIEW READY</span></div>
            <div class="dial-wrap">
              <div class="dial"><div class="dial-inner"><span class="dial-value">11</span><span class="dial-caption">phase</span></div><span class="dial-tick tick-a"></span><span class="dial-tick tick-b"></span><span class="dial-tick tick-c"></span></div>
              <div class="instrument-copy"><span class="tiny-label">CURRENT QUESTION</span><strong>What can this<br/>dataset support?</strong><span class="instrument-sub">Real DGA data is validated. The condition indicator is retrospective.</span></div>
            </div>
            <div class="instrument-readout"><div><span class="tiny-label">REAL TARGET</span><code>not available</code></div><div><span class="tiny-label">ASSETS</span><strong>13 TX</strong></div><div><span class="tiny-label">STATUS</span><strong class="lime-text">Target gate</strong></div></div>
            <p class="instrument-foot">No failure, fault, or health label is present. Do not invent one from gas thresholds.</p>
          </div>
        </section>

        <section class="signal-strip" aria-label="Project principles">
          <div><span class="strip-number">13</span><span>real transformers<br/><small>UK power-station DGA</small></span></div>
          <div><span class="strip-number">1.92M</span><span>DGA measurements<br/><small>after validation</small></span></div>
          <div><span class="strip-number">09</span><span>gas families<br/><small>measured in ppm</small></span></div>
          <div><span class="strip-number">01</span><span>target gate<br/><small>no failure label yet</small></span></div>
        </section>

        <section class="context section-pad" id="context">
          <div class="section-kicker"><span>02</span><span>Context / project gap</span></div>
          <div class="context-grid">
            <div class="section-heading"><h2>The gap is not<br/>a lack of <em>sensors.</em></h2></div>
            <div class="context-copy"><p>Utilities already work with SCADA, condition-monitoring sensors, threshold alarms, periodic inspections, transformer diagnostics, maintenance records, and predictive analytics.</p><p>The student challenge is narrower and more useful: turn available operating data into an integrated, reviewable workflow for comparing assets, understanding contributing features, and prioritising engineering attention.</p><div class="context-quote">“The contribution is the method and the decision path—not a claim that monitoring is new.”</div></div>
          </div>
          <div class="capability-ribbon" aria-label="Existing system capabilities"><span>SCADA monitoring</span><i></i><span>Sensor streams</span><i></i><span>Threshold alarms</span><i></i><span>Periodic inspection</span><i></i><span>Predictive analytics</span></div>
        </section>

        <section class="workflow-section section-pad" id="workflow">
          <div class="section-kicker"><span>03</span><span>Proposed system / phased workflow</span></div>
          <div class="workflow-head"><div><h2>A decision path<br/>you can <em>audit.</em></h2></div><p>The order matters. Data validation comes before modelling; explainability comes before a recommendation; every next phase is unlocked by evidence, not enthusiasm.</p></div>
          <div class="phase-tabs" role="tablist" aria-label="Workflow phases">
            ${phases.map((phase, index) => `<button class="phase-tab ${index === 0 ? 'active' : ''}" role="tab" aria-selected="${index === 0}" aria-controls="phase-panel" data-phase="${phase.id}"><span class="phase-number">${phase.number}</span><span>${phase.name}</span><span class="phase-state ${phase.state}"></span></button>`).join('')}
          </div>
          <div class="phase-panel" id="phase-panel" role="tabpanel">
            <div class="phase-panel-number">${phases[0].number}</div><div class="phase-panel-main"><span class="eyebrow">${phases[0].eyebrow}</span><h3>${phases[0].name}</h3><p>${phases[0].description}</p><div class="phase-evidence"><span class="evidence-icon">${icon('check')}</span><span><small>EXPECTED EVIDENCE</small><strong>${phases[0].evidence}</strong></span></div></div><div class="gate-card"><span class="gate-symbol">⌁</span><small>GATE CONDITION</small><strong>${phases[0].gate}</strong></div>
          </div>
          <div class="workflow-track" aria-label="End-to-end workflow"><div class="track-line"></div>${['Sensor / historical data','Data validation','Data preprocessing','Exploratory data analysis','Feature engineering','Failure-risk prediction','Model evaluation','Explainable AI','Health assessment','Maintenance suggestions','Risk prioritisation','Interactive dashboard'].map((item, index) => `<div class="track-step ${index < 2 ? 'lit' : ''}"><span>${String(index + 1).padStart(2, '0')}</span><b>${item}</b></div>`).join('')}</div>
        </section>

        <section class="method-section section-pad" id="method">
          <div class="section-kicker"><span>04</span><span>Method discipline</span></div>
          <div class="method-grid">
            <article class="method-card featured"><div class="card-topline"><span class="card-index">A</span><span class="card-tag">NON-NEGOTIABLE</span></div><h3>Dataset<br/><em>first.</em></h3><p>Inspect format, timestamps, assets, units, missing values, duplicates, ranges, maintenance and failure information before deciding what can be predicted.</p><div class="card-footer"><span>${icon('shield')}</span><strong>Stop if labels cannot be supported.</strong></div></article>
            <article class="method-card"><div class="card-topline"><span class="card-index">B</span><span class="card-tag">TIME-AWARE</span></div><h3>Protect the<br/><em>future.</em></h3><p>When temporal leakage is possible, prefer chronological train / validation / test splits. Use only information available before the prediction timestamp.</p><div class="mini-flow"><span>older</span><i></i><span>newer</span></div></article>
            <article class="method-card"><div class="card-topline"><span class="card-index">C</span><span class="card-tag">COST-AWARE</span></div><h3>Accuracy is<br/><em>not enough.</em></h3><p>Read recall, precision, F1, ROC-AUC, PR-AUC, confusion matrix, calibration, false positives, and false negatives together.</p><div class="metric-chips"><span>Recall</span><span>PR-AUC</span><span>Calibration</span></div></article>
          </div>
        </section>

        <section class="feature-plan-section section-pad" id="feature-plan">
          <div class="section-kicker"><span>04A</span><span>Phase 1 / feature-engineering strategy</span></div>
          <div class="feature-plan-head"><div><h2>Engineer the<br/><em>past, not the future.</em></h2></div><p>Feature design begins only after sampling, units, and event definitions are known. Every candidate below is trailing, auditable, and conditional on the variables the dataset actually contains.</p></div>
          <div class="feature-plan-grid">
            <article class="feature-plan-card"><span class="feature-plan-number">01</span><h3>State + trend</h3><p>Latest readings, lags, deltas, slopes, and temperature / current / load rate-of-change features.</p><span class="feature-plan-foot">requires ordered history</span></article>
            <article class="feature-plan-card"><span class="feature-plan-number">02</span><h3>Rolling behaviour</h3><p>Trailing mean, min, max, variability, and recency over windows chosen after sampling inspection.</p><span class="feature-plan-foot">no centred windows</span></article>
            <article class="feature-plan-card"><span class="feature-plan-number">03</span><h3>Excursions + gaps</h3><p>Documented overload / abnormal counts, duration, missingness indicators, and stale-reading flags.</p><span class="feature-plan-foot">thresholds must be justified</span></article>
            <article class="feature-plan-card"><span class="feature-plan-number">04</span><h3>Asset history</h3><p>Age, time since maintenance, prior event count, and asset-baseline deviations only when records exist.</p><span class="feature-plan-foot">cut-off safe at T</span></article>
          </div>
          <div class="feature-plan-note"><span>LEAKAGE REGISTER</span><strong>Fit imputers, scalers, baselines, and encoders on training data only. Construct future-event labels separately from pre-T inputs.</strong></div>
        </section>

        <section class="outputs-section section-pad" id="outputs">
          <div class="section-kicker"><span>05</span><span>Decision-support outputs</span></div>
          <div class="outputs-head"><div><h2>Signals with<br/><em>context attached.</em></h2></div><p>These rows are illustrative interface records, not claims about a real dataset. Select one to see the kind of rationale an engineer should be able to inspect.</p></div>
          <div class="risk-table-wrap"><table class="risk-table"><thead><tr><th>Asset / context</th><th>Risk band</th><th>Health</th><th>Inspection</th><th aria-label="Expand"></th></tr></thead><tbody>${riskRows.map((row, index) => `<tr class="risk-row ${index === 0 ? 'expanded' : ''}" data-row="${index}"><td><div class="asset-cell"><strong>${row.asset}</strong><span>${row.location}</span></div></td><td><div class="risk-cell"><span class="risk-bar"><i style="width:${row.risk * 100}%"></i></span><strong>${Math.round(row.risk * 100)}%</strong><span class="band-label ${row.band.toLowerCase()}">${row.band}</span></div></td><td><span class="status-pill ${row.status.toLowerCase()}"><i></i>${row.status}</span></td><td><span class="priority ${row.priority.toLowerCase()}">${row.priority}</span></td><td><button class="row-toggle" aria-expanded="${index === 0}" aria-label="Show rationale for ${row.asset}">${icon('chevron')}</button></td></tr><tr class="rationale-row ${index === 0 ? 'visible' : ''}"><td colspan="5"><div class="rationale-content"><span class="rationale-label">WHY THIS ROW IS HERE</span><p>${row.rationale}</p><span class="rationale-label">SUGGESTED NEXT STEP</span><p>${row.next}</p></div></td></tr>`).join('')}</tbody></table></div>
          <div class="table-disclaimer"><span>◎</span><p>Illustrative only. No actual transformer readings, labels, model metrics, or engineering recommendations are asserted here.</p></div>
        </section>

        <section class="real-data-section section-pad" id="real-data">
          <div class="section-kicker"><span>05A</span><span>Phase 8 / real dataset</span></div>
          <div class="real-data-head"><div><h2>The real signal is<br/><em>DGA.</em></h2></div><p>The final dashboard now foregrounds the validated UK power-station dataset. These are descriptive measurements and engineered features—not failure predictions. The source contains 13 transformers, 316,203 raw rows, and 1,920,417 normalized non-null DGA measurements from July 2010 to July 2015.</p></div>
          <div class="real-stat-grid"><div><strong>13</strong><span>transformers</span></div><div><strong>316,203</strong><span>raw rows</span></div><div><strong>1,920,417</strong><span>normalized measurements</span></div><div><strong>2010 → 2015</strong><span>UTC coverage</span></div></div>
          <div class="real-data-grid">
            <div class="real-table-card"><div class="real-card-head"><span class="review-label">GAS-LEVEL DISTRIBUTIONS / ppm</span><span class="real-chip">REAL / VALIDATED</span></div><div class="real-table-wrap"><table class="real-table"><thead><tr><th>Gas</th><th>Measurements</th><th>Mean</th><th>Median</th><th>P95</th></tr></thead><tbody>${realGasSummary.map((row) => `<tr><td><strong>${row.gas}</strong></td><td>${row.measurements}</td><td>${row.mean}</td><td>${row.median}</td><td class="real-accent">${row.p95}</td></tr>`).join('')}</tbody></table></div><p class="real-footnote">Oxygen has fewer non-null measurements than the other gas families; all values are source ppm readings, not normalized risk scores.</p></div>
            <div class="real-table-card"><div class="real-card-head"><span class="review-label">ASSET COVERAGE / 13 TRANSFORMERS</span><span class="real-chip">REAL / VALIDATED</span></div><div class="real-table-wrap"><table class="real-table asset-table"><thead><tr><th>Asset</th><th>Measurements</th><th>Phases</th><th>Date span</th></tr></thead><tbody>${realAssetSummary.map((row) => `<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td></tr>`).join('')}</tbody></table></div><p class="real-footnote">Phase coverage differs by source file: TX-C and TX-D are single-phase records; the other assets contain three phase labels.</p></div>
          </div>
          <div class="real-feature-grid"><div class="real-feature-copy"><span class="review-label">AVAILABLE FEATURE COLUMNS / 48</span><h3>Engineer the<br/><em>observed history.</em></h3><p>The real feature table is current-and-trailing by transformer. It contains no load, temperature, current, voltage, maintenance, or failure-event fields.</p></div><div class="real-feature-list">${realFeatureGroups.map((group) => `<div class="real-feature-row"><span class="real-feature-count">${group[1]}</span><div><strong>${group[0]}</strong><p>${group[2]}</p></div></div>`).join('')}</div></div>
          <div class="target-gate-card"><div><span class="real-chip warning">APPROVAL GATE / NO REAL TARGET</span><h3><code>failure_24h</code> cannot be trained from this source yet.</h3><p>No failure, fault, health, maintenance-outcome, outage, or event label exists in the validated data. The dashboard therefore shows real preprocessing and EDA, while supervised models, real metrics, error analysis, and supervised explainability remain intentionally locked.</p></div><div class="target-options"><span class="review-label">DOCUMENTED NEXT OPTIONS</span><strong>01 · Join an authoritative fault/event label table</strong><strong>02 · Approve unsupervised DGA anomaly detection</strong><strong>03 · Acquire labelled DGA diagnostic data</strong></div></div>
        </section>

        <section class="anomaly-section section-pad" id="anomaly-results">
          <div class="section-kicker"><span>05B</span><span>Phase 9B / real anomaly screening</span></div>
          <div class="anomaly-head"><div><h2>Screen the unusual,<br/><em>not the failed.</em></h2></div><p>The approved unsupervised path scores 203,214 real feature rows with Isolation Forest. The top 5% is an analysis proxy for unusual DGA behaviour—not a probability of failure, fault, health, or maintenance need.</p></div>
          <div class="anomaly-stat-grid"><div><strong>203,214</strong><span>rows scored</span></div><div><strong>5.00%</strong><span>top-5% proxy rate</span></div><div><strong>13</strong><span>transformers compared</span></div><div><strong>42</strong><span>fixed seed</span></div></div>
          <div class="anomaly-grid"><div class="anomaly-card"><div class="real-card-head"><span class="review-label">ASSET REVIEW QUEUE / P95 SCORE</span><span class="real-chip warning">UNSUPERVISED</span></div><div class="anomaly-list">${realAnomalyAssets.map((row) => `<div class="anomaly-row"><div><strong>${row.asset}</strong><span>strongest deviation: ${row.reason}</span></div><b>${row.p95}</b><em>${row.proxy} proxy</em></div>`).join('')}</div></div><div class="anomaly-card"><div class="real-card-head"><span class="review-label">TOP REASON CODES / TOP-5% ROWS</span><span class="real-chip warning">NOT CAUSAL</span></div><div class="reason-list">${realAnomalyReasons.map((row) => `<div class="reason-row"><span>${row[0]}</span><strong>${row[1]}</strong><i><b style="width:${parseFloat(row[1]) * 5.2}%"></b></i></div>`).join('')}</div><p class="real-footnote">Reason codes are robust deviation indicators. They identify unusual features relative to transformer history; they do not explain a physical cause.</p></div></div>
          <div class="anomaly-note"><span>↳</span><strong>Human review remains required.</strong><p>High anomaly scores may reflect unusual gas behaviour, missingness, maintenance/oil-processing resets, regime changes, or measurement quality. No anomaly row is a failure label.</p></div>
        </section>

        <section class="condition-section section-pad" id="condition-assessment">
          <div class="section-kicker"><span>05C</span><span>Phase 11 / real DGA condition assessment</span></div>
          <div class="condition-head"><div><h2>Rank the signal,<br/><em>not the failure.</em></h2></div><p>This transparent prototype combines validated anomaly intensity, persistence, recency, transformer-specific deviation, and trend. Confidence is reported separately so missingness cannot inflate condition.</p></div>
          <div class="condition-stat-grid"><div><strong>0–100</strong><span>prototype indicator scale</span></div><div><strong>2 / 13</strong><span>P1 high-review queue</span></div><div><strong>11 / 13</strong><span>high-confidence assets</span></div><div><strong>180d</strong><span>recent activity window</span></div></div>
          <div class="condition-grid">
            <div class="condition-card condition-queue-card"><div class="real-card-head"><span class="review-label">ENGINEERING REVIEW QUEUE / 13 ASSETS</span><span class="real-chip warning">PROTOTYPE</span></div><div class="condition-queue">${realConditionAssets.map((row, index) => `<button class="condition-queue-row ${index === 0 ? 'selected' : ''}" type="button" data-condition-asset="${row.asset}"><span class="condition-queue-rank">${String(index + 1).padStart(2, '0')}</span><span class="condition-queue-asset"><strong>${row.asset}</strong><small>${row.band} · ${row.confidence.replace(' confidence', '')}</small></span><span class="condition-queue-meter"><i style="width:${row.indicator}%"></i></span><b>${row.indicator.toFixed(2)}</b><em>${row.priority}</em></button>`).join('')}</div></div>
            <div class="condition-card condition-detail-card"><div class="real-card-head"><span class="review-label">TRANSFORMER DETAIL / <span id="condition-detail-asset">TX-I</span></span><span class="real-chip" id="condition-detail-confidence">HIGH CONFIDENCE</span></div><div id="condition-detail-panel"></div></div>
          </div>
          <div class="condition-distribution-grid"><div class="condition-mini-card"><span class="review-label">CONDITION BANDS</span><div class="distribution-row"><span>HIGH REVIEW</span><i><b style="width:23%"></b></i><strong>3</strong></div><div class="distribution-row"><span>REVIEW</span><i><b style="width:38%"></b></i><strong>5</strong></div><div class="distribution-row"><span>MONITOR</span><i><b style="width:38%"></b></i><strong>5</strong></div><p>Project-defined analytical bands; not utility alarm limits.</p></div><div class="condition-mini-card"><span class="review-label">CONFIDENCE / DATA QUALITY</span><div class="distribution-row"><span>HIGH</span><i><b style="width:85%"></b></i><strong>11</strong></div><div class="distribution-row"><span>MODERATE</span><i><b style="width:8%"></b></i><strong>1</strong></div><div class="distribution-row"><span>LIMITED</span><i><b style="width:8%"></b></i><strong>1</strong></div><p>TX-J is limited because 40.27% of rows have missing gas measurements.</p></div><div class="condition-mini-card"><span class="review-label">COMPONENT WEIGHTS</span><div class="weight-list"><span><b>30%</b> fleet anomaly intensity</span><span><b>20%</b> persistence</span><span><b>20%</b> recency</span><span><b>15%</b> specific baseline · <b>15%</b> trend</span></div><p>No failure probability is calculated.</p></div></div>
          <div class="condition-note"><span>↳</span><strong>Read this as a screening indicator.</strong><p>Statistical deviation is not a diagnosis or causal explanation. Review recent DGA history, sampling continuity, transformer-specific behaviour, and qualified engineering context before any action.</p></div>
        </section>

        <section class="model-lab-section section-pad" id="model-lab">
          <div class="section-kicker"><span>05D</span><span>Optional / synthetic model lab</span></div>
          <div class="model-lab-head"><div><h2>Demonstrate the workflow,<br/><em>not the utility result.</em></h2></div><p>These tabs remain available as a fixed-seed synthetic demonstration. They are intentionally separated from the real-data evidence above and must not be read as performance on the 13-transformer source.</p></div>
          <div class="model-tabs" role="tablist" aria-label="Phase 3 model tabs"><button class="model-tab active" role="tab" aria-selected="true" aria-controls="evaluation-panel" data-model-panel="evaluation-panel">Model evaluation</button><button class="model-tab" role="tab" aria-selected="false" aria-controls="risk-panel" data-model-panel="risk-panel">Risk prediction</button></div>
          <div class="model-panel active" id="evaluation-panel" role="tabpanel">
            <div class="model-meta"><span class="demo-chip">SYNTHETIC DEMO / SEED 42</span><span>12 assets · 5,760 rows · 25 engineered features · 1-hour sampling contract</span></div>
            <div class="metric-table-wrap"><table class="metric-table"><thead><tr><th>Model</th><th>Precision</th><th>Recall</th><th>F1</th><th>ROC-AUC</th><th>PR-AUC</th><th>Accuracy</th></tr></thead><tbody>${phase3Metrics.map((metric) => `<tr><td><strong>${metric.model}</strong></td><td>${metric.precision}</td><td class="metric-highlight">${metric.recall}</td><td>${metric.f1}</td><td>${metric.roc_auc}</td><td>${metric.pr_auc}</td><td>${metric.accuracy}</td></tr>`).join('')}</tbody></table></div>
            <div class="evaluation-foot"><div><span class="tiny-label">PRIMARY READ</span><strong>Recall is slightly higher for Random Forest in this demo.</strong></div><div><span class="tiny-label">SPLIT</span><strong>Chronological / 60% train · 20% validation · 20% test</strong></div><div><span class="tiny-label">CAUTION</span><strong>Metrics are not transferable to real assets.</strong></div></div>
          </div>
          <div class="model-panel" id="risk-panel" role="tabpanel" hidden>
            <div class="model-meta"><span class="demo-chip">RANDOM FOREST / TEST-PERIOD SNAPSHOT</span><span>Risk probabilities shown for synthetic demo assets only.</span></div>
            <div class="prediction-grid">${syntheticRiskRows.map((row) => `<article class="prediction-card"><div class="prediction-top"><span>${row.asset}</span><b>${row.priority}</b></div><div class="prediction-probability">${row.probability}</div><div class="prediction-bar"><i style="width:${row.probability}"></i></div><div class="prediction-bottom"><span class="band-label ${row.band.toLowerCase()}">${row.band}</span><span>${row.health}</span></div></article>`).join('')}</div>
            <div class="prediction-note"><span>↳</span><strong>Decision support, not diagnosis.</strong><p>Use the risk band to prioritise review of the underlying measurements, data quality, and maintenance history—not to trigger autonomous action.</p></div>
          </div>
        </section>

        <section class="review-lab-section section-pad" id="review-lab">
          <div class="section-kicker"><span>05E</span><span>Optional / synthetic review layer</span></div>
          <div class="review-lab-head"><div><h2>Explain the signal.<br/><em>Then decide.</em></h2></div><p>These explainability and maintenance views remain synthetic demonstrations until a real supervised target exists. They support review; they do not diagnose or control equipment.</p></div>
          <div class="review-tabs" role="tablist" aria-label="Phase 4 review tabs"><button class="review-tab active" role="tab" aria-selected="true" aria-controls="explainability-panel" data-review-panel="explainability-panel">Explainability</button><button class="review-tab" role="tab" aria-selected="false" aria-controls="maintenance-panel" data-review-panel="maintenance-panel">Maintenance recommendations</button></div>
          <div class="review-panel active" id="explainability-panel" role="tabpanel">
            <div class="review-meta"><span class="demo-chip">SYNTHETIC DEMO / FEATURE IMPORTANCE</span><span>Random Forest global importance + logistic local contribution proxy</span></div>
            <div class="explain-grid"><div class="importance-list"><div class="review-label">TOP GLOBAL FEATURES</div>${phase4Features.map((feature) => `<div class="importance-row"><span>${feature.name}</span><i><b style="width:${feature.value}"></b></i><strong>${feature.value}</strong></div>`).join('')}</div><div class="local-explain-card"><div class="review-label">LOCAL REASON CODES / TX-010</div><div class="local-risk"><strong>72.9%</strong><span>Elevated / P1</span></div>${phase4LocalFactors.map((factor) => `<div class="factor-row"><span>${factor.name}</span><b class="${factor.direction === 'raises risk' ? 'raises' : 'reduces'}">${factor.direction}</b></div>`).join('')}<p>Method note: standardised Logistic Regression coefficient contributions. These are not SHAP values.</p></div></div>
            <div class="review-note"><span>↳</span><strong>Explainability is a review aid.</strong><p>Check whether the contributing signals are physically plausible, available before the prediction timestamp, and supported by the underlying data-quality record.</p></div>
          </div>
          <div class="review-panel" id="maintenance-panel" role="tabpanel" hidden>
            <div class="review-meta"><span class="demo-chip">FLEET PRIORITISATION / P1–P5</span><span>Health score = risk, thermal, loading, and data-quality components</span></div>
            <div class="maintenance-list">${phase4Fleet.map((row) => `<article class="maintenance-row"><div class="maintenance-rank"><b>${row.priority}</b><span>${row.asset}</span></div><div class="maintenance-risk"><strong>${row.risk}</strong><span>risk probability</span></div><div class="maintenance-health"><strong>${row.health}</strong><span>health score</span></div><div class="maintenance-suggestion"><span>${row.band}</span><p>${row.suggestion}</p></div></article>`).join('')}</div>
            <div class="review-note"><span>↳</span><strong>Suggested action, not an automatic work order.</strong><p>Use the ranking to focus engineering attention, verify recent measurements, and check maintenance history before changing inspection plans.</p></div>
          </div>
        </section>

        <section class="boundaries section-pad" id="boundaries">
          <div class="section-kicker"><span>06</span><span>Scope / boundaries</span></div>
          <div class="boundaries-grid">
            <div class="boundary-col does"><div class="boundary-title"><span class="boundary-icon">+</span><h2>This prototype<br/><em>does.</em></h2></div><ul><li>Analyse historical measurements and available equipment information.</li><li>Estimate future failure risk when the data supports a valid target.</li><li>Compare risk across multiple transformers and surface contributing features.</li><li>Produce health, prioritisation, and maintenance-oriented decision support.</li></ul></div>
            <div class="boundary-divider"><span>VS</span></div>
            <div class="boundary-col doesnt"><div class="boundary-title"><span class="boundary-icon">−</span><h2>This prototype<br/><em>does not.</em></h2></div><ul><li>Replace SCADA, sensor infrastructure, alarms, or diagnostic techniques.</li><li>Autonomously control equipment, perform repairs, or diagnose failures.</li><li>Invent labels, sensor variables, performance claims, or production status.</li><li>Replace qualified electrical engineers or professional inspection.</li></ul></div>
          </div>
        </section>

        <section class="timeline-section section-pad" id="progress">
          <div class="section-kicker"><span>07</span><span>Approval gates / progress</span></div>
          <div class="timeline-head"><div><h2>Progress is a<br/><em>permission.</em></h2></div><p>The master prompt is executed phase by phase. Each stop protects the next decision from being built on an unverified assumption.</p></div>
          <div class="timeline"><div class="timeline-item current"><div class="timeline-marker"><span>01</span></div><div><span class="timeline-status">COMPLETE / REAL SOURCE VALIDATED</span><h3>Inspect and validate the dataset</h3><p>Real DGA data, provenance, schema, timestamps, missingness, phase coverage, and licensing are documented.</p></div><div class="timeline-gate">GATE 01<br/><strong>Source fit for DGA analysis</strong></div></div><div class="timeline-item current"><div class="timeline-marker"><span>02</span></div><div><span class="timeline-status">COMPLETE / EDA + FEATURES</span><h3>Explore, engineer, and define</h3><p>Real gas distributions, transformer coverage, and current/trailing feature groups are available; no event label was found.</p></div><div class="timeline-gate">GATE 02<br/><strong>Feature target decision</strong></div></div><div class="timeline-item current"><div class="timeline-marker"><span>03</span></div><div><span class="timeline-status">COMPLETE / ANOMALY PROXY</span><h3>Screen unusual DGA behaviour</h3><p>Unsupervised scores and a top-5% descriptive proxy are available for engineering review. They are not failure predictions.</p></div><div class="timeline-gate">GATE 03<br/><strong>Review proxy context</strong></div></div><div class="timeline-item"><div class="timeline-marker"><span>04</span></div><div><span class="timeline-status">BLOCKED / LABEL REQUIRED</span><h3>Supervise, explain, and prioritise</h3><p>Failure-risk modelling still waits for an authoritative fault/event table or an explicitly approved engineering target.</p></div><div class="timeline-gate">GATE 04<br/><strong>Target safe to interpret?</strong></div></div></div>
        </section>

        <section class="next-phase section-pad" id="next-phase">
          <div class="next-card"><div class="next-card-main"><span class="eyebrow"><span class="eyebrow-index">NEXT</span> Approval checkpoint</span><h2>Review the unusual<br/>before you <em>act.</em></h2><p>The approved anomaly screen is ready for engineering interpretation. The next move is to review the top rows and decide whether an external event table or documented DGA alarm objective should be added.</p><button class="button button-primary approval-button" type="button">Request proxy review ${icon('arrow')}</button><div class="approval-confirm" role="status" aria-live="polite"></div></div><div class="next-card-side"><div class="next-symbol">↗</div><span class="tiny-label">DECISION LOG</span><strong>Failure target remains unavailable.</strong><p>The top-5% anomaly proxy is not a <code>failure_24h</code> label.</p></div></div>
        </section>

        <footer class="footer"><div class="footer-brand"><span class="brand-mark small"><i></i><i></i><b></b></span><span>GridWatch</span></div><p>Student Data Science prototype for transformer health monitoring and failure-risk decision support.</p><div class="footer-meta"><span>Built to be inspected.</span><span>Not a production utility system.</span></div></footer>
      </main>
    </div>
  </div>
`

const phasePanel = document.querySelector<HTMLDivElement>('#phase-panel')!
const phaseTabs = document.querySelectorAll<HTMLButtonElement>('.phase-tab')

const renderPhase = (phase: Phase) => {
  phasePanel.innerHTML = `<div class="phase-panel-number">${phase.number}</div><div class="phase-panel-main"><span class="eyebrow">${phase.eyebrow}</span><h3>${phase.name}</h3><p>${phase.description}</p><div class="phase-evidence"><span class="evidence-icon">${icon('check')}</span><span><small>EXPECTED EVIDENCE</small><strong>${phase.evidence}</strong></span></div></div><div class="gate-card"><span class="gate-symbol">⌁</span><small>GATE CONDITION</small><strong>${phase.gate}</strong></div>`
}

phaseTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const phase = phases.find((item) => item.id === tab.dataset.phase)
    if (!phase) return
    phaseTabs.forEach((item) => {
      const active = item === tab
      item.classList.toggle('active', active)
      item.setAttribute('aria-selected', String(active))
    })
    renderPhase(phase)
  })
})

document.querySelectorAll<HTMLButtonElement>('.row-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const currentRow = button.closest('tr') as HTMLTableRowElement
    const rationaleRow = currentRow.nextElementSibling as HTMLTableRowElement
    const isVisible = rationaleRow.classList.toggle('visible')
    currentRow.classList.toggle('expanded', isVisible)
    button.setAttribute('aria-expanded', String(isVisible))
  })
})

const conditionDetailPanel = document.querySelector<HTMLDivElement>('#condition-detail-panel')
const conditionDetailAsset = document.querySelector<HTMLSpanElement>('#condition-detail-asset')
const conditionDetailConfidence = document.querySelector<HTMLSpanElement>('#condition-detail-confidence')
const componentLabels = ['Intensity', 'Persistence', 'Recency', 'Specific baseline', 'Trend / change']
const renderConditionDetail = (row: ConditionAsset) => {
  if (!conditionDetailPanel || !conditionDetailAsset || !conditionDetailConfidence) return
  conditionDetailAsset.textContent = row.asset
  conditionDetailConfidence.textContent = row.confidence.toUpperCase()
  conditionDetailConfidence.className = `real-chip ${row.confidence.startsWith('Limited') ? 'warning' : ''}`
  conditionDetailPanel.innerHTML = `<div class="condition-detail-score"><div><span class="tiny-label">DGA CONDITION INDICATOR</span><strong>${row.indicator.toFixed(2)}</strong><span class="condition-band-chip ${row.band.toLowerCase().replace(' ', '-')}">${row.band} · ${row.priority}</span></div><div class="condition-detail-bar"><i style="width:${row.indicator}%"></i></div></div><div class="condition-detail-facts"><div><span>Fleet p95</span><strong>${row.p95}</strong></div><div><span>Specific p95</span><strong>${row.baseline}</strong></div><div><span>Recent flags</span><strong>${row.recent} · ${row.recentRate}</strong></div><div><span>Longest run</span><strong>${row.maxRun}</strong></div><div><span>Last anomaly</span><strong>${row.daysSince}</strong></div></div><div class="condition-components">${row.components.map((value, index) => `<div><span>${componentLabels[index]}</span><i><b style="width:${Math.round(value * 100)}%"></b></i><strong>${Math.round(value * 100)}%</strong></div>`).join('')}</div><div class="condition-reasons"><span class="review-label">EVIDENCE-BOUND REASONS</span>${row.reasons.map((reason) => `<span><i></i>${reason}</span>`).join('')}</div><div class="condition-suggestion"><span class="review-label">ENGINEERING REVIEW SUGGESTION</span><p>${row.suggestion}</p></div>`
}

const conditionQueue = document.querySelectorAll<HTMLButtonElement>('.condition-queue-row')
conditionQueue.forEach((button) => {
  button.addEventListener('click', () => {
    const row = realConditionAssets.find((item) => item.asset === button.dataset.conditionAsset)
    if (!row) return
    conditionQueue.forEach((item) => item.classList.toggle('selected', item === button))
    renderConditionDetail(row)
  })
})
renderConditionDetail(realConditionAssets[0])

document.querySelectorAll<HTMLButtonElement>('.model-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const panelId = tab.dataset.modelPanel
    if (!panelId) return
    document.querySelectorAll<HTMLButtonElement>('.model-tab').forEach((item) => {
      const active = item === tab
      item.classList.toggle('active', active)
      item.setAttribute('aria-selected', String(active))
    })
    document.querySelectorAll<HTMLDivElement>('.model-panel').forEach((panel) => {
      const active = panel.id === panelId
      panel.classList.toggle('active', active)
      panel.hidden = !active
    })
  })
})

document.querySelectorAll<HTMLButtonElement>('.review-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const panelId = tab.dataset.reviewPanel
    if (!panelId) return
    document.querySelectorAll<HTMLButtonElement>('.review-tab').forEach((item) => {
      const active = item === tab
      item.classList.toggle('active', active)
      item.setAttribute('aria-selected', String(active))
    })
    document.querySelectorAll<HTMLDivElement>('.review-panel').forEach((panel) => {
      const active = panel.id === panelId
      panel.classList.toggle('active', active)
      panel.hidden = !active
    })
  })
})

document.querySelector<HTMLButtonElement>('.approval-button')?.addEventListener('click', (event) => {
  const button = event.currentTarget as HTMLButtonElement
  const confirmation = document.querySelector<HTMLDivElement>('.approval-confirm')!
  button.disabled = true
  button.innerHTML = `Review request noted ${icon('check')}`
  confirmation.textContent = 'Local prototype state: phase 01 is marked for review. No model run was started.'
})
