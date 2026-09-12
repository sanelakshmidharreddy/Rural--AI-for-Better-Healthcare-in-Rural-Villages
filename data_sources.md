# Data Sources Documentation — Nellai HealthGrid

This document formally details the official, derived, and prototype healthcare dataset families referenced by the Nellai HealthGrid decision-support platform.

---

## 1. Dataset Family Research & Registry

| Attribute | Rural Health Statistics (RHS) / Health Dynamics of India | Health Management Information System (HMIS) | National Family Health Survey (NFHS-5) & Survey Series | Anganwadi & Poshan Tracker / ICDS | Tamil Nadu State Logistics (TNMSC & DPH) | Prototype Catchment Calibration (Nellai HealthGrid) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dataset Name** | Health Dynamics of India (Infrastructure and Human Resources) | Health Management Information System (HMIS) Portal | National Family Health Survey (NFHS-5), DLHS-4, AHS | Poshan Tracker Administrative Monitoring System | TNMSC Drug Inventory & DPH Facility Registry | Nellai HealthGrid Tirunelveli Rural Health Catchment Dataset |
| **Publisher** | Statistics Division, Ministry of Health and Family Welfare (MoHFW), Govt. of India | National Health Mission (NHM) / MoHFW, Govt. of India | International Institute for Population Sciences (IIPS) & MoHFW | Ministry of Women and Child Development (MoWCD), Govt. of India | Department of Health and Family Welfare, Govt. of Tamil Nadu | Nellai HealthGrid Research Initiative (Synthetic Prototype) |
| **Official Source URL** | [https://main.mohfw.gov.in](https://main.mohfw.gov.in) / [https://hmis.mohfw.gov.in](https://hmis.mohfw.gov.in) | [https://hmis.mohfw.gov.in](https://hmis.mohfw.gov.in) / [https://data.gov.in](https://data.gov.in) | [http://rchiips.org/nfhs](http://rchiips.org/nfhs) / [https://www.iipsindia.ac.in](https://www.iipsindia.ac.in) | [https://poshantracker.in](https://poshantracker.in) / [https://wcd.nic.in](https://wcd.nic.in) | [https://tnmsc.tn.gov.in](https://tnmsc.tn.gov.in) / [https://nhm.tn.gov.in](https://nhm.tn.gov.in) | Local Project Repository (`backend/seed_data.py`) |
| **Retrieval Date** | September 2024 / Calibrated 2026 | September 2024 / Calibrated 2026 | September 2024 (NFHS-5 Factsheet) | September 2024 | September 2024 | Prototype Scenario Baseline (2026) |
| **Reporting Period** | 2021-2022 and 2022-2023 Annual Reports | 2021–2024 Cumulative Reporting Cycles | 2019–2021 (NFHS-5 Tirunelveli District Factsheet) | 2022–2024 Monthly Tracking | 2023–2024 Operational Data | Prototype scenario period (Calibrated 2024-2025 RHS/HMIS Benchmarks) |
| **Geographic Level** | National, State, and District Aggregations | Facility (PHC/CHC/DH), Block, and District | National, State, and District (Tirunelveli District) | Anganwadi Centre (AWC), Sector, Project, District | Health Unit District (HUD) & Facility Level | Rural PHC Catchment Zone (10 Rural Health Blocks) |
| **Data Classification** | Official Government Statistics | Official Administrative Reporting | Official National Sample Survey | Official Mission Monitoring Data | Official State Public Health Data | **Prototype demonstration data** (Synthetically calibrated) |

---

## 2. Granular Field Breakdown & Missing Dimensions

### A. Rural Health Statistics / Health Dynamics of India (MoHFW)
- **Relevant Fields**:
  - Number of sanctioned and functioning Sub-Centres, Primary Health Centres (PHCs), and Community Health Centres (CHCs).
  - Medical officers (allopathic doctors) at PHCs: sanctioned, in-position, and shortfall.
  - Paramedical staff: Staff nurses, Auxiliary Nurse Midwives (ANMs), pharmacists, and laboratory technicians in position.
  - Facility infrastructure: PHCs with 4–6 inpatient beds, labor rooms, 24x7 power supply, piped water, and motorable approach roads.
- **Missing Fields at Local Level**:
  - Sub-block / village-level population catchment boundaries.
  - Daily doctor attendance and real-time clinical roster hours.
  - Real-time inventory of 200+ Essential Medicine List (EDL) drugs.
  - Actual patient travel time across non-metaled rural link roads.

### B. Health Management Information System (HMIS)
- **Relevant Fields**:
  - Antenatal Care (ANC) registrations: First-trimester registrations, 4+ ANC check-ups completed.
  - Institutional deliveries: Conducted at Sub-Centres, PHCs, CHCs, and District Hospitals.
  - Child Immunization: BCG, Oral Polio Vaccine (OPV), Pentavalent/DPT, and Measles-Rubella (MR) coverage.
  - Outpatient (OPD) and Inpatient (IPD) attendance by facility.
- **Missing Fields at Local Level**:
  - Daily pharmacy stockout logs by individual Primary Health Centre.
  - Geospatial GPS catchment boundaries for multi-village clusters.
  - Private healthcare facility consultations and informal care seeking.

### C. National Family Health Survey (NFHS-5), DLHS, and AHS
- **Relevant Fields (Tirunelveli District Factsheet)**:
  - Mothers who received 4+ antenatal care visits (%).
  - Institutional births in public vs. private facilities (%).
  - Children age 12–23 months fully vaccinated based on card or mother's recall (%).
  - Nutritional outcomes: Children under 5 years stunted, wasted, and underweight (%).
  - Anemia prevalence among pregnant women and adolescent girls (%).
- **Missing Fields at Local Level**:
  - Sub-district (taluk or block) granular breakdown.
  - Real-time temporal frequency (surveys conducted in 4-to-5-year intervals).
  - Facility-level staffing and logistical capacity indicators.

### D. Anganwadi & Poshan Tracker / ICDS Data
- **Relevant Fields**:
  - Registered pregnant women, lactating mothers, and children (0–6 years).
  - Supplementary Nutrition Programme (SNP) delivery and Take-Home Rations (THR).
  - Monthly growth monitoring (height-for-age, weight-for-age).
- **Missing Fields at Local Level**:
  - Clinical morbidity, secondary referrals, and pharmaceutical availability.
  - Direct integration with PHC electronic outpatient systems.

### E. Tamil Nadu Government Logistics (TNMSC & NHM-TN)
- **Relevant Fields**:
  - Centralized medicine warehouse drug dispatches and stock-levels for Primary Health Centers.
  - Health Unit District (HUD) administrative allocations (Tirunelveli HUD & Tenkasi HUD).
  - State 108 Emergency Ambulance service response times.
- **Missing Fields at Local Level**:
  - Publicly accessible real-time API feeds for sub-center medicine box dispensing.
  - Automated micro-catchment demographic tracking.

---

## 3. Data Integration Strategy & Prototype Notice

Because micro-level village catchment and daily facility-level drug inventory datasets are not accessible via open, real-time public APIs without confidential health system credentials, **Nellai HealthGrid does NOT claim real-time operational feeds or live government dispatch authority**.

Instead, the platform uses **calibrated prototype demonstration data** that mathematically reflects official benchmarks derived from RHS, HMIS, and NFHS-5 district statistics. All village catchment values are clearly labeled as **"Prototype demonstration data"** to ensure complete transparency for public health administrators.
