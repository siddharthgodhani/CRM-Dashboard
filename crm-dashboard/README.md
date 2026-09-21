# Sales Pipeline & CRM Hygiene Dashboard

Sales Ops analytics project on **simulated B2B CRM data** (Dynamics-style fields). Not real client data.

**Live demo:** 

## What it does
- **Pipeline:** open/weighted pipeline, win rate, stale deals, stage and trend charts, seller win rates, deal aging
- **CRM Hygiene:** data quality score, duplicates, missing DUNS, invalid values, remediation queue
- **Reporting KPIs:** SLA adherence and automation summary (illustrative values)
- **Apply cleaning** toggle shows the score before vs after

## Structure
```
python/generate_data.py   create messy CRM CSVs
python/clean_data.py      dedupe, standardise, validate, write quality report
sql/kpi_queries.sql       KPI and hygiene queries
data/                     raw + clean CSVs, quality_report.json
src/                      dashboard JS + CSS
index.html                dashboard page
```

## Run the data pipeline
```
pip install pandas
python python/generate_data.py
python python/clean_data.py
```
## Run the dashboard
Open `index.html`

## Skills shown
Data cleaning, de-duplication, CRM data quality, KPI design, pipeline analysis, SQL, Python (pandas), dashboarding.
