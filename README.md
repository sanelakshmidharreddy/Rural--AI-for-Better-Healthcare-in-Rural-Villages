# Nellai HealthGrid — AI-Powered Rural Healthcare Gap Detection & Resource Prioritization

> **Decision-Support Platform for Tirunelveli District Health Officers, Public Health Administrators, and Health NGOs.**

Nellai HealthGrid addresses the critical distinction between **physical healthcare facility availability** and **effective healthcare delivery**. While a Primary Health Center (PHC) may exist physically, effective healthcare may still be unavailable due to workforce shortages, pharmacy stockouts, long referral travel distances, or declining immunization and maternal care utilization.

---

## 🌟 Core Features

- **Tirunelveli District Executive Overview**: High-level summary of rural health zones, bed capacity, staffing gaps, pharmacy depletions, and overall district risk distribution.
- **Tirunelveli Block Risk Map & Ranked Priority Table**: Interactive block grid visualizer and filterable table sorting rural health zones by Healthcare Gap Score.
- **Transparent Healthcare Gap Scoring Engine**: Deterministic 5-factor weighted scoring formula (0–100 gap scale) with explicit sub-score factor contributions and data confidence ratings.
- **Zone Detail & "Why This Score?" Factor Rationale**: Deep-dive profile for each PHC catchment zone showing doctor/nurse availability per 10k population, essential drug stock %, immunization coverage %, travel distance, and early-warning trend signals.
- **Rule-Based Intervention Recommendation Engine**: Automatic mapping of zone gap profiles to targeted public health interventions (Mobile Medical Units, Outreach Camps, Telemedicine Terminals, Pharmacy Redistribution).
- **Interactive Resource Allocation & "What-If" Simulator**: Dynamic allocator ranking zones for limited resource packages and projecting post-intervention score reductions.
- **Data Quality & Audit Transparency**: Explicit tracking of data confidence (e.g. 89% High), data granularity, missing-data indicators, and prototype metadata disclaimers.

---

## 📐 Healthcare Gap Scoring Formula

$$\text{Healthcare Gap Score} = 0.25 \times \text{Infra} + 0.25 \times \text{Workforce} + 0.20 \times \text{Service} + 0.15 \times \text{Medicine} + 0.15 \times \text{Accessibility}$$

All sub-indicators are normalized to a 0–100 scale (100 = maximum gap/risk):

| Risk Tier | Gap Score Range | Indicator Color | Recommended Action Speed |
| :--- | :--- | :--- | :--- |
| **Low Risk** | 0 – 25 | 🟢 Green | Standard Routine Monitoring |
| **Moderate Risk** | 26 – 50 | 🟡 Yellow | Planned Preventive Maintenance |
| **High Risk** | 51 – 75 | 🟠 Orange | Priority Resource Allocation |
| **Critical Risk** | 76 – 100 | 🔴 Red | Immediate Emergency Intervention |

---

## 🏗️ Technology Architecture

- **Backend**: Python 3.14 + FastAPI 0.141 + SQLAlchemy 2.0 + Pydantic v2 (SQLite database `healthcare.db`).
- **Frontend**: React + TypeScript + Vite + Recharts + Lucide Icons + Custom Public-Health Executive Design System.
- **API Proxy**: Vite dev server proxy routing `/api` requests to backend on port 8000.

---

## 🚀 How to Run the Application

### Prerequisites
- Python 3.9+ (Python 3.14 supported)
- Node.js v18+ & NPM

### Step 1: Run Backend Server
```bash
# Activate Virtual Environment (Windows)
.\venv\Scripts\activate

# Start FastAPI Uvicorn Server
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- API Base URL: `http://127.0.0.1:8000`
- Swagger UI API Docs: `http://127.0.0.1:8000/docs`

### Step 2: Run Frontend Web Dashboard
```bash
# Navigate to frontend folder
cd frontend

# Start Vite Development Server
npm run dev
```
- Web Dashboard URL: `http://localhost:3000`

---

## ⏱️ 2-Minute Demo Script for District Health Officer

1. **Step 1: Open District Overview (`http://localhost:3000`)**
   - Highlight the executive summary cards showing 10 Tirunelveli Rural Health Zones analysed, 2 Critical-risk zones, 2 High-risk zones, and 220 operational beds.
   - Point to the Risk Score Distribution bar chart and top district gaps (Workforce Shortage, Pharmacy Depletion, Referral Travel Barriers).

2. **Step 2: Inspect Block Risk Map & Priority Ranking**
   - Click on the **"Risk Map & Priority Ranking"** tab.
   - Filter by **"Critical Risk"** to isolate the top risk zones (**Manur Catchment Zone** and **Nanguneri Rural Zone**).

3. **Step 3: Deep-Dive into Critical Zone (Manur)**
   - Click **"Inspect Zone"** on **Manur Catchment Zone**.
   - Review the **Prototype Healthcare Gap Score dial (78.5 / 100 — Critical Risk)**.
   - View the **"Why This Zone is at Risk"** factor list highlighting severe doctor shortage (0.2 per 10k pop) and referral distance (25.5 km).
   - Check the **Recommended Healthcare Intervention** panel proposing a *Mobile Medical Unit & Remote Immunization Outreach*.

4. **Step 4: Interactive Resource Allocation ("What-If" Scenario)**
   - Navigate to **"Resource Prioritization & What-If"** tab.
   - Increase **Mobile Medical Units** to 3 and **Outreach Camps** to 3.
   - Click **"Run What-If Resource Prioritization"**.
   - Observe the system automatically rank Manur Catchment Zone #1 for Mobile Unit allocation, projecting a gap score reduction from 78.5 to 47.5 (-31 pts).

5. **Step 5: Verify Audit Transparency**
   - Click **"Data Quality & Audit"** in the top navigation header to view data period (Q3 2026), data confidence (89% High), and governance disclaimers.

---

## 📊 Prototype Data & Governance Disclaimer

Nellai HealthGrid is a decision-support prototype platform designed for public-health administrators and district planners. 

All village/block catchment metrics are labeled as **Prototype demonstration data**. The platform provides transparent, deterministic score calculations and recommendations to aid human resource allocation decisions; it is **not** an automated clinical diagnosis system.
