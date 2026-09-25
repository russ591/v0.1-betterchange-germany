import type { CollectionEntry } from "astro:content";

type Article = CollectionEntry<"insights-articles">;
type Course = CollectionEntry<"training-courses">;

// "Related Training" for an Insights article: 1-3 courses, most relevant
// first, or none at all.
//
// Two tiers. The keyword tier scores each course from what the article's
// title and body actually talk about, so a Scrum Master article links
// CSM/A-CSM rather than the whole Scrum catalogue, a facilitation-heavy
// piece links ICP-ATF even if it's filed under Leadership, and a Product
// Owner webinar filed under Change Management still lands on CSPO. When
// nothing keyword-specific clears the bar, the fallback tier ties the
// article to the course family its topic belongs to (organisational change
// -> coaching transformations + agile leadership, strategy -> Flight Level
// 3, team dynamics -> team facilitation, generic agile -> CSM as the
// foundation). Only NEVER_MATCH articles get nothing -- ones where a course
// link would read badly whatever the words say.
//
// Runs on the English article only; the German article page reuses its
// English original's picks and shows the German course pages (see
// localizeCourses). Same calibration as the Python prototype the mapping
// was reviewed against -- keep the two in step if thresholds change.

const NEVER_MATCH = new Set([
  "protecting-the-hedgehogs",
  // A piece mocking the certification industry shouldn't advertise
  // certification courses underneath it.
  "agile-mishap-5-the-certification-circus-reflecting-on-the-agile-accreditation-landscape",
]);

const CATEGORY_TO_COURSE_CATEGORY: Record<string, string> = {
  Scrum: "scrum",
  Kanban: "kanban",
  "Flight Levels": "flight-levels",
  Coaching: "coaching",
  Leadership: "leadership",
};

const count = (re: RegExp, text: string): number => text.match(re)?.length ?? 0;

