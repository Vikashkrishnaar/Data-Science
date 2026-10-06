# Phase 9A candidate review: IEEE New England 39-bus transient-stability dataset

**Candidate ID:** `zenodo-ieee-new-england-39bus-7350829`  
**Dataset:** *IEEE New England 39-bus test case: Dataset for the Transient Stability Assessment*  
**Review basis:** authoritative Zenodo record and API metadata, the University of Split institutional entry, the authors’ open-access study, the related raw-simulation Zenodo record, and an authoritative IEEE 39-bus system description. The dataset files were **not downloaded**, and no model was trained.

## Overall determination

This is a **well-documented synthetic, system-level transient-stability classification dataset**, not a transformer-asset or condition-monitoring dataset. The candidate record documents **3,120 stochastic cases**, **350 PMU-type point features**, and a binary `Stability` outcome. The cases are sampled from **9,360 MATLAB/Simulink electro-mechanical simulations** covering three short-circuit types and five load levels. The binary stability target is usable for supervised classification, subject to strict feature-timing controls.

It is **not sufficient by itself for a time-series, event-time, failure-time, or transformer-level task**. The candidate description does not document row-level event timestamps, a simulation/event identifier, fault-location columns, fault-clearance columns, or a missingness profile. The related raw-simulation record documents a time variable and a 1/60-second save resolution, but that is upstream supporting data, not evidence that those fields are present in the candidate’s compressed feature CSV.

## 1. Transformer / asset identity

**Confirmed:** The asset represented is one synthetic IEEE New England 39-bus benchmark network. The original study describes a system with **39 buses and 10 synchronous machines**, with generator G1 representing an aggregation of external generators. It models generators, loads, transmission lines, controls, and transformers as components of the simulated network [4]. An independent IEEE 39-bus system description identifies the case as the “10-machine New-England Power System” [5].

**Not confirmed / absent from candidate metadata:** This is not a collection of individually identified transformers. The candidate’s documented feature names are generator and bus measurements; no transformer identifier, transformer winding/channel identifier, transformer health state, or transformer-specific measurement is listed. The candidate therefore has **one benchmark system identity**, not a documented inventory of transformer assets. The number and identities of transformers in the candidate are not recoverable from the record description alone.

## 2. Timestamp availability and time coverage

**Candidate record:** No calendar timestamp, simulation timestamp, time index, event-start field, or event-end field is listed among the candidate columns. The listed features are point values taken at relay-related instants: pre-fault pickup and post-fault trip [1]. The Zenodo publication date (`2022-11-23`) is record metadata, not data time coverage [2].

**Related documentation:** The authors’ raw-simulation record documents a 3-second observation period per simulation and a `t` variable representing simulation time [3]. The original paper likewise states a 3-second observation period [4]. These facts establish upstream simulation time coverage, but they do **not** establish that `t` or the full waveforms are included in candidate record 7350829.

**Assessment:** The candidate is a **snapshot/tabular feature set**, not a timestamped time series. Its temporal coverage is best stated as “two event-relative snapshots per documented contingency (pickup/pre-fault and trip/post-fault), with no row-level timestamps exposed in the candidate metadata.”

## 3. Sensor measurements / variables

The candidate documents 350 features derived directly from PMU-type simulation signals [1]. Named groups are:

- generator rotor speed (`WmGx`), rotor-angle deviation (`DThetaGx`), rotor mechanical angle (`ThetaGx`), stator voltage (`VtGx`), stator d/q currents (`IdGx`, `IqGx`);
- generator pre-fault and post-fault power-load angle (`LAfvGx`, `LAlvGx`), active power (`PfvGx`, `PlvGx`), and reactive power (`QfvGx`, `QlvGx`);
- bus pre-fault and post-fault voltage magnitudes for phases A, B, and C (`VAfvBx`, `VBfvBx`, `VCfvBx`, `VAlvBx`, `VBlvBx`, `VClvBx`), for buses B1–B39;
- the binary `Stability` label.

The paper clarifies that the selected values are directly measured quantities from simulation signals, rather than additional artificial transformations; voltage/current phase angles were discarded during feature selection [4]. The candidate is therefore a compact event-relative feature table, not raw PMU waveform data and not a complete inventory of all simulated channels.

**Counting caveat:** Zenodo declares 350 features, but its name-group description is not a machine-readable schema and does not provide a downloadable column manifest in the metadata. The apparent arithmetic implied by every listed generator/bus combination should not be used to infer the exact column count without inspecting the CSV, which was intentionally not downloaded.

## 4. Failure, fault, and event labels

**Confirmed target label:** `Stability` is documented as binary: `0 = stable`, `1 = unstable` [1]. The original paper defines the class using a transient stability index (TSI) based on the maximum rotor/load-angle difference between generators: positive TSI indicates synchronism, while the out-of-step condition is unstable; the resulting class coding is zero stable and one unstable [4].

