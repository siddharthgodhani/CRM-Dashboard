-- Pipeline value by stage
SELECT Stage, COUNT(*) AS Opps, SUM(Amount) AS Value FROM Opportunities
WHERE Stage NOT IN ('Won','Lost') GROUP BY Stage;
-- Win rate
SELECT 1.0*SUM(CASE WHEN Stage='Won' THEN 1 END)/NULLIF(SUM(CASE WHEN Stage IN('Won','Lost') THEN 1 END),0) AS Win_Rate FROM Opportunities;
-- Stale opportunities (no update in 30+ days)
SELECT Opportunity_ID, Owner, Stage, Last_Modified FROM Opportunities
WHERE Stage NOT IN ('Won','Lost') AND Last_Modified < CURRENT_DATE - INTERVAL '30 days';
-- Duplicate accounts
SELECT UPPER(TRIM(Account_Name)) AS Name, COUNT(*) AS Cnt FROM Accounts
GROUP BY UPPER(TRIM(Account_Name)) HAVING COUNT(*) > 1;
-- Missing DUNS
SELECT Account_ID, Account_Name, Owner FROM Accounts WHERE DUNS IS NULL OR DUNS = '';
