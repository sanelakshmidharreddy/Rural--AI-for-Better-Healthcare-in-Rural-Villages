# Data Sources & Reference Registry

This document records the official Indian public-health dataset families analyzed for **Nellai HealthGrid**.

---

## 1. Dataset Registry

### A. Rural Health Statistics (RHS) / Health Dynamics of India
- **Publisher**: Ministry of Health and Family Welfare (MoHFW), Government of India
- **Source URL**: [https://main.mohfw.gov.in](https://main.mohfw.gov.in) / [https://data.gov.in](https://data.gov.in)
- **Retrieval Date**: September 2026
- **Reporting Period**: Annual (2022–2025 releases)
- **Geographic Level**: State, District, and Sub-district (Block/Taluk) facility aggregates
- **Relevant Fields**: Primary Health Center (PHC) counts, Sub-Center counts, Community Health Center (CHC) bed capacities, sanctioned vs in-position doctor & nurse positions.
- **Missing Fields**: Real-time daily pharmacy stock levels, village-level GPS boundaries.
- **Classification**: Official Government Administrative Dataset.

### B. Health Management Information System (HMIS)
- **Publisher**: National Health Mission (NHM), MoHFW
- **Source URL**: [https://hmis.mohfw.gov.in](https://hmis.mohfw.gov.in)
- **Retrieval Date**: September 2026
- **Reporting Period**: Monthly / Quarterly aggregate service delivery metrics
- **Geographic Level**: Facility and PHC Catchment level
- **Relevant Fields**: ANC (Antenatal Care) registrations, full child immunization coverage, outpatient & inpatient service utilization, institutional delivery rates.
- **Missing Fields**: Village-level patient tracking (anonymized at planning level).
- **Classification**: Official Health Information Portal Data.

### C. National Family Health Survey (NFHS-5) & District Level Household Survey (DLHS)
- **Publisher**: International Institute for Population Sciences (IIPS) & MoHFW
- **Source URL**: [http://rchiips.org/nfhs/](http://rchiips.org/nfhs/)
- **Retrieval Date**: September 2026
- **Reporting Period**: NFHS-5 Survey Cycle
- **Geographic Level**: District Level (Tirunelveli District)
- **Relevant Fields**: Maternal health coverage indices, child stunting/wasting ratios, household medical access distance indicators.
- **Missing Fields**: Month-on-month trend data (survey-based snapshot).
- **Classification**: Official Demographic Survey Data.

### D. Integrated Child Development Services (ICDS) / Poshan Tracker
- **Publisher**: Ministry of Women and Child Development (MoWCD), Government of India
- **Source URL**: [https://poshantracker.in](https://poshantracker.in)
- **Retrieval Date**: September 2026
- **Reporting Period**: Monthly Anganwadi Center metrics
- **Geographic Level**: Anganwadi / Sector level
- **Relevant Fields**: Child nutritional status, pregnant/lactating mother enrollment, supplementary nutrition delivery.
- **Missing Fields**: Clinical medical treatment telemetry.
- **Classification**: Official Child & Maternal Nutrition Dataset.

### E. Tamil Nadu Health System Reform Program (TNHSRP) & TN HWC Portal
- **Publisher**: Health and Family Welfare Department, Government of Tamil Nadu
- **Source URL**: [https://tnhealth.tn.gov.in](https://tnhealth.tn.gov.in)
- **Retrieval Date**: September 2026
- **Reporting Period**: State Health Dashboard Q3 2026
- **Geographic Level**: District (Tirunelveli) & Block Level
- **Relevant Fields**: Health and Wellness Center (HWC) operational status, Mobile Medical Unit (MMU) route maps, 108 ambulance referral dispatch averages.
- **Missing Fields**: Live sensor-level inventory tracking.
- **Classification**: Official State Health Portal Data.

---

## 2. Data Governance & Prototype Labeling Rules

1. **Demonstration Dataset**: Where village-level micro-telemetry is simulated for pilot demonstration, indicators are explicitly marked as **Prototype demonstration data** with a **Prototype scenario period**.
2. **No Claim of Real-Time Telemetry**: Values represent planning-period aggregates; synthetic numbers are never presented as official live observation.
3. **Planning Privacy**: All health metrics represent aggregate population indicators. No Patient-Identifiable Information (PII) is collected or stored.