**Fault scenarios documented at dataset level:** The simulation population includes single-phase, double-phase, and three-phase short circuits. Faults occur on busbars or transmission lines; line-fault locations are described at 20%, 40%, 60%, and 80% of line length. Load/generation scaling is 80%, 90%, 100%, 110%, and 120% of the base level [1] [4]. The released stochastic sample has a stated 70%/20%/10% distribution for single-/double-/three-phase faults and fewer than 20% unstable cases [1].

**Important unknown:** The candidate record does not list per-row fault type, faulted bus/line, line position, load level, fault duration, relay zone, or protection action as columns. Thus, fault classes are confirmed as **simulation design and sampling strata**, but not as joinable per-case labels in the candidate table.

## 5. Event timestamps and protection timing

**Documented simulation design:** The original paper states that faults are initiated after steady state, at a fault-initiation time of 1 second. Bus faults and faults within the first distance-protection zone are cleared after 100 ms; faults in the second zone are cleared after 400 ms, measured from fault inception. Generator relay protection was not considered [4]. The candidate record describes the two extraction instants as relay pickup (pre-fault) and trip (post-fault) [1].

**Candidate availability:** No actual per-row `fault_start`, `fault_clear`, `pickup_time`, `trip_time`, or event timestamp is documented. The documented 1 s/100 ms/400 ms values are scenario rules, not a row-level event timeline. Consequently, the candidate cannot support a verified event-time-to-failure analysis or reconstruction of exact timestamps for each case without additional source data and a documented mapping.

## 6. Join keys

**Unknown / effectively absent in the public metadata:** The candidate is one compressed CSV file (`PowerGridFeatures.zip`) and no simulation ID, contingency ID, event ID, asset ID, bus ID column, or stable row key is documented [2]. The original raw dataset uses packet/file nicknames and filenames that reveal some load and short-circuit conditions, but the candidate record does not document a mapping from its 3,120 sampled rows back to those raw files or to the 9,360 simulations [3].

A row number should not be treated as a meaningful join key. Joining the candidate to raw waveforms, event metadata, or asset metadata is therefore **not verified**. This also prevents reliable grouping by contingency family or asset when testing generalization.

## 7. Sampling frequency

**Upstream raw simulations:** Signals in the related raw record were saved at **1/60 second resolution**, approximately 60 Hz, and the paper says this was chosen to be consistent with PMU measurement time resolution [3] [4].

**Candidate table:** The candidate contains event-relative point features, not a time-indexed waveform. It has no documented per-row sampling frequency. Therefore, “1/60 s” is the raw simulation save interval and **must not be reported as the candidate CSV’s sampling frequency**. The candidate’s effective temporal representation is two extracted snapshots per simulated contingency, with no documented regular sampling grid.

## 8. Data volume

**Candidate record:** 3,120 cases; Zenodo lists one file, `PowerGridFeatures.zip`, with a stored size of **1,955,392 bytes** and MD5 `de0ae47762dcb31ef1ac590f49f53cb7` [2]. Zenodo describes it as a compressed CSV [1]. The record declares 350 features plus the `Stability` label.

**Source population / related raw data:** The candidate is a stochastic sample from 9,360 systematic simulations. The related raw-simulation record contains 9,360 simulations in a separate MAT-file archive; its file metadata lists `Waveforms.rar` at 3,776,237,074 bytes, while the paper describes the raw dataset as approximately 3.8 GB [3] [4]. These are provenance/context figures, not additional rows in candidate 7350829.

## 9. Missingness

**Unknown:** Neither the candidate Zenodo description/API metadata nor the cited paper provides a missing-value count, missingness mechanism, per-column completeness, sentinel-value specification, or imputation procedure for the released feature CSV. No claim of “complete,” “no missing values,” or “MCAR” is justified without inspecting the file. Missingness was therefore **not assessed from data**, consistent with the instruction not to download it.

## 10. Provenance

**Confirmed provenance chain:** The record credits Petar Sarajcev, Antonijo Kunac, Goran Petrovic, and Marin Despalatovic, all affiliated with the University of Split, FESB [2]. The candidate is version 2.0, published 2022-11-23, DOI `10.5281/zenodo.7350829`, open access, and funded in part by Croatian Science Foundation project IP-2019-04-7292 [2]. The institutional University of Split entry repeats the simulation counts, load levels, fault types, and extraction timing [6].

The original study describes an automated MATLAB/Simulink model with synchronous-machine, AVR/PSS/governor, RLC-load, and transmission-line models; system parameters and contingency settings were programmatically varied [4]. The source paper is the strongest available documentation for simulation design and target construction. The candidate record references the 2020 SpliTech paper, while the related raw record references the 2021 *Energies* article [2] [3].

**Provenance limitation:** The candidate record exposes no simulation code, per-row provenance manifest, random seed, sampling list, or row-to-raw-file mapping. Reproducibility of the exact 3,120-row sample is therefore limited to the deposited file and its checksum.

## 11. Licence

