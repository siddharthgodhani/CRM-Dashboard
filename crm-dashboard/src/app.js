// ---------- seeded random ----------
let s=42;const R=()=>(s=(s*1664525+1013904223)%4294967296)/4294967296,pick=a=>a[Math.floor(R()*a.length)];
const TODAY=new Date("2026-09-21"),DAY=864e5;
const owners=["Rahul","Priya","Amit","Sneha","Karthik","Divya","Vikram","Neha"];
const inds=["Banking","Retail","Healthcare","Software","Manufacturing","Energy"];
const stages=["Lead","Qualified","Discovery","Proposal","Negotiation","Won","Lost"];
const prob={Lead:.05,Qualified:.15,Discovery:.3,Proposal:.5,Negotiation:.75,Won:1,Lost:0};
const ctry=["India","United States","United Kingdom","Germany","Singapore"];
const ctryBad={"India":["india","IN","Bharat"],"United States":["USA","US","U.S."],"United Kingdom":["UK","U.K."],"Germany":["germany","DE"],"Singapore":["SG","singapore"]};
const pre=["Apex","Nova","Blue","Zen","Orion","Delta","Prime","Vertex","Lumen","Terra"],suf=["Tech","Systems","Holdings","Retail","Health","Energy","Labs","Group"];
// ---------- generate messy data ----------
const rawAcc=[];
for(let i=0;i<600;i++){const n=pick(pre)+" "+pick(suf)+" "+(i%50);const c=pick(ctry);
 rawAcc.push({id:"A"+i,name:n,industry:R()<.07?pick(["Misc","N/A","xyz"]):pick(inds),country:R()<.2?pick(ctryBad[c]):c,duns:R()<.12?"":String(1e8+Math.floor(R()*9e8)),owner:R()<.03?"":pick(owners),base:c});}
const dups=[];for(let i=0;i<50;i++){const a=rawAcc[Math.floor(R()*600)];dups.push({...a,id:"A"+(600+i),name:R()<.5?a.name.toUpperCase()+" ":a.name.toLowerCase(),dupOf:a.id});}
rawAcc.push(...dups);
const rawOpp=[];
for(let i=0;i<3000;i++){const a=pick(rawAcc);const cr=new Date(TODAY-R()*300*DAY);const st=pick(stages);
 const upd=new Date(Math.max(cr,TODAY-R()*(st=="Won"||st=="Lost"?200:70)*DAY));
 rawOpp.push({id:"O"+i,acc:a.id,owner:R()<.03?"":pick(owners),created:cr,updated:upd,stage:st,amt:Math.round((2+R()*40)*1e5),src:pick(["Inbound","Outbound","Referral","Event"])});}
// ---------- cleaning (pandas-style logic in JS) ----------
function clean(){
 const std=n=>n.trim().replace(/\s+/g," ").toUpperCase(),map={};
 Object.entries(ctryBad).forEach(([g,b])=>b.concat(g).forEach(x=>map[x.toLowerCase()]=g));
 const seen={},accMap={},accs=[];
 rawAcc.forEach(a=>{const k=std(a.name);if(seen[k]){accMap[a.id]=seen[k];return}
  const n={...a,name:k,country:map[a.country.toLowerCase()]||a.country,industry:inds.includes(a.industry)?a.industry:"Unclassified"};
  seen[k]=n.id;accMap[a.id]=n.id;accs.push(n)});
 const opps=rawOpp.map(o=>({...o,acc:accMap[o.acc]||o.acc}));
 return{accs,opps};}
