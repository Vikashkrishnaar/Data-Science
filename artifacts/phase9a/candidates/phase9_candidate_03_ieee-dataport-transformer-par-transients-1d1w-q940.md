# Phase 9A candidate review: IEEE DataPort transformer/PAR transients

**Candidate ID:** `ieee-dataport-transformer-par-transients-1d1w-q940`  
**Dataset:** *Transients and Faults in Power Transformers and Phase Angle Regulators (DATASET)*  
**Decision:** **Useful for simulated waveform/event classification and protection-algorithm benchmarking; not sufficient, as documented, for a leakage-safe future-failure or predictive-maintenance target.**

The IEEE DataPort landing page identifies DOI `10.21227/1d1w-q940` and states that the corpus contains internal-fault files and six other transient classes simulated in PSCAD/EMTDC. It reports 88,128 internal-fault files and 12,780 other-transient files, with text output and a `Dataset_Readme.pdf` supplied with the dataset [1]. The larger 5-bus corpus is described in the authors’ dissertation chapter, which provides substantially more detail on the simulation model, parameter sweeps, signals, timing, and classification labels [2].

## Evidence status

- **Confirmed** means stated on the IEEE DataPort page or in the authors’ original technical documentation/dissertation chapter.
- **Unknown** means it cannot be verified from the authoritative pages and documentation available without downloading the dataset archive. Per the review instruction, the archive was **not downloaded**, and no model was trained.
- The dissertation reports exact sample-window details used by its classification study. It does not, by itself, prove that every raw text file in the downloadable archive has the same schema or that a timestamp column is included.

## 1. Transformer/asset identity

**Confirmed:** This is a simulated 5-bus interconnected system containing a power transformer and a phase-angle regulator (PAR/ISPAR). The authors’ larger-corpus description identifies a 500-MVA, 230-kV system and creates internal faults in three modeled units: the power transformer, the ISPAR series unit, and the ISPAR exciting unit [2]. The fault-location classifier therefore uses the asset/unit classes **Power Transformer**, **ISPAR series**, and **ISPAR exciting** [2].

**Not confirmed:** The archive does not expose, on the landing page, a per-row asset inventory, a stable equipment identifier, manufacturer/model metadata, or a count of distinct asset instances. The three unit classes are simulation-model locations, not evidence of three independent field assets. For `number_of_assets`, the defensible value is: **no row-level asset count/ID is published; the documented model contains one power-transformer model and one ISPAR represented by series/exciting units.**

## 2. Timestamp availability and time coverage

**Confirmed:** The authors document a fixed simulation timeline for the larger corpus: total run time **15.2 s**, event/fault inception at **15.0 s**, and fault duration **0.05 s (three 60-Hz cycles)** [2]. Fault-inception time is swept from 15.0000 s to approximately 15.0153 s in 1.38-ms steps for the internal-fault cases; related transient scenarios use the same style of switching-time sweep [2]. The underlying system is described as operating at 60 Hz [2].

**Unknown:** A wall-clock timestamp, date/time field, or timestamp column per sample/file is not shown on the DataPort page. The landing page only says that outputs are text files and points to `Dataset_Readme.pdf` [1]. Therefore, **timestamp availability in the raw archive is unknown**. The documented simulation times should be treated as scenario metadata, not as evidence that each file carries a usable timestamp column. There is no real-world time coverage or longitudinal operating history.

## 3. Sensor measurements

**Confirmed:** The documented classifier uses **three-phase differential currents** measured from current-transformer locations. In the proposed scheme, the change detector operates on the three-phase differential current, described as the difference between the power-transformer/PAR-side currents (`I_P - I_S`), and registers post-event samples [2]. The earlier related ISPAR documentation likewise describes three-phase differential currents from CTs [3].

**Likely but not established as a raw-file schema:** phase-A, phase-B, and phase-C current channels are the principal waveform inputs. The technical study derives time/frequency features from those current channels. The public landing page does not enumerate all columns, units, sign conventions, CT ratios, or whether auxiliary voltages, breaker states, flux, tap position, or simulation control variables are included in each text file [1]. Do not assume that the raw archive contains anything beyond the documented current waveforms and any accompanying labels/metadata.

