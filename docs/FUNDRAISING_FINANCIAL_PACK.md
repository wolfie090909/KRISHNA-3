# Fundraising — financial pack (Krishna Mobiles FZCO)

## What is in the repo

| File | Purpose |
|------|--------|
| `docs/Krishna_Mobiles_FZCO_Statement_of_Financial_Position_31_Dec_2025_Investor.pdf` | Reconciled statement of financial position, P&amp;L extract, changes in equity, and corrected PPE note — suitable for **first-pass investor / lender data rooms** alongside your narrative deck. |
| `docs/KRISHNA_MOBILES_FZCO_2025_Financial_Statements_Audit_Memo.md` | Desk-review of the original PDF and the logic behind corrections. |
| `scripts/generate_krishna_investor_financials_pdf.py` | Regenerates the investor PDF after any trial-balance update. |

## Regenerate the PDF

```bash
pip install -r requirements-financials.txt
python3 scripts/generate_krishna_investor_financials_pdf.py
```

## What serious investors still expect

- **Independent auditor’s report** on the same period (or a comfort letter / review engagement), aligned with **UAE** and free zone filing requirements.  
- **Management discussion**, working capital policy, related-party schedule, and **bank confirmations** where requested.  
- This pack is **not** a substitute for legal or tax advice on the transaction.