// ---------- helpers ----------
const cr=x=>"₹"+(x/1e7).toFixed(2)+" Cr",pct=x=>(x*100).toFixed(1)+"%";
const bars=(d,f=v=>v)=>{const m=Math.max(...d.map(x=>x[1]))||1;return d.map(([k,v])=>`<div class="row"><span>${k}</span><div class="bar" style="width:${v/m*55}%"></div><b>${f(v)}</b></div>`).join("")};
const kpi=(l,v,c="")=>`<div class="card"><div class="l">${l}</div><div class="k ${c}">${v}</div></div>`;
let on=false;
function calc(){
 const D=on?clean():{accs:rawAcc,opps:rawOpp};const {accs,opps}=D;
 const open=opps.filter(o=>!["Won","Lost"].includes(o.stage)),won=opps.filter(o=>o.stage=="Won"),lost=opps.filter(o=>o.stage=="Lost");
 const stale=open.filter(o=>(TODAY-o.updated)/DAY>30);
 const pipe=open.reduce((a,o)=>a+o.amt,0),wpipe=open.reduce((a,o)=>a+o.amt*prob[o.stage],0),wonv=won.reduce((a,o)=>a+o.amt,0);
 const winRate=won.length/((won.length+lost.length)||1);
 // hygiene
 const std=n=>n.trim().replace(/\s+/g," ").toUpperCase(),cnt={};accs.forEach(a=>cnt[std(a.name)]=(cnt[std(a.name)]||0)+1);
 const dupAcc=accs.filter(a=>cnt[std(a.name)]>1),noDuns=accs.filter(a=>!a.duns),badInd=accs.filter(a=>!inds.includes(a.industry)&&a.industry!="Unclassified"),
  badCtry=accs.filter(a=>!ctry.includes(a.country)),noOwn=opps.filter(o=>!o.owner);
 const issues=dupAcc.length+noDuns.length+badInd.length+badCtry.length+noOwn.length+stale.length;
 const total=accs.length*4+opps.length*2;const score=Math.max(0,100-issues/total*100*3);
 const byStage=stages.slice(0,5).map(st=>[st,open.filter(o=>o.stage==st).reduce((a,o)=>a+o.amt,0)]);
 const months=[...Array(9)].map((_,i)=>{const d=new Date(2026,i,1);return[d.toLocaleString("en",{month:"short"}),opps.filter(o=>o.created.getMonth()==i&&o.created.getFullYear()==2026).length]});
 const byOwner=owners.map(w=>{const ow=opps.filter(o=>o.owner==w);const ww=ow.filter(o=>o.stage=="Won").length,ll=ow.filter(o=>o.stage=="Lost").length;return[w,ww/((ww+ll)||1)]});
 const sev=[["Duplicate accounts",dupAcc.length,"Merge"],["Missing DUNS",noDuns.length,"Validate with D&B"],["Invalid industry",badInd.length,"Correct"],["Inconsistent country",badCtry.length,"Standardise"],["Missing owner",noOwn.length,"Assign"],["Stale opportunities",stale.length,"Follow up"]];
 const aging=[["0-30d",0],["31-60d",0],["61+d",0]];open.forEach(o=>{const d=(TODAY-o.updated)/DAY;aging[d<=30?0:d<=60?1:2][1]++});
 // remediation table
 const tbl=[];dupAcc.slice(0,4).forEach(a=>tbl.push([a.name,"Duplicate",a.owner||"-","Merge"]));
 noDuns.slice(0,4).forEach(a=>tbl.push([a.name,"Missing DUNS",a.owner||"-","Validate"]));
 stale.slice(0,4).forEach(o=>tbl.push([o.id+" ("+o.stage+")","Stale opp",o.owner||"-","Follow up"]));
 // SLA
 const sla=[["Daily pipeline report",98,95],["Weekly hygiene report",on?96:88,95],["Ad hoc requests (48h)",91,90],["Dedup turnaround",on?97:82,95]];
 document.getElementById("p1").innerHTML=`<div class="grid">${kpi("Open pipeline",cr(pipe))}${kpi("Weighted pipeline",cr(wpipe))}${kpi("Won revenue",cr(wonv))}${kpi("Win rate",pct(winRate))}${kpi("Stale opps",stale.length,stale.length>100?"bad":"")}</div>
 <div class="two"><div class="card"><h3>Pipeline by stage</h3>${bars(byStage,cr)}</div><div class="card"><h3>Opportunities created (2026)</h3><div class="cols">${months.map(m=>`<div title="${m[0]}: ${m[1]}" style="height:${m[1]/Math.max(...months.map(x=>x[1]))*100}%"></div>`).join("")}</div><small>${months.map(m=>m[0]).join(" · ")}</small></div>
 <div class="card"><h3>Win rate by seller</h3>${bars(byOwner,pct)}</div><div class="card"><h3>Open pipeline aging (days since update)</h3>${bars(aging)}</div></div>`;
 document.getElementById("p2").innerHTML=`<div class="grid">${kpi("Data quality score",score.toFixed(1)+"%",score>90?"ok":"bad")}${kpi("Accounts",accs.length)}${kpi("Opportunities",opps.length)}${kpi("Total issues",issues)}</div>
 <div class="two"><div class="card"><h3>Issues found</h3>${bars(sev.map(x=>[x[0],x[1]]))}</div>
 <div class="card overflow"><h3>Remediation queue</h3><table><tr><th>Record</th><th>Issue</th><th>Owner</th><th>Action</th></tr>${tbl.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</table></div></div>
 <p><small>Toggle "Apply cleaning" (top right) to see the score before/after: trim + uppercase names, dedupe, standardise countries, flag invalid industries.</small></p>`;
 document.getElementById("p3").innerHTML=`<div class="card overflow"><h3>SLA adherence</h3><table><tr><th>Report</th><th>Actual</th><th>Target</th><th>Status</th></tr>${sla.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}%</td><td>${r[2]}%</td><td class="${r[1]>=r[2]?"ok":"bad"}">${r[1]>=r[2]?"Met":"Missed"}</td></tr>`).join("")}</table><small>SLA values are illustrative.</small></div>
 <div class="card" style="margin-top:10px"><h3>Automation summary</h3><p>Manual hours saved per week: <b>${on?"6":"0"}</b> · Duplicates removed: <b>${on?rawAcc.length-accs.length:0}</b> · Records validated: <b>${accs.length+opps.length}</b></p></div>`;
}
document.getElementById("cl").onclick=e=>{on=!on;e.target.textContent="Apply cleaning: "+(on?"ON":"OFF");calc()};
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav button,.pg").forEach(x=>x.classList.remove("on"));b.classList.add("on");document.getElementById(b.dataset.p).classList.add("on")});
calc();