## 4. Failure, fault, and event labels

**Confirmed at the taxonomy level:** The IEEE page lists internal faults plus six non-fault transients: **magnetising inrush, sympathetic inrush, external faults with CT saturation, capacitor switching, non-linear-load switching, and ferroresonance** [1]. The authors’ technical description further identifies internal phase/ground faults, turn-to-turn faults, and winding-to-winding faults, with fault location in the power transformer, ISPAR series unit, or ISPAR exciting unit [2]. The parameter sweeps include fault resistance, percentage of turns shorted, fault type, fault-inception time, phase shift, tap/LTC position, and fault location [2].

**Unknown at the file/schema level:** The landing page does not show whether the labels are in filenames, separate target text files, a manifest, or embedded columns. The supplied `Dataset_Readme.pdf` is identified as the detailed file description, but it was not available through the static landing-page extraction and the archive was not downloaded [1]. Thus, **event/fault classes are confirmed as intended labels, but exact label encoding, class ordering, and one-to-one mapping to files are unknown**.

## 5. Event timestamps

**Confirmed as simulation metadata:** The author documentation supplies event/fault inception times and durations. Internal-fault parameter grids vary the inception time near 15 s, and the documented duration is 0.05 s [2].

**Not confirmed as per-record fields:** There is no authoritative evidence on the public page that each waveform row/file includes an event timestamp, event onset index, or a synchronized time vector [1]. The event detector in the paper identifies a change and then takes fixed pre/post-event windows; that is an algorithmic extraction procedure, not proof that the downloaded archive contains event-onset labels [2]. **Do not claim event timestamps are available in the data.** At most, a scenario-level inception time may be reconstructable if the full simulation trace and fixed sample clock are included, which remains unverified.

## 6. Join keys

**Unknown:** No stable join key is exposed on the landing page. In particular, the public metadata does not document an asset ID, simulation-run ID, event ID, timestamp key, waveform/label filename convention, or manifest schema [1]. The authors’ study uses class labels and parameterized simulation cases, but the accessible text does not establish the archive’s exact key columns or naming rules [2]. A safe review disposition is **join key: unknown; assume none until `Dataset_Readme.pdf` and the archive manifest are inspected**.

This matters because a waveform file can be paired with a target only if the file-to-label mapping is deterministic and documented. File ordering alone is not a robust join key.

## 7. Sampling frequency

**Confirmed for the documented classification windows:** The authors state a sampling rate of **10 kHz** and **167 samples per 60-Hz cycle** (approximately 10,000/60 = 166.7 samples/cycle) [2]. The detection study uses 1.5 cycles of three-phase differential currents, while localization and disturbance identification use three post-event cycles [2]. The earlier related ISPAR paper also reports 10 kHz and 167 samples per cycle [3].

**Caveat:** This establishes the sampling used in the authors’ waveform-processing study, not necessarily the complete raw text-file layout. Whether the archive contains full 15.2-s traces, extracted windows, a time column, or resampled rows is **unknown without the readme/archive**. Do not infer raw file length from the 167-sample feature windows.

## 8. Data volume

**Confirmed:** The landing page reports **88,128 internal-fault files + 12,780 other-transient files = 100,908 files** [1]. It says that output files are text format and that the package includes `Dataset_Readme.pdf` [1]. The DataPort Dataset Files listing reports an archive named along the lines of `Dataset for Transformer & PAR transients.zip`; the page’s indexed file listing reports approximately **867.24 MB**, although the static text extraction does not reproduce the size field [1].

The corpus is therefore large in file count but is a **simulation case corpus**, not a long operational history. The author chapter reports a 4:1 random train/test split for its classifier experiments and gives 19,794 total cases in one summary (internal faults plus disturbances) [2]; that is an experimental split/summary, not a replacement for the DataPort file counts.

## 9. Missingness and data quality

**Unknown:** Neither the DataPort page nor the accessible original documentation provides a missing-value report, per-channel completeness rate, NaN/sentinel convention, duplicate-file rate, clipping/saturation handling, or quality-control summary [1] [2]. The term “external faults with CT saturation” describes a simulated physical effect and must not be confused with missing data.

