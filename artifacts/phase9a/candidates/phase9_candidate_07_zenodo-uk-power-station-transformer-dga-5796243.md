# Phase 9A candidate review: UK Power Station Transformer DGA Data (2010–2015)

**Candidate ID:** `zenodo-uk-power-station-transformer-dga-5796243`  
**Review decision:** **Negative/uncertain for supervised transformer-fault or failure prediction; useful for exploratory asset-health/DGA time-series and geomagnetic-storm-response analysis.**  
**Review scope:** Public metadata, the publisher repository description and README, and the associated peer-reviewed paper were checked. The ZIP/CSV data were **not downloaded or parsed**, and no model was trained.

## Evidence base and provenance

The canonical Zenodo record is DOI [10.5281/zenodo.5796243](https://doi.org/10.5281/zenodo.5796243). It identifies Zoë M. Lewis (Imperial College London), James A. Wild (Lancaster University), and Matthew Allcock (EDF Energy R&D UK Centre) as creators, and Douglas Barker (EDF Energy Nuclear Generation) as data collector. The record says that the data came from 13 UK power-station transformers and supported the associated Space Weather paper. [1] [2]

The Lancaster University research-data record is a second authoritative publisher/repository page. It describes one CSV per transformer, an additional geomagnetic-storm list, and the README documentation. It gives the production period as 2010–2015 and availability date as 23 February 2022. [3] [4] The associated paper is Lewis, Wild, Allcock and Walach, “Assessing the Impact of Weak and Moderate Geomagnetic Storms on UK Power Station Transformers,” *Space Weather* (2022), DOI [10.1029/2021SW003021](https://doi.org/10.1029/2021SW003021). The paper’s data-availability statement points back to the Lancaster repository. [5] [6]

## Findings against the 13 review checks

### 1. Transformer/asset identity — **Confirmed, but anonymized and limited**

There are **13 UK power-station transformers** connected to the national electricity grid. The associated paper names them only as anonymized assets **A through M**; the paper explicitly says that the transformers were anonymized. The Lancaster repository exposes one file for each transformer, with names such as `Lewis_et_al_2022_Transformer_A.csv` through `..._M.csv`. [3] [5]

No plant name, geographic site, transformer make/model, rating, age, winding configuration, phase identifier beyond the CSV structure, or persistent utility asset identifier is exposed in the public descriptions. Asset identity is therefore suitable for within-transformer longitudinal analysis, but not for linking to an external asset registry.

### 2. Timestamp availability — **Confirmed**

Each transformer CSV has a header, and each subsequent record corresponds to the timestamp in the **first column**. The repository README states that timestamps are in **Universal Time (UTC)**. [4] [6]

The paper reports the overall period as 2010–2015 but gives different coverage windows by anonymized transformer:

- A: 7 August 2014–9 July 2015
- B: 10 January 2011–18 May 2015
- C: 14 September 2010–9 July 2015
- D: 2 July 2010–9 July 2015
- E, F, G, H and J: 9 July 2010–9 July 2015
- I: 29 July 2013–9 July 2015
- K: 27 September 2010–9 July 2015
- L: 4 June 2011–9 July 2015
- M: 30 October 2013–9 July 2015. [5]

The exact timestamp format, timezone encoding syntax, duplicate policy, and whether every nominal three-per-day observation has a unique timestamp are **unknown without reading the CSVs**.

### 3. Sensor measurements — **Confirmed for DGA; broader sensors not confirmed**

The released measurements are dissolved-gas concentrations in transformer coolant/insulating oil, reported in **parts per million (ppm)**. The README says that eight trace gases are recorded in each transformer phase except C and D, for which eight gases are recorded in one phase only. [4] [6]

The paper explicitly names the six key gases used in its analysis: **methane, ethylene, ethane, hydrogen, acetylene, and carbon monoxide**. [5] The public README does not name the remaining two trace-gas columns, so the complete eight-gas schema is **not confirmed from the documentation reviewed**. The article describes these concentrations as automatically recorded. [5]

No electrical load, winding temperature, oil temperature, ambient temperature, current, voltage, dissolved-water, bushing, tap-changer, or direct geomagnetically induced-current measurement is documented as part of the released transformer files. The paper says that SYM-H and the rate of change of the horizontal magnetic field at Eskdalemuir were used as external geomagnetic proxies; it also states that GICs themselves were not measured in this period. [5]

### 4. Failure/fault/event labels — **No supervised failure labels found; explicit negative evidence in the paper**

The dataset documentation describes DGA records and a geomagnetic-storm list, not a fault/outage/repair table. The paper states that **none of the transformers studied are known to have developed a fault during the period**. It also reports that no operational problems were reported for transformer D in one case study. [5]

Therefore, there is no confirmed binary failure label, fault type, trip/outage label, maintenance outcome, or time-to-failure outcome in the public record or README. An abnormal DGA-derived region is not equivalent to a verified fault: the paper cautions that an abnormal Low Energy Degradation Triangle (LEDT) result does not establish that failure will occur. [5]

### 5. Event timestamps — **Geomagnetic events confirmed; transformer fault-event timestamps absent**

The repository includes `Walach_storm_list_2010_2015.txt`, a column-separated list of geomagnetic storms with a simple header. [3] [4] The paper uses storm sudden commencements and storm phases as alignment events, and analyzes 98 transformer–storm combinations where coverage permitted. [5]

These are **external geomagnetic events**, not transformer-failure or transformer-fault timestamps. No event-time field for a confirmed transformer incident is documented. Exact storm-list columns and event-time semantics were not inspected because the text file was not downloaded.

### 6. Join keys — **A practical partial key exists; no explicit relational key is documented**

For the transformer records, the practical key is the anonymized transformer letter from the filename (`A`–`M`) plus the UTC timestamp in the first column. The repository structure supports one separate file per asset, rather than a single table with a documented `transformer_id` column. [3] [4]

A storm join could use the storm-list event timestamp/date plus the transformer letter, with an explicitly chosen time window. That is an analytical join design, not a documented native key. There is no documented utility asset ID, plant ID, phase ID column, event ID, or maintenance ID. Exact uniqueness and duplicate behavior are **unknown until the files are parsed**.

### 7. Sampling frequency — **Confirmed nominal cadence, irregularities expected**

The paper says gas concentrations are automatically recorded **three times every 24 hours** (nominally about 8-hour spacing). [5] The paper also reports breaks in the time series associated with operation and maintenance. Consequently, the effective sampling is not guaranteed to be gap-free or exactly regular. The precise cadence distribution, timestamp jitter, and per-transformer observation counts are **unknown without parsing**.

### 8. Data volume — **File-level volume confirmed; row count unknown**

Zenodo publishes one ZIP, `Lewis_et_al_2022_DGA_data.zip`, with a recorded size of **4,063,700 bytes** (about 4.06 MB decimal; compressed archive) and an MD5 checksum in its API metadata. [2] The Lancaster mirror exposes 13 transformer CSVs, the storm list, and README files. Its page lists rounded per-file sizes; summing those displayed sizes gives approximately **20.4 MB** across the mirror’s listed files, but this is only an approximate total because the page rounds sizes and the Zenodo archive is compressed. [3]

The number of rows, number of measurements per gas/phase, and total timestamp count are **not confirmed** without downloading/parsing the data. The dataset is large enough for within-asset exploratory time-series work, but it is a small asset count for generalizable cross-asset supervised learning: only 13 anonymized transformers are available.

### 9. Missingness and data-quality behavior — **Qualitative missingness confirmed; rates unknown**

The paper reports **breaks in the time series for operation and maintenance**, intervals where gas concentrations reset to baseline, and a large discontinuity in one transformer’s dissolved-gas data before a September 2014 storm. It also describes the gas series as noisy and highly variable. [5] These are material data-quality and regime-change issues.

The exact missing-value encoding, missingness rate by gas/phase/transformer, duplicate count, outlier policy, and whether resets are represented as zeros, near-zero values, or another code are **unknown**. A reset associated with oil processing must not automatically be treated as a failure or as ordinary missingness.

### 10. Provenance — **Strong institutional/industry provenance confirmed**

The record attributes the dataset to Imperial College London, Lancaster University, EDF Energy R&D UK Centre, and EDF Energy Nuclear Generation through creators, affiliations, and the data-collector acknowledgement. The paper and README acknowledge EDF Energy Nuclear Generation for providing the DGA records. [1] [4] [5]

The dataset is supplementary data for a peer-reviewed *Space Weather* article, rather than a benchmark assembled from anonymous web uploads. The utility’s real-world asset names and detailed operating context are intentionally withheld, which limits external validation and asset-level interpretation.

### 11. Licence — **Confirmed: Creative Commons Attribution 4.0 International (CC BY 4.0)**

Zenodo’s API metadata identifies the licence as `cc-by-4.0`; the Lancaster repository page labels the files **CC BY**. [2] [3] Reuse should preserve attribution to the dataset creators and cite the 2022 paper as requested by the README and landing pages.

### 12. Future target without leakage — **Fault target not feasible from released evidence; proxy targets are possible with caveats**

A verified future transformer-fault or transformer-failure target **cannot be constructed from the released documentation alone**. There are no documented fault outcomes or fault timestamps, and the paper says no studied transformer is known to have developed a fault during the period. It would be incorrect to label rows as “failed” merely because DGA concentrations are high, an LEDT is outside a normal region, a gas series resets, or a geomagnetic storm occurs.

A future **proxy** target could be constructed if the raw files were later obtained and parsed, for example:

- next-observation or multi-day-ahead gas concentration / gas-production-rate forecasting;
- future change in a defined DGA index or LEDT-derived score;
- response to a pre-specified geomagnetic storm window; or
- a threshold-crossing target defined as an analytical abnormality, explicitly **not** a verified failure.

Such proxies would require a pre-registered threshold and horizon, strict time ordering, and a separate statement that they measure DGA evolution or storm response rather than actual failure risk. With only 13 assets and heterogeneous date ranges, an asset-held-out evaluation would have very few independent test units.

### 13. Limitations and recommended use — **Exploratory/unsupervised or event-response use recommended**

Recommended uses are:

1. within-transformer longitudinal visualization and descriptive DGA analysis;
2. forecasting or change detection for gas concentrations, with targets defined from future observations only;
3. comparison of DGA trajectories around the provided geomagnetic-storm events;
4. testing missingness-aware time-series methods, maintenance-gap handling, and oil-processing reset detection; and
5. exploratory assessment of whether external geomagnetic indices align with DGA changes.

Not recommended as a stand-alone benchmark for supervised fault classification, failure prediction, remaining useful life, or causal claims about geomagnetically induced transformer damage. The limitations are substantial: only 13 assets; anonymized identities; unequal coverage; maintenance and oil-processing discontinuities; no verified fault outcomes; no direct GIC measurements; only six of the eight gas names identified in the paper; unknown detailed missingness; and a relatively quiet 2010–2015 solar/geomagnetic period. The paper itself found no systematic space-weather impact in this period and notes that the measured geomagnetic activity did not reach levels generally considered a substantial infrastructure risk. [5]

## Leakage controls if the dataset is used for a proxy task

- Split by time, not random rows. Keep a forecast horizon gap so future-window features cannot overlap the target window.
- Group by anonymized transformer for cross-asset evaluation; otherwise the model can memorize asset-specific baselines.
- Fit scaling, imputation, normalization, and any LEDT/threshold parameters on the training period only.
- Treat maintenance breaks and oil-processing resets as observed regimes or missingness indicators, not as labels.
- If storms are used, define the event start from the storm list before looking at post-event gases, and avoid using future gas values in a pre-event prediction feature set.
- Do not call a high gas level, abnormal LEDT region, or storm-associated change a “fault” unless an independent operational outcome is added from a separately documented source.

## Bottom line

The candidate is a credible, openly licensed, real-utility DGA time-series resource with 13 anonymized transformers, UTC timestamps, nominal three-per-day sampling, multi-gas ppm measurements, and an accompanying geomagnetic-storm list. It is **not a confirmed supervised fault-label dataset**. The correct Phase 9A disposition is **negative/uncertain for fault-label modeling**, while retaining it for exploratory asset-health, temporal generalization, missingness/regime-change, and geomagnetic-event-response work.

## References

[1]: https://zenodo.org/records/5796243 "Zenodo record: UK Power Station Transformer Dissolved Gas Analysis Data (2010–2015)"

[2]: https://zenodo.org/api/records/5796243 "Zenodo API metadata for record 5796243"

[3]: https://research.lancaster-university.uk/en/datasets/uk-power-station-transformer-dissolved-gas-analysis-data-2010-201-2/ "Lancaster University Research Data repository record"

[4]: https://research.lancaster-university.uk/files/350118968/readme.txt "Original Lancaster repository README"

[5]: https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2021SW003021 "Lewis et al. (2022), Assessing the Impact of Weak and Moderate Geomagnetic Storms on UK Power Station Transformers"

[6]: https://doi.org/10.17635/lancaster/researchdata/510 "Lancaster University dataset DOI landing page"
