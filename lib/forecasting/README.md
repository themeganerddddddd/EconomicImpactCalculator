# Future Forecasting Architecture

Future versions can train a LightGBM or XGBoost model to forecast county-industry employment and GDP growth. Candidate features include lagged QCEW employment and wage growth, establishment growth, location quotient, CBP trends, ACS population/income/labor force, BEA regional GDP and personal income, CPI or macro controls, neighboring-county growth, permits, job postings, business formation statistics, night lights, Google Trends, and real estate data.

The planned integration point is:

```txt
adjusted_multiplier = base_multiplier * forecast_adjustment
```
