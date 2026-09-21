"""Clean raw CRM data, validate it, and write a data quality report."""
import pandas as pd, json
from datetime import date
TODAY = pd.Timestamp(date(2026, 9, 21))
acc = pd.read_csv("data/accounts_raw.csv").fillna("")
opp = pd.read_csv("data/opportunities_raw.csv", parse_dates=["Created_Date","Last_Modified"]).fillna("")
INDS = {"Banking","Retail","Healthcare","Software","Manufacturing","Energy"}
CTRY = {"india":"India","in":"India","usa":"United States","us":"United States","united states":"United States",
        "uk":"United Kingdom","united kingdom":"United Kingdom","germany":"Germany","de":"Germany","sg":"Singapore","singapore":"Singapore"}
def report(a, o):
    open_o = o[~o.Stage.isin(["Won","Lost"])]
    return {"duplicate_accounts": int(a.Account_Name.str.strip().str.upper().duplicated(keep=False).sum()),
            "missing_duns": int((a.DUNS=="").sum()),
            "invalid_industry": int((~a.Industry.isin(INDS|{"Unclassified"})).sum()),
            "missing_owner_opps": int((o.Owner=="").sum()),
            "stale_opps": int(((TODAY-open_o.Last_Modified).dt.days>30).sum())}
before = report(acc, opp)
acc["Account_Name"] = acc.Account_Name.str.strip().str.upper()
acc["Country"] = acc.Country.str.lower().map(CTRY).fillna(acc.Country)
acc.loc[~acc.Industry.isin(INDS), "Industry"] = "Unclassified"
keep = acc.drop_duplicates("Account_Name")
name_to_id = dict(zip(keep.Account_Name, keep.Account_ID))
opp["Account_ID"] = opp.Account_ID.map(dict(zip(acc.Account_ID, acc.Account_Name.map(name_to_id))))
keep.to_csv("data/accounts_clean.csv", index=False); opp.to_csv("data/opportunities_clean.csv", index=False)
after = report(keep, opp)
json.dump({"before": before, "after": after}, open("data/quality_report.json","w"), indent=2)
print("BEFORE", before); print("AFTER ", after)