Do not impute or claim complete data before inspection. A future data-use review should check text parsing, number of columns, row counts, finite values, duplicated parameter combinations, constant channels, file/label count equality, and whether failed simulation runs are absent or represented by partial files.

## 10. Provenance

**Confirmed:** The dataset is authored by Pallav K. Bera, Can Isik, and Vajendra Kumar and was deposited on IEEE DataPort in 2020 under DOI `10.21227/1d1w-q940` [1]. The landing page and author documentation state that the waveforms are generated by **PSCAD/EMTDC** simulation in a 5-bus interconnected system [1] [2]. The technical description says the authors developed two- and three-winding transformer fault models, varied electrical/fault parameters through multi-run simulations, and generated the internal-fault and transient cases [2].

**Implication:** Provenance is simulation-derived and model-dependent. It is not field telemetry, a fleet-maintenance log, or evidence of naturally occurring failure progression. The 60-Hz, 500-MVA, 230-kV modeled system and parameter grids define the domain of validity [2].

## 11. Licence and access

**Confirmed:** The landing page does not display a dataset-specific licence field in the accessible metadata [1]. IEEE DataPort’s Terms of Use say that content is generally made available subject to **Creative Commons Attribution (CC BY)** unless IEEE specifically permits otherwise, and they require users to review the licence terms for the particular content and comply with associated obligations [4]. The terms also define authorized-user access and state that use may require payment [4].

**Disposition:** **Dataset-specific licence: unconfirmed.** Do not report an unconditional CC-BY grant for this particular archive without checking the package’s licence/readme or the access page at the time of use. Cite the DOI/authors and consult the current DataPort access terms. “Open access” in the dataset URL does not by itself settle whether a subscription/login is required or what downstream redistribution rights apply.

## 12. Can a future target be constructed without leakage?

### Contemporaneous classification target: potentially yes, subject to schema verification

The intended labels support a **same-window event-classification** target: internal fault versus non-fault transient, transient type, faulty unit, or internal-fault subtype. The authors explicitly train classifiers for these tasks [2]. If the archive’s labels and waveform-to-label join are documented, an event-classification benchmark can be constructed.

This is not the same as predicting a future failure. The target is determined by the simulated scenario and is visible in, or directly associated with, the same event window.

### Future-failure/predictive-maintenance target: no, not supported by the documented data

A future target such as “will this asset fail within the next horizon?” cannot be justified from the public documentation. There is no documented longitudinal asset ID, repeated operational timeline, maintenance/outcome record, health trajectory, censoring information, or future observation window. The corpus is generated by deliberately inserting a fault or transient at a known simulated time. It therefore supplies **event labels**, not naturally observed lead-up-to-failure outcomes.

A model trained to predict the inserted fault from the same trace would be event detection/classification, not a leakage-safe future target. Creating a future target by shifting the known fault label forward in the same 15.2-s simulation would be label engineering, not evidence that the asset had a future failure risk. The target is therefore **not feasible for predictive maintenance as currently documented**.

### Leakage risks

1. **Random file splits can leak simulation families.** Parameter sweeps differ by only one setting (for example, inception time, tap, phase shift, resistance, or winding percentage). Randomly splitting files can place near-identical parameter combinations and the same deterministic model regime in both train and test sets [2].
2. **Event time and event detector windows can reveal the label.** The authors’ windows are selected after a change detector fires and include post-event samples [2]. A task framed as pre-event forecasting must exclude post-inception samples and any event detector output derived from the target event.
3. **Scenario controls are direct proxies.** Fault type, fault location, fault resistance, percentage of turns shorted, tap/LTC, and switching time are simulation parameters that may be present in filenames or metadata. Using them as predictors can make the benchmark a parameter lookup rather than sensing-based prediction.
4. **Repeated deterministic simulations are not independent assets.** Grouping must be by simulation family/parameter combination, model instance, or scenario seed if those keys exist. Without documented group keys, a genuinely leakage-safe split cannot be verified.
5. **Target construction from the full trace leaks the future.** If a full 15.2-s trace is available, any feature computed after the documented 15-s inception is unavailable to a pre-event predictor. The raw trace must be cut at a declared prediction time.

