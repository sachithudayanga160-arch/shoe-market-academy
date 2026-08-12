import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const metaPath=path.join(root,"data","meta.json");
const meta=JSON.parse(fs.readFileSync(metaPath,"utf8"));

function colomboDate(){
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Colombo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const o=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return `${o.year}-${o.month}-${o.day}`;
}

const today=colomboDate();
if(meta.lastGeneratedDate===today){
  console.log("Today's feed already exists:",today);
  process.exit(0);
}
if(!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY GitHub secret");

const lessonDay=(meta.lessonDay||0)+1;
const prompt=`Create Day ${lessonDay} of a progressive mobile footwear-business learning program for a beginner in Sri Lanka. Today is ${today}.

Use live web search for current market/news claims. Prefer primary sources, established news outlets and respected footwear industry sources. Clearly distinguish researched facts from business hypotheses. Never invent statistics, dates, company claims or URLs.

Return VALID JSON ONLY using this shape:
{
 "date":"${today}",
 "lessonDay":${lessonDay},
 "lesson":{"category":"...","title":"...","summary":"...","explanation":"Simple Sinhala mixed naturally with correct English footwear terminology.","keyPoints":["...","...","..."],"terms":[{"term":"...","meaning":"..."},{"term":"...","meaning":"..."},{"term":"...","meaning":"..."},{"term":"...","meaning":"..."}],"buyerTip":"...","businessAngle":"...","visualFocus":"..."},
 "marketPulse":[{"title":"...","date":"YYYY-MM-DD or Recent","summary":"...","whyItMatters":"...","sourceName":"...","url":"https://..."}],
 "opportunities":[{"title":"...","evidenceLevel":"Research-backed or Hypothesis","why":"...","targetCustomer":"...","businessModel":"...","risk":"...","validation":"...","url":"https://... or empty"}],
 "startupAdvice":{"title":"...","action":"...","measure":"...","successSignal":"..."},
 "newThinking":{"title":"...","idea":"...","why":"...","test":"..."},
 "vocabulary":[{"term":"...","meaning":"..."},{"term":"...","meaning":"..."},{"term":"...","meaning":"..."},{"term":"...","meaning":"..."},{"term":"...","meaning":"..."}],
 "quiz":[{"question":"...","options":["...","...","..."],"correctIndex":0},{"question":"...","options":["...","...","..."],"correctIndex":1},{"question":"...","options":["...","...","..."],"correctIndex":2}],
 "todayAction":{"title":"...","task":"...","minutes":20,"output":"..."},
 "sources":[{"name":"...","url":"https://..."}]
}

Rules:
- Give 3 to 5 genuinely relevant marketPulse items, recent when possible.
- Give 1 to 3 realistic Sri Lanka opportunity ideas; mark weakly supported ideas as Hypothesis.
- Progress the lesson across men's, women's and children's footwear, anatomy, materials, soles, construction, sizing, fitting, comfort, quality, defects, buying, pricing, margins, sourcing, import basics, supplier evaluation, inventory, size curves, merchandising, sales, customer segments, e-commerce, data, branding and strategy.
- Avoid unnecessary repetition as lessonDay increases.
- Prefer actionable explanations over generic motivation.
- Source URLs must be real URLs found through search.
- Keep it concise enough for mobile reading.`;

const payload={
  model:"gpt-5",
  tools:[{type:"web_search",user_location:{type:"approximate",country:"LK",city:"Dambulla",region:"Central Province",timezone:"Asia/Colombo"}}],
  max_output_tokens:6500,
  input:prompt
};

const res=await fetch("https://api.openai.com/v1/responses",{
  method:"POST",
  headers:{"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
  body:JSON.stringify(payload)
});
if(!res.ok) throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
const raw=await res.json();
let text="";
for(const item of raw.output||[]){
  if(item.type==="message") for(const c of item.content||[]) if(c.type==="output_text"&&c.text) text+=c.text;
}
text=text.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");
let feed;
try{feed=JSON.parse(text)}catch(e){fs.writeFileSync(path.join(root,"data","last-raw-response.txt"),text);throw new Error("Model response was not valid JSON")}
feed.date=today;
feed.lessonDay=lessonDay;
fs.writeFileSync(path.join(root,"data","daily.json"),JSON.stringify(feed,null,2));
const archiveDir=path.join(root,"data","archive");
fs.mkdirSync(archiveDir,{recursive:true});
fs.writeFileSync(path.join(archiveDir,`${today}.json`),JSON.stringify(feed,null,2));
fs.writeFileSync(metaPath,JSON.stringify({lessonDay,lastGeneratedDate:today},null,2));
console.log(`Generated Day ${lessonDay} for ${today}`);
