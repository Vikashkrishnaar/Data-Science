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
      <div class="topbar-meta"><span class="live-dot"></span><span>Prototype / phase 01</span><span class="meta-divider"></span><span>Decision support, not control</span></div>
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
            <div class="instrument-head"><span>READINESS / 01</span><span class="instrument-status"><i></i> PLAN READY</span></div>
            <div class="dial-wrap">
              <div class="dial"><div class="dial-inner"><span class="dial-value">01</span><span class="dial-caption">phase</span></div><span class="dial-tick tick-a"></span><span class="dial-tick tick-b"></span><span class="dial-tick tick-c"></span></div>
              <div class="instrument-copy"><span class="tiny-label">CURRENT QUESTION</span><strong>Is the dataset fit<br/>for this question?</strong><span class="instrument-sub">Validation plan is ready. A real source still needs approval.</span></div>
            </div>
            <div class="instrument-readout"><div><span class="tiny-label">PROVISIONAL TARGET</span><code>failure_24h</code></div><div><span class="tiny-label">HORIZON</span><strong>24 h*</strong></div><div><span class="tiny-label">STATUS</span><strong class="lime-text">Dataset pending</strong></div></div>
            <p class="instrument-foot">* Do not treat the 24-hour horizon as fixed until timestamped failure information supports it.</p>
          </div>
        </section>

        <section class="signal-strip" aria-label="Project principles">
          <div><span class="strip-number">12</span><span>analysis phases<br/><small>from input to interface</small></span></div>
          <div><span class="strip-number">03</span><span>approval gates<br/><small>before the next question</small></span></div>
          <div><span class="strip-number">00</span><span>assumed data fields<br/><small>only use what exists</small></span></div>
          <div><span class="strip-number">01</span><span>next decision<br/><small>is the dataset fit?</small></span></div>
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
          <div class="timeline"><div class="timeline-item current"><div class="timeline-marker"><span>01</span></div><div><span class="timeline-status">CURRENT / PLAN READY</span><h3>Inspect and validate the dataset</h3><p>The validation protocol and feature strategy are documented; a real source, licence, and event definition are still required.</p></div><div class="timeline-gate">GATE 01<br/><strong>Fit for question?</strong></div></div><div class="timeline-item"><div class="timeline-marker"><span>02</span></div><div><span class="timeline-status">QUEUED / NEEDS APPROVAL</span><h3>Explore, engineer, and define</h3><p>Only after the dataset assessment confirms what can be measured, labelled, and split safely.</p></div><div class="timeline-gate">GATE 02<br/><strong>Features defensible?</strong></div></div><div class="timeline-item"><div class="timeline-marker"><span>03</span></div><div><span class="timeline-status">CONDITIONAL / LATER</span><h3>Model, explain, and prioritise</h3><p>Compare baselines, evaluate honestly, and translate outputs into inspection-oriented context.</p></div><div class="timeline-gate">GATE 03<br/><strong>Safe to interpret?</strong></div></div></div>
        </section>

        <section class="next-phase section-pad" id="next-phase">
          <div class="next-card"><div class="next-card-main"><span class="eyebrow"><span class="eyebrow-index">NEXT</span> Approval checkpoint</span><h2>Ready to inspect<br/>what the data <em>actually says?</em></h2><p>The next move is not “build the model.” It is to review the dataset assessment and decide whether the proposed question is defensible.</p><button class="button button-primary approval-button" type="button">Request phase 01 review ${icon('arrow')}</button><div class="approval-confirm" role="status" aria-live="polite"></div></div><div class="next-card-side"><div class="next-symbol">↗</div><span class="tiny-label">DECISION LOG</span><strong>Target remains provisional.</strong><p><code>failure_24h</code> will only survive if timestamped failure events and sampling support it.</p></div></div>
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

document.querySelector<HTMLButtonElement>('.approval-button')?.addEventListener('click', (event) => {
  const button = event.currentTarget as HTMLButtonElement
  const confirmation = document.querySelector<HTMLDivElement>('.approval-confirm')!
  button.disabled = true
  button.innerHTML = `Review request noted ${icon('check')}`
  confirmation.textContent = 'Local prototype state: phase 01 is marked for review. No model run was started.'
})