## 13. Limitations and recommended use

### Limitations

- It is **simulation-derived**, so transfer to field transformers, different network topologies, protection settings, CT behavior, noise, harmonics, loading, and aging is uncertain [1] [2].
- It represents a relatively specific 5-bus, 60-Hz model and documented nominal ratings. Parameter sweeps improve coverage but do not create fleet-level diversity [2].
- The archive’s exact file schema, target files, join keys, timestamp columns, units, missingness, and licence are not exposed in the public metadata used for this review [1].
- The class labels describe faults and transient disturbances that are intentionally simulated. They do not establish failure probability, time-to-failure, maintenance outcome, or degradation progression.
- The authors’ high classification scores are from their own feature engineering and random train/test methodology; they should not be read as evidence of real-world predictive-maintenance performance [2].
- File-level counts do not equal independent asset count. Many cases are generated from the same model by changing a small number of parameters.

### Recommended use

Use this candidate for **protection and waveform analytics**, including:

- event detection after an electrical transient;
- classification of internal faults versus the six documented transients;
- fault-type and simulated-unit localization;
- robustness studies for sampling, noise, CT saturation, tap position, and model parameter changes;
- testing leakage-aware group splits and feature pipelines on a known synthetic benchmark.

Do **not** use it as a standalone dataset for future-failure prediction, remaining-useful-life modeling, fleet health monitoring, or claims about field failure rates. If a future target is required, pair it with a longitudinal field dataset that has stable asset IDs, timestamps, maintenance/failure outcomes, and a documented observation horizon.

## Field-level review summary

| Check | Finding | Status |
|---|---|---|
| Transformer/asset identity | Simulated power transformer plus ISPAR series/exciting units in a 5-bus system; no per-row asset inventory published | Confirmed model identity; asset IDs/count unknown |
| Timestamp availability | Simulation times documented; raw timestamp column not shown | Simulation timing confirmed; raw timestamps unknown |
| Sensor measurements | Three-phase differential currents from CT locations are the documented inputs | Confirmed for study; complete raw channels/units unknown |
| Failure/fault/event labels | Internal faults plus six transient classes; fault type/unit taxonomies documented | Classes confirmed; encoding/join schema unknown |
| Event timestamps | Inception/duration parameter ranges documented | Per-file event timestamp field unknown |
| Join keys | No public manifest/key specification | Unknown |
| Sampling frequency | 10 kHz; 167 samples per 60-Hz cycle in the study | Confirmed for documented windows; raw layout caveat |
| Data volume | 88,128 internal-fault + 12,780 transient files = 100,908; indexed archive about 867.24 MB | Counts confirmed |
| Missingness | No report available | Unknown |
| Provenance | PSCAD/EMTDC, authored simulation, 5-bus model, parameter sweeps | Confirmed |
| Licence | No dataset-specific field on landing page; DataPort terms refer generally to CC BY unless otherwise specified | Dataset-specific licence unconfirmed |
| Future target | Same-window classification potentially feasible after schema verification; future-failure target not supported | No predictive-maintenance target claim |

## References

[1]: https://ieee-dataport.org/open-access/transients-and-faults-power-transformers-and-phase-angle-regulators-dataset "IEEE DataPort: Transients and Faults in Power Transformers and Phase Angle Regulators (DATASET)"

[2]: https://arxiv.org/html/2302.03826 "Data-Driven Protection of Transformers, Phase Angle Regulators, and Transmission Lines in Interconnected Power Systems"

[3]: https://ar5iv.labs.arxiv.org/html/2006.09865 "Intelligent Protection & Classification of Transients in Two-Core Symmetric Phase Angle Regulating Transformers"

[4]: https://ieee-dataport.org/ieee-dataport-terms-use "IEEE DataPort Terms of Use"

[5]: https://doi.org/10.21227/1d1w-q940 "DOI landing route for 10.21227/1d1w-q940"