Zenodo declares **Creative Commons Attribution 4.0 International (CC BY 4.0)** [1] [2]. The official license deed permits sharing and adaptation, including commercial use, provided that users give appropriate credit, link the license, and indicate changes [7]. The Zenodo record also supplies an “as is” disclaimer [1]. Any reuse should cite the DOI and authors, preserve attribution, link CC BY 4.0, and document transformations.

## 12. Can a future target be constructed without leakage?

**Binary stability classification: yes, with conditions.** The candidate already supplies a documented stable/unstable target. A prediction task can use only variables available at a declared decision time. For example, a pre-fault/pickup assessment should exclude all post-fault/trip variables (`*lv*`) because those values occur after the disturbance and can reveal its consequence. The `Stability` label is an outcome derived from the simulated transient and is appropriate as a future outcome relative to genuinely pre-event or pickup-time inputs.

**Not verified for temporal/event targets:** The candidate does not expose row-level event times, fault start/clear times, event IDs, or full trajectories. It therefore does not support a defensible construction of time-to-instability, time-to-clearance, event forecasting, or remaining-useful-life targets from the candidate alone. The original 1-second initiation and 100/400-ms clearance rules are documentation of the simulation design, not per-row observed timestamps [4].

**Leakage and evaluation controls:**

1. Treat `Stability` as the target and remove it from predictors.
2. Define the prediction clock first; use only pre-event or pickup-time values for an early-warning task.
3. Exclude all post-fault/trip (`lv`) variables when predicting from pre-fault information.
4. Do not use undocumented fault-type, load-level, or file-name information unless it is explicitly available at decision time and represented as a legitimate covariate.
5. Avoid relying only on a random row split. The 3,120 cases are sampled from a structured 9,360-simulation grid, and no row-level contingency key is provided. A random split can place highly related operating/fault conditions on both sides and overstate generalization. A grouped holdout by contingency family, load level, or fault location would be preferable, but it cannot be implemented reliably without those keys.

## 13. Limitations and recommended use

### Limitations

- **Synthetic benchmark only:** It represents a nominal IEEE 39-bus test system, not a real utility grid or a field transformer population [4] [5].
- **No transformer identity:** Transformer-level detection, asset ranking, maintenance forecasting, and transformer failure attribution are unsupported by the documented candidate schema.
- **Snapshot compression:** Reducing 3-second trajectories to pickup/trip point values discards temporal dynamics and prevents verified event-time modeling.
- **No documented join key:** The candidate cannot be reliably linked to raw waveforms or per-contingency metadata from the record alone.
- **Class imbalance:** Fewer than 20% of cases are unstable, with a 70%/20%/10% fault-type mix [1]. Accuracy alone would be misleading; use class-aware metrics and report prevalence.
- **Potential distribution leakage:** Randomly sampled structured simulations can produce related cases across train/test partitions, especially when no grouping key is available.
- **Measurement realism is limited:** The paper lists adding noise and measurement errors as future work, so the released features should not be assumed to represent noisy field PMU measurements [4].
- **Missingness is unverified:** No completeness or sentinel-value documentation was found.
- **Exact schema is metadata-level only:** The record lists feature groups but does not provide a human-readable per-column manifest or row-level metadata in the authoritative page.

### Recommended use

Use this candidate for **benchmark supervised classification of simulated transient rotor-angle stability**, feature-selection studies, class-imbalance methods, and controlled comparisons of models under known synthetic operating/fault scenarios. The most defensible target is the provided binary `Stability` label.

Use it only for **event-relative tabular modeling**, not as evidence of transformer health, real-grid reliability, field PMU performance, or time-to-failure. For a leakage-controlled early-warning experiment, use documented pre-fault/pickup variables, keep post-fault/trip variables out of the predictor set, and report that the target is a simulated TSI-derived outcome. For stronger scientific validation, obtain a documented row-to-contingency key or raw-simulation manifest, establish the missingness profile, and evaluate grouped holdouts by contingency/operating condition before making claims of generalization.

## References

[1]: https://zenodo.org/records/7350829 "IEEE New England 39-bus test case: Dataset for the Transient Stability Assessment"

[2]: https://zenodo.org/api/records/7350829 "Zenodo API metadata for record 7350829"

[3]: https://zenodo.org/records/4521886 "Power System Transient Stability Assessment Simulations Dataset - IEEE New England 39-bus test case"

[4]: https://www.mdpi.com/1996-1073/14/11/3148 "Power System Transient Stability Assessment Using Stacked Autoencoder and Voting Ensemble"

[5]: https://electricgrids.engr.tamu.edu/electric-grid-test-cases/new-england-ieee-39-bus-system/ "New England IEEE 39-Bus System"

[6]: https://zavodi.fesb.unist.hr/zen/en/publication/792591/ "University of Split institutional entry for the dataset"

[7]: https://creativecommons.org/licenses/by/4.0/ "Creative Commons Attribution 4.0 International deed"
