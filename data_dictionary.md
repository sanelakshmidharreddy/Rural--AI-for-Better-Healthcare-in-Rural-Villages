# Data Dictionary — Nellai HealthGrid

This document specifies the data schema, definitions, calculation formulas, units, benchmarks, and classifications for all variables used in the Nellai HealthGrid platform.

---

## 1. Rural Health Zone Model Schema (`rural_health_zones`)

| Field Name | Type | Unit / Scale | Benchmark / Target | Classification | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | String | Unique Code | Pattern `zone-<block>-##` | System Identifier | Unique identifier for rural health catchment zone |
| `name` | String | Text | — | Prototype Label | Catchment name representing rural village cluster |
| `block` | String | Text | 10 Official Blocks | Official Geographic | Rural Development Block in Tirunelveli district |
| `district` | String | Text | "Tirunelveli" | Official Geographic | Administrative District in Tamil Nadu |
| `population` | Integer | Count of individuals | ~30,000 per PHC | Derived Baseline | Estimated rural population served by catchment PHCs |
| `facility_count` | Integer | Facilities count | &ge; 1 PHC + Sub-Centers | Derived Baseline | Total government primary health facilities in zone |
| `facility_types` | String | Comma-separated | PHC, CHC, Sub-Center | Official Classification | Types of healthcare facilities present |
| `bed_count` | Integer | Inpatient beds | 1.2 beds per 1,000 pop | Derived Baseline | Operational inpatient beds available in zone |
| `doctor_availability`| Float | Doctors per 10k pop | **2.5** per 10,000 pop | Prototype Calibrated | Doctor density normalized per 10,000 catchment residents |
| `nurse_availability` | Float | Nurses per 10k pop | **4.0** per 10,000 pop | Prototype Calibrated | Staff nurse & ANM density normalized per 10,000 residents |
| `medicine_availability`| Float| Percentage (0–100%) | &ge; **90.0%** | Prototype Calibrated | Availability of essential drugs from state EDL checklist |
| `infrastructure_availability`| Float | Index (0–100%) | &ge; **85.0%** | Prototype Calibrated | Facility readiness (water, power, cold-chain, beds) |
| `immunization_coverage`| Float| Percentage (0–100%) | &ge; **95.0%** (UIP target)| Derived HMIS/NFHS | Full immunization rate among children 12–23 months |
| `maternal_care_coverage`| Float| Percentage (0–100%)| &ge; **90.0%** | Derived HMIS/NFHS | Percentage of pregnant women completing 4+ ANC checkups |
| `service_utilization`| Float | Percentage (0–100%)| &ge; **80.0%** | Prototype Calibrated | Ratio of actual outpatient visits to expected morbidity |
| `nearest_facility_distance`| Float| Kilometers (km) | &le; **5.0 km** (max 18km)| Derived Geographic | Average travel distance to nearest secondary/referral center |
| `mobile_unit_coverage`| Float| Percentage (0–100%)| &ge; **60.0%** | Prototype Calibrated | Percentage of remote villages visited by MMUs monthly |
| `data_period` | String | Text | Prototype scenario | Metadata Label | Temporal context for the data ("Prototype scenario period") |
| `data_confidence` | String | High/Medium/Low | e.g. "High (89%)" | Data Quality Audit | Confidence level based on data source corroboration |
| `is_prototype_data` | Boolean | True/False | Always `true` | Data Governance | Explicit flag denoting synthetic prototype calibration |

---

## 2. Healthcare Gap Scoring Formula & Sub-Indicators

The **Healthcare Gap Score** is a deterministic, multi-criteria weighted index evaluated on a 0–100 scale, where **0 = optimal healthcare delivery** and **100 = maximum healthcare gap/risk**.

$$\text{Healthcare Gap Score} = 0.25 \times G_{\text{infra}} + 0.25 \times G_{\text{workforce}} + 0.20 \times G_{\text{service}} + 0.15 \times G_{\text{medicine}} + 0.15 \times G_{\text{access}}$$

### Sub-Gap Indicator Calculations

