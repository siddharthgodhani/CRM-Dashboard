"""Generate simulated, deliberately messy B2B CRM data."""
import random, pandas as pd
from datetime import date, timedelta
random.seed(42); TODAY = date(2026, 9, 21)
owners = ["Rahul","Priya","Amit","Sneha","Karthik","Divya","Vikram","Neha"]
inds = ["Banking","Retail","Healthcare","Software","Manufacturing","Energy"]
stages = ["Lead","Qualified","Discovery","Proposal","Negotiation","Won","Lost"]
bad = {"India":["india","IN"],"United States":["USA","US"],"United Kingdom":["UK"],"Germany":["germany","DE"],"Singapore":["SG"]}
pre = ["Apex","Nova","Blue","Zen","Orion","Delta","Prime","Vertex","Lumen","Terra"]
suf = ["Tech","Systems","Holdings","Retail","Health","Energy","Labs","Group"]
acc = []
for i in range(600):
    c = random.choice(list(bad))
    acc.append(dict(Account_ID=f"A{i}", Account_Name=f"{random.choice(pre)} {random.choice(suf)} {i%50}",
        Industry=random.choice(["Misc","N/A"]) if random.random()<.07 else random.choice(inds),
        Country=random.choice(bad[c]) if random.random()<.2 else c,
        DUNS="" if random.random()<.12 else str(random.randint(10**8,10**9-1)),
        Owner="" if random.random()<.03 else random.choice(owners)))
for i in range(50):
    a = dict(random.choice(acc)); a["Account_ID"]=f"A{600+i}"
    a["Account_Name"] = a["Account_Name"].lower()+" "; acc.append(a)
opp = []
for i in range(3000):
    st = random.choice(stages); cr = TODAY - timedelta(days=random.randint(0,300))
    up = max(cr, TODAY - timedelta(days=random.randint(0,200 if st in("Won","Lost") else 70)))
    opp.append(dict(Opportunity_ID=f"O{i}", Account_ID=random.choice(acc)["Account_ID"],
        Owner="" if random.random()<.03 else random.choice(owners), Stage=st,
        Amount=random.randint(2,42)*100000, Created_Date=cr, Last_Modified=up))
pd.DataFrame(acc).to_csv("data/accounts_raw.csv", index=False)
pd.DataFrame(opp).to_csv("data/opportunities_raw.csv", index=False)
print("Generated", len(acc), "accounts,", len(opp), "opportunities")