export function relatedCourseIds(article: Article): string[] {
  if (NEVER_MATCH.has(article.id)) return [];
  const d = article.data;
  const title = d.title;
  const text = [d.title, d.excerpt, d.metaTitle ?? "", d.metaDescription ?? "", d.bodyHtml.replace(/<[^>]+>/g, " ")].join(" ");
  const cats = [d.primaryCategory, ...d.categories].filter((c): c is string => Boolean(c));
  const pc = d.primaryCategory ?? "";
  const inCat = new Set(cats.map((c) => CATEGORY_TO_COURSE_CATEGORY[c]).filter(Boolean));

  const k = {
    sm: count(/\bscrum ?masters?\b/gi, text),
    po: count(/\bproduct ?owners?\b/gi, text),
    scrum: count(/\bscrum\b/gi, text),
    sprint: count(/\bsprints?\b/gi, text),
    backlog: count(/\bbacklog/gi, text),
    retro: count(/retrospective/gi, text),
    facil: count(/facilitat/gi, text),
    coach: count(/\bcoach/gi, text),
    leader: count(/\bleader/gi, text),
    transf: count(/\btransformations?\b/gi, text),
    change: count(/change management/gi, text),
    safe: count(/\bSAFe\b/g, text),
    art: count(/release train/gi, text),
    scaling: count(/\bscal(?:e|ing)\b/gi, text),
    fl: count(/flight levels?\b/gi, text),
    kanban: count(/\bkanban\b/gi, text),
    wip: count(/\bWIP\b|work[- ]in[- ]progress/gi, text),
    flow: count(/\bflow\b/gi, text),
    ai: count(/\bAI\b/g, text),
    csp: count(/\bCSP-?SM\b|certified scrum professional/gi, text),
    strategy: count(/\bstrateg/gi, text),
    arch: count(/architect/gi, text),
    enterprise: count(/\benterprise\b/gi, text),
    estim: count(/story ?points?|\bestimat|\bvelocity\b/gi, text),
    poterms: count(/user stor|product goal|product vision|acceptance criteria/gi, text),
    teamdyn: count(
      /working agreement|team charter|self-organi[sz]|cross-functional|teamwork|tuckman|dysfunction|consensus|group decision|decision[- ]making/gi,
      text
    ),
    org: count(/organi[sz]ation|\bculture\b/gi, text),
    lean: count(/\blean\b/gi, text),
    discover: count(/product discovery|discovery track|dual[- ]track/gi, text),
    titleSm: count(/scrum ?master/gi, title),
    titlePo: count(/product ?owner/gi, title),
    titleFacil: count(/facilitat/gi, title),
    titleRetro: count(/retrospective/gi, title),
    titleKanban: count(/kanban/gi, title),
    titleFl: count(/flight level/gi, title),
    titleSafe: count(/\bSAFe\b|release train/gi, title),
    titleCoach: count(/coach/gi, title),
    titleLeader: count(/leader/gi, title),
    titleAi: count(/\bAI\b/g, title),
  };

  const scores = new Map<string, number>();
  const add = (id: string, pts: number) => {
    if (pts > 0) scores.set(id, (scores.get(id) ?? 0) + pts);
  };
  const min = Math.min;

  // --- Scrum family ------------------------------------------------------
  const scrumCtx = inCat.has("scrum") || k.scrum >= 3 || k.sprint >= 8;
  // A role "dominates" when the article is really about that role; the
  // other role's course and the generic foundation course are then filler.
  const smDom = k.sm >= 8 && k.sm >= 2 * k.po;
  const poDom = k.po >= 8 && k.po >= 2 * k.sm;
  if ((k.sm >= 3 || k.titleSm) && !poDom) add("csm", 3 + min(k.sm, 10) + 4 * k.titleSm);
  if (k.sm >= 6 || k.titleSm) add("a-csm", 3 + Math.floor(min(k.sm, 10) / 2) + 3 * k.titleSm);
  if (k.csp >= 1) add("csp-sm", 6);
  if ((k.po >= 3 || k.titlePo) && !smDom) add("cspo", 3 + min(k.po, 10) + 4 * k.titlePo);
  if (k.po >= 8 || k.titlePo) add("a-cspo", 3 + Math.floor(min(k.po, 10) / 2) + 3 * k.titlePo);
  // an article *about* AI for a role should lead with that AI course
  const aiPts = k.titleAi ? 9 + min(k.ai, 10) : 6 + Math.floor(min(k.ai, 10) / 2);
  if (k.ai >= 3 && (k.sm >= 2 || (k.titleAi && k.scrum >= 2))) add("ai-for-scrum-masters", aiPts);
  if (k.ai >= 3 && (k.po >= 2 || k.titlePo)) add("ai-for-product-owners", aiPts);
  if (k.poterms >= 6 && !smDom) add("cspo", 6);
  else if (k.poterms >= 4 && !smDom) add("cspo", 3);
  if (scrumCtx) {
    if (!(smDom || poDom)) {
      if (pc === "Scrum" || (inCat.has("scrum") && k.scrum >= 5)) add("csm", 6);
      else if (k.scrum >= 8) add("csm", 5);
    }
    if (k.sprint >= 20) add("csm", 6);
    else if (k.sprint >= 10) add("csm", 4);
    if (k.backlog >= 8 && !smDom) add("cspo", 5);
    else if (k.backlog >= 5 && !smDom) add("cspo", 3);
  }
  if (k.estim >= 10) add("csm", 6);
  else if (k.estim >= 3 && scrumCtx) add("csm", 3);

  // --- Kanban family -----------------------------------------------------
  if (inCat.has("kanban") || k.kanban >= 4 || k.titleKanban) {
    add("kmp1", 3 + Math.floor(min(k.kanban, 12) / 2) + 3 * k.titleKanban);
    if (k.kanban >= 10 || k.wip >= 3 || k.flow >= 3) add("kmp2", 3 + min(k.wip + k.flow, 6));
    if (k.enterprise >= 2 || (k.scaling >= 2 && k.kanban >= 3)) add("esk", 4);
    if (k.flow >= 4 && k.kanban >= 2) add("flow-manager", 3);
  }

  // --- Flight Levels family ---------------------------------------------
  if (inCat.has("flight-levels") || k.fl >= 2 || k.titleFl) {
    add("flin", 4 + Math.floor(min(k.fl, 12) / 2) + 3 * k.titleFl);
    if (k.fl >= 8) add("fl2d", 3 + Math.floor(min(k.fl, 15) / 3));
    if (k.fl >= 8 && k.strategy >= 2) add("fl3d", 3 + Math.floor(min(k.strategy, 6) / 2));
    if (k.fl >= 4 && k.arch >= 2) add("flsa", 3);
  }

  // --- Coaching family ---------------------------------------------------
  if (inCat.has("coaching") || k.coach >= 8 || k.facil >= 5 || k.titleCoach || k.titleFacil) {
    if (k.coach >= 5 || k.titleCoach) add("icp-acc", 3 + Math.floor(min(k.coach, 20) / 3) + 4 * k.titleCoach);
    // title boost kept low: "More Than a Meeting Facilitator" is a Scrum
    // Master article, not a facilitation one
    if (k.facil >= 3 || k.titleFacil) add("icp-atf", 3 + Math.floor(min(k.facil, 12) / 2) + 2 * k.titleFacil);
    if (k.transf >= 3 && k.coach >= 3) add("icp-cat", 3 + Math.floor(min(k.transf, 8) / 2));
  }
  // retrospectives are a facilitation skill regardless of category
  if (k.retro >= 8 || k.titleRetro) {
    add("icp-atf", 3 + Math.floor(min(k.retro, 12) / 3) + 4 * k.titleRetro);
    if (scrumCtx || k.sprint >= 3) add("csm", 6);
  }

  // --- Leadership family -------------------------------------------------
  if (inCat.has("leadership") || k.leader >= 8 || k.titleLeader) {
    if (k.leader >= 4 || k.titleLeader) add("cal-1", 3 + Math.floor(min(k.leader, 30) / 4) + 4 * k.titleLeader);
    if (k.leader >= 18 || (k.titleLeader && k.leader >= 8)) add("cal-2", 2 + Math.floor(min(k.leader, 40) / 8));
  }
  if (k.transf >= 5 && !inCat.has("coaching")) add("icp-cat", 2 + Math.floor(min(k.transf, 10) / 2));

  // --- Scaling family ----------------------------------------------------
  if (k.safe >= 3 || k.art >= 1 || k.titleSafe) {
    add("leading-safe", 4 + Math.floor(min(k.safe, 20) / 3) + 2 * k.art + 4 * k.titleSafe);
    if (k.safe >= 8 || k.art >= 3) add("safe-for-teams", 3 + Math.floor(min(k.safe, 20) / 4) + k.art);
  }

  const MIN = 6;
  const picks = [...scores.entries()]
    .filter(([, s]) => s >= MIN)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);
  if (picks.length > 0) return picks;

  // --- Fallback tier -----------------------------------------------------
  const out: string[] = [];
  const push = (...ids: string[]) => {
    for (const id of ids) if (!out.includes(id) && out.length < 3) out.push(id);
  };
  const orgChange = pc === "Change Management" || k.transf >= 2 || k.change >= 2 || k.org >= 8;
  if (k.strategy >= 4) push("fl3d", "flin");
  if (k.teamdyn >= 6) push("icp-atf");
  if (cats.includes("Lean")) push("kmp1");
  const byPrimary: Record<string, string[]> = {
    Coaching: ["icp-acc"],
    Kanban: ["kmp1"],
    "Flight Levels": ["flin"],
    Scrum: ["csm"],
    "Product Development": ["cspo"],
    Leadership: ["cal-1"],
    Agile: ["csm"],
    "Change Management": ["icp-cat", "cal-1"],
    AI: ["ai-for-product-owners", "ai-for-scrum-masters"],
  };
  push(...(byPrimary[pc] ?? []));
  if ((cats.includes("AI") || k.ai >= 8) && pc !== "AI") {
    if (orgChange) push("icp-cat", "cal-1");
    push("ai-for-product-owners");
  }
  if (k.teamdyn >= 3) push("icp-atf");
  if (k.lean >= 3) push("kmp1");
  if (k.poterms >= 4 || k.discover >= 3) push("cspo");
  if (orgChange) push("icp-cat", "cal-1");
  if (cats.includes("Leadership") || k.leader >= 3) push("cal-1");
  if (k.scaling >= 3 || k.org >= 10) push("flin");
  if (cats.includes("Scrum")) push("csm");
  if (cats.includes("Book Reviews")) push("cal-1");
  return out;
}

// Resolves picks to course entries. For the German page, each course is
// swapped for its German entry (id "de/<slug>") where one exists -- every
// course has one today, but this falls back to English rather than
// assuming so, same defensive shape as localizedCourse in i18n.ts.
export function relatedCourses(article: Article, courses: Course[], locale: "en" | "de" = "en"): Course[] {
  const byId = new Map(courses.map((c) => [c.id, c]));
  return relatedCourseIds(article)
    .map((id) => (locale === "de" ? (byId.get(`de/${id}`) ?? byId.get(id)) : byId.get(id)))
    .filter((c): c is Course => Boolean(c));
}