1. **Infrastructure Gap ($G_{\text{infra}}$)**:
   - Evaluated against standard of 1.2 beds per 1,000 population:
     $$\text{Bed Shortfall} = \max\left(0, \left(1.0 - \frac{\text{Beds}}{\text{Population} \times 0.0012}\right)\right) \times 100$$
     $$G_{\text{infra}} = \max\left(0, \min\left(100, (100 - \text{Infra Availability}) \times 0.6 + \text{Bed Shortfall} \times 0.4\right)\right)$$

2. **Workforce Gap ($G_{\text{workforce}}$)**:
   - Evaluated against benchmarks of 2.5 doctors and 4.0 nurses per 10,000 population:
     $$\text{Doc Shortfall} = \max\left(0, \min\left(1.0, \frac{2.5 - \text{Doc Avail}}{2.5}\right)\right) \times 100$$
     $$\text{Nurse Shortfall} = \max\left(0, \min\left(1.0, \frac{4.0 - \text{Nurse Avail}}{4.0}\right)\right) \times 100$$
     $$G_{\text{workforce}} = \max(0, \min(100, \text{Doc Shortfall} \times 0.6 + \text{Nurse Shortfall} \times 0.4))$$

3. **Service Utilization Gap ($G_{\text{service}}$)**:
   - Evaluated against national immunization and ANC coverage targets:
     $$G_{\text{service}} = \max(0, \min(100, (100 - \text{Immunization}) \times 0.4 + (100 - \text{Maternal Care}) \times 0.4 + (100 - \text{Utilization}) \times 0.2))$$

4. **Medicine and Equipment Gap ($G_{\text{medicine}}$)**:
   - Evaluated directly from essential drug inventory availability:
     $$G_{\text{medicine}} = \max(0, \min(100, 100 - \text{Medicine Availability}))$$

5. **Accessibility and Referral Distance Gap ($G_{\text{access}}$)**:
   - Evaluated against an 18 km referral barrier and mobile medical unit outreach:
     $$\text{Distance Gap} = \min\left(100, \frac{\text{Nearest Distance}}{18.0} \times 100\right)$$
     $$G_{\text{access}} = \max(0, \min(100, \text{Distance Gap} \times 0.65 + (100 - \text{Mobile Unit Coverage}) \times 0.35))$$

---

## 3. Risk Tier Classifications

| Tier Name | Score Range | Color Code | Hex Code | Action Speed & Administrative Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Low Risk** | 0.0 – 25.0 | 🟢 Green | `#059669` | Standard Routine Monitoring |
| **Moderate Risk** | 25.1 – 50.0 | 🟡 Yellow | `#d97706` | Planned Preventive Maintenance |
| **High Risk** | 50.1 – 75.0 | 🟠 Orange | `#ea580c` | Priority Resource Allocation |
| **Critical Risk** | 75.1 – 100.0 | 🔴 Red | `#dc2626` | Immediate Emergency Intervention |

---

## 4. Intervention Request Model Schema (`intervention_requests`)

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (Format `NHG-2026-####`) | Generated tracking ID for administrative review |
| `zone_id` | String | Foreign reference to zone | Catchment zone requiring intervention |
| `zone_name` | String | Non-empty text | Name of targeted rural catchment |
| `block` | String | Non-empty text | Block name |
| `district` | String | "Tirunelveli" | District name |
| `intervention_type` | String | Validated type enum | e.g., Mobile Medical Unit, ANC Camp, Staff Deployment |
| `resource_type` | String | Validated resource category | Specific resource allocated |
| `quantity` | Integer | Quantity &gt; 0 | Units requested |
| `requested_date` | String | Valid Date format | Requested field deployment date |
| `priority` | String | Low, Moderate, High, Immediate | Urgency rating |
| `justification` | Text | Non-empty string | Administrative justification |
| `notes` | Text | Optional | Logistical notes |
| `requesting_organization`| String | Required text | Agency/NGO/Block office making request |
| `contact_person` | String | Required text | Responsible officer name |
| `contact_phone` | String | Optional | Contact phone number |
| `contact_email` | String | Optional | Contact email address |
| `status` | String | Validated status enum | Draft, Submitted, Under review, Approved, Scheduled, Completed, Rejected |
| `created_at` | DateTime | Auto-generated timestamp | Record creation timestamp |
| `updated_at` | DateTime | Auto-updated timestamp | Last status change timestamp |
