import React, { useEffect, useMemo, useState } from "react";
import { slug, uniq, cls, clamp, flatten, toggleTag, hexWithAlpha } from "./lib/utils";
import { useLocalData } from "./hooks/useLocalData";
import { useAppearance } from "./hooks/useAppearance";
import { TopicList } from "./components/TopicList";
import { KanbanView } from "./components/KanbanView";
import { TimelineView } from "./components/TimelineView";
import { MapView } from "./components/MapView";
import { Toolbar } from "./components/Toolbar";
import { Field } from "./components/Field";
import { TagEditor } from "./components/TagEditor";
import { ConfidenceBar } from "./components/ConfidenceBar";
import { LinksBlock } from "./components/LinksBlock";
import { SettingsSheet } from "./components/SettingsSheet";
import { StyleBlock } from "./components/StyleBlock";
import { AddModal } from "./components/AddModal";
// === Ancient Knowledge Atlas – v2 ===
// Clean, modern, minimalist research notebook with multiple views, appearance settings,
// role fields, confidence sliders, keyboard shortcuts, and lightweight animations.
// TailwindCSS only (no external UI libs). Data persists to localStorage.

// ---------- Types ----------
/** @typedef {{
 *  id: string,
 *  title: string,
 *  tags?: string[],
 *  summary?: string,
 *  notes?: string,
 *  links?: string[],
 *  role?: string,              // Hypothesis | Evidence | Method | Debate | Site | Theory | Spec | Question | Note
 *  confidence?: number,        // 0–100
 *  year?: number | null,       // for timeline (positive for CE, negative for BCE)
 *  lat?: number | null,        // for map (WGS84)
 *  lng?: number | null         // for map (WGS84)
 * }} Topic */
/** @typedef {{ id: string, name: string, topics: Topic[] }} Category */

// ---------- Roles / Defaults ----------
const ROLES = ["Evidence", "Hypothesis", "Method", "Debate", "Site", "Theory", "Spec", "Question", "Note"];
const DEFAULT_TAGS = [
  "site","evidence","debate","method","theory","spec","craft","astro","paleo","ai","diet","texts","history","americas","migration","climate","data","space","norms","person","quote","mantra","note","coasts","recovery","timeline","inference","sea"
];

// ---------- Seed Data (pruned: removed meta/ads/intro) ----------
/** @type {Category[]} */
const SEED = [
  {
    id: "h-sapiens-deeptime",
    name: "Homo sapiens deep time",
    topics: [
      { id: "jebel-irhoud", title: "Jebel Irhoud ~315kya", tags: ["evidence","paleo"], role: "Evidence", year: -315000, lat: 31.95, lng: -8.03 },
      { id: "pushback-age", title: "Sapiens age pushed back", tags: ["evidence"], role: "Evidence" },
      { id: "behavioral-stasis", title: "Anatomical ≠ behavioral stasis", tags: ["theory"], role: "Debate" },
      { id: "warm-periods", title: "Earlier warm periods noted", tags: ["climate"], role: "Theory" },
      { id: "cog-rev-skeptic", title: "Cognitive revolution skepticism", tags: ["critique"], role: "Debate" },
    ],
  },
  {
    id: "cataclysms",
    name: "Cataclysms & collapses",
    topics: [
      { id: "lbac", title: "Late Bronze Age Collapse", tags: ["history","collapse"], role: "Evidence", year: -1200 },
      { id: "half-degree", title: "Half-degree shifts topple empires", tags: ["climate"], role: "Theory" },
      { id: "prehistory-shocks", title: "Prehistory had larger shocks", tags: ["climate"], role: "Theory" },
      { id: "yd-implications", title: "Younger Dryas implications", tags: ["spec"], role: "Spec", year: -12800 },
    ],
  },
  {
    id: "preservation-bias",
    name: "Evidence & preservation bias",
    topics: [
      { id: "nine-sites", title: ">100kya sites ≈ nine", tags: ["paleo","critique"], role: "Evidence" },
      { id: "material-decay", title: "Material decay 10–100k yrs", tags: ["materials"], role: "Theory" },
      { id: "urban-overgrowth", title: "Urban overgrowth analogies", tags: ["analogy"], role: "Note" },
      { id: "sea-level", title: "Sea-level flux hides coasts", tags: ["coasts"], role: "Theory" },
      { id: "fossil-selection", title: "Fossilization selection effects", tags: ["paleo"], role: "Method" },
    ],
  },
  {
    id: "gobekli",
    name: "Göbekli Tepe / Taş Tepeler",
    topics: [
      { id: "gt-12k", title: "GT ~12kya megaliths", tags: ["site"], role: "Evidence", year: -10000, lat: 37.223, lng: 38.923 },
      { id: "intentional-backfill", title: "Intentional backfilling", tags: ["site"], role: "Evidence" },
      { id: "pillar-43", title: "Pillar 43 calendar debate", tags: ["astro","debate"], role: "Debate" },
      { id: "astro-align", title: "Astronomical alignments", tags: ["astro"], role: "Evidence" },
      { id: "five-percent", title: "Only 5% excavated", tags: ["method"], role: "Note" },
      { id: "redesign-hg", title: "Redefine hunter-gatherers", tags: ["theory"], role: "Debate" },
      { id: "gap-to-sumer", title: "6k-year gap to Sumer", tags: ["timeline"], role: "Question" },
      { id: "tas-tepeler", title: "Taş Tepeler network", tags: ["site"], role: "Evidence" },
    ],
  },
  {
    id: "agri-puzzles",
    name: "Agriculture puzzles",
    topics: [
      { id: "holocene-stability", title: "Holocene stability critique", tags: ["climate"], role: "Debate" },
      { id: "independent-invention", title: "Independent inventions", tags: ["agri"], role: "Debate" },
      { id: "simultaneity", title: "Why simultaneous?", tags: ["question"], role: "Question" },
      { id: "earlier-interglacials", title: "Prior interglacials", tags: ["climate"], role: "Theory" },
    ],
  },
  {
    id: "sahara-egypt",
    name: "Sahara → Egypt hypothesis",
    topics: [
      { id: "green-sahara", title: "Green Sahara ~9k yrs", tags: ["climate","africa"], role: "Evidence", year: -9000 },
      { id: "rapid-desert", title: "Rapid desertification", tags: ["climate"], role: "Evidence" },
      { id: "nile-migration", title: "Migration to Nile", tags: ["migration"], role: "Hypothesis" },
      { id: "under-survey", title: "Under-surveyed Sahara", tags: ["method"], role: "Method" },
      { id: "civ-after-worse", title: "Civ after climate worsens?", tags: ["puzzle"], role: "Question" },
    ],
  },
  {
    id: "egypt-anomalies",
    name: "Egypt anomalies / tomb debate",
    topics: [
      { id: "gp-not-tomb", title: "Great Pyramid tomb claim challenged", tags: ["debate"], role: "Debate", lat: 29.9792, lng: 31.1342 },
      { id: "precision-stone", title: "Precision stonework astonishment", tags: ["craft"], role: "Evidence" },
      { id: "vases", title: "Early dynastic hard-stone vases", tags: ["craft"], role: "Evidence" },
      { id: "quality-decline", title: "Later quality decline", tags: ["timeline"], role: "Evidence" },
    ],
  },
  {
    id: "subsurface-giza",
    name: "Subsurface Giza claims",
    topics: [
      { id: "tomography", title: "Italian tomography buzz", tags: ["scan","debate"], role: "Debate" },
      { id: "pillars-coils", title: "Deep pillars & coils claim", tags: ["spec"], role: "Spec" },
      { id: "labyrinth-reports", title: "Historical labyrinth reports", tags: ["history"], role: "Evidence" },
      { id: "need-better-data", title: "Need better data", tags: ["method"], role: "Method" },
    ],
  },
  {
    id: "dunn-powerplant",
    name: "Christopher Dunn / power plant",
    topics: [
      { id: "dunn-precision", title: "Dunn: precision engineering", tags: ["person"], role: "Evidence" },
      { id: "acoustic-plant", title: "Acoustic/resonant chambers", tags: ["theory"], role: "Hypothesis" },
      { id: "integration", title: "Integration with subsurface", tags: ["spec"], role: "Spec" },
    ],
  },
  {
    id: "sphinx-dating",
    name: "Sphinx / erosion / dating",
    topics: [
      { id: "water-erosion", title: "Water erosion argument", tags: ["debate"], role: "Debate", lat: 29.9753, lng: 31.1376 },
      { id: "sand-burial", title: "Often buried by sand", tags: ["context"], role: "Evidence" },
      { id: "clearing-records", title: "Ancient clearing records", tags: ["texts"], role: "Evidence" },
    ],
  },
  {
    id: "wadi-whales",
    name: "Wadi Al-Hitan & paleo context",
    topics: [
      { id: "eocene-whales", title: "Eocene whales/manatees", tags: ["paleo"], role: "Evidence", year: -40000000, lat: 29.27, lng: 30.0 },
      { id: "land-to-sea", title: "Whales from land mammals", tags: ["evolution"], role: "Evidence" },
      { id: "dinos-egypt", title: "Dinosaurs in Egypt aside", tags: ["paleo"], role: "Note" },
    ],
  },
  {
    id: "human-evo-genetics",
    name: "Human evolution / genetics",
    topics: [
      { id: "brain-size", title: "Brain size tripled timescale", tags: ["evo"], role: "Evidence" },
      { id: "neander-smart", title: "Neanderthal intelligence", tags: ["evo"], role: "Evidence" },
      { id: "interbreeding", title: "Sapiens–Neanderthal admixture", tags: ["genetics"], role: "Evidence" },
      { id: "oof-complex", title: "Out-of-Africa complexities", tags: ["migration"], role: "Debate" },
      { id: "erectus-migrations", title: "Erectus migrations", tags: ["migration"], role: "Evidence" },
    ],
  },
  {
    id: "kalambo-wood",
    name: "Kalambo Falls wood structure",
    topics: [
      { id: "notched-timbers", title: "Notched timbers joinery", tags: ["site","craft"], role: "Evidence", year: -476000, lat: -8.6, lng: 31.25 },
      { id: "age-476k", title: "~476k years old claim", tags: ["dating"], role: "Evidence" },
      { id: "pre-sapiens", title: "Pre-sapiens capability?", tags: ["evo"], role: "Debate" },
      { id: "bog-pres", title: "Bog/waterlogged preservation", tags: ["preservation"], role: "Method" },
    ],
  },
  {
    id: "bottlenecks",
    name: "Bottlenecks / resets",
    topics: [
      { id: "toba", title: "Toba eruption ~74kya", tags: ["climate"], role: "Evidence", year: -74000 },
      { id: "few-thousand-left", title: "3k–10k humans left?", tags: ["genetics"], role: "Debate" },
      { id: "re-emerge", title: "Re-emergence time", tags: ["recovery"], role: "Question" },
    ],
  },
  {
    id: "seafaring",
    name: "Seafaring deep past",
    topics: [
      { id: "erectus-hopping", title: "Erectus island hopping", tags: ["migration","sea"], role: "Evidence" },
      { id: "neander-medit", title: "Neanderthals cross Med", tags: ["sea"], role: "Evidence" },
      { id: "sentinel", title: "North Sentinel migration", tags: ["sea"], role: "Evidence" },
      { id: "polynesian", title: "Polynesian analogies", tags: ["sea"], role: "Note" },
      { id: "americas-coastal", title: "Americas coastal route", tags: ["americas"], role: "Debate" },
    ],
  },
  {
    id: "antikythera",
    name: "Antikythera mechanism",
    topics: [
      { id: "ancient-computer", title: "2k-year-old computer", tags: ["tech","site"], role: "Evidence", year: -100 },
      { id: "prior-tradition", title: "Implies prior tradition", tags: ["inference"], role: "Hypothesis" },
      { id: "greek-egypt", title: "Greek–Egypt knowledge link", tags: ["history"], role: "Debate" },
    ],
  },
  {
    id: "underground-megastructures",
    name: "Underground megastructures",
    topics: [
      { id: "derinkuyu", title: "Derinkuyu ~20k capacity", tags: ["site"], role: "Evidence", lat: 38.375, lng: 34.733 },
      { id: "85m-deep", title: "85m deep networks", tags: ["site"], role: "Evidence" },
      { id: "cataclysm-shelter", title: "Shelter vs invasion?", tags: ["debate"], role: "Debate" },
      { id: "longyou", title: "Longyou Caves 24 chambers", tags: ["site"], role: "Evidence", lat: 29.05, lng: 119.17 },
      { id: "parallel-marks", title: "Parallel tool marks", tags: ["craft"], role: "Evidence" },
      { id: "hawara", title: "Hawara labyrinth accounts", tags: ["texts"], role: "Evidence", lat: 29.25, lng: 30.9 },
      { id: "submerged", title: "Submergence complicates access", tags: ["method"], role: "Method" },
    ],
  },
  {
    id: "stoneworking",
    name: "Stoneworking anomalies",
    topics: [
      { id: "unfinished-obelisk", title: "Unfinished obelisk quarry", tags: ["site"], role: "Evidence", lat: 24.088, lng: 32.899 },
      { id: "serapeum-boxes", title: "Serapeum granite boxes", tags: ["craft"], role: "Evidence", lat: 29.971, lng: 31.132 },
      { id: "drill-cores", title: "Drill cores/rapid removal", tags: ["craft"], role: "Evidence" },
      { id: "colossi-symmetry", title: "Colossi perfect symmetry", tags: ["craft"], role: "Evidence" },
      { id: "handles-vs-lathe", title: "Handles vs lathe paradox", tags: ["puzzle"], role: "Debate" },
    ],
  },
  {
    id: "acoustics",
    name: "Acoustics & resonance",
    topics: [
      { id: "kings-chamber", title: "King's Chamber acoustics", tags: ["sound","site"], role: "Evidence" },
      { id: "cymatics", title: "Cymatics patterns analogies", tags: ["sound"], role: "Note" },
      { id: "cathedral-sound", title: "Cathedral acoustics", tags: ["sound"], role: "Note" },
      { id: "archimedes-vowels", title: "Archimedes' seven vowels", tags: ["texts"], role: "Evidence" },
    ],
  },
  {
    id: "sacred-geometry",
    name: "Sacred geometry / art",
    topics: [
      { id: "flower-of-life", title: "Flower of Life motif", tags: ["symbol"], role: "Evidence" },
      { id: "da-vinci", title: "Da Vinci sketches", tags: ["person"], role: "Note" },
      { id: "shared-symbols", title: "Shared symbols across sites", tags: ["symbol"], role: "Hypothesis" },
    ],
  },
  {
    id: "data-fragility",
    name: "Data fragility / satellites",
    topics: [
      { id: "deorbit", title: "Satellites deorbit in decades", tags: ["space"], role: "Note" },
      { id: "25y-rule", title: "25-year rule mentioned", tags: ["space"], role: "Note" },
      { id: "digital-perish", title: "Digital records perish", tags: ["data"], role: "Note" },
      { id: "cme-risk", title: "Solar flare/CME risk", tags: ["space"], role: "Question" },
    ],
  },
  {
    id: "ai-quantum",
    name: "AI / quantum / tech",
    topics: [
      { id: "llms-debate", title: "LLMs shift discourse", tags: ["ai"], role: "Note" },
      { id: "grok", title: "Grok censorship musings", tags: ["ai"], role: "Debate" },
      { id: "quantum-reversal", title: "Quantum 1s reversal headline", tags: ["quantum"], role: "Note" },
      { id: "ai-guided-arch", title: "AI-guided archaeology", tags: ["ai"], role: "Method" },
      { id: "post-physical", title: "Transdimensional speculation", tags: ["spec"], role: "Spec" },
    ],
  },
  {
    id: "academia-culture",
    name: "Academia & culture",
    topics: [
      { id: "gatekeeping", title: "Gatekeeping critique", tags: ["meta"], role: "Debate" },
      { id: "clovis-first", title: "Clovis-First fiasco", tags: ["americas"], role: "Evidence" },
      { id: "funerals-quote", title: "Science by funerals quote", tags: ["quote"], role: "Note" },
      { id: "net-podcasts", title: "Net/podcasts democratize", tags: ["media"], role: "Note" },
      { id: "treat-hancock", title: "Treat Hancock civilly", tags: ["norms"], role: "Norms" },
    ],
  },
  {
    id: "americas-peopling",
    name: "Americas peopling debates",
    topics: [
      { id: "nm-footprints", title: "22kya New Mexico footprints", tags: ["evidence","americas"], role: "Evidence", year: -20000 },
      { id: "cerutti-mastodon", title: "Cerutti Mastodon 130kya?", tags: ["debate","americas"], role: "Debate", year: -130000 },
      { id: "coastal-route", title: "Coastal-route plausibility", tags: ["americas"], role: "Hypothesis" },
    ],
  },
  {
    id: "king-lists",
    name: "King lists & myth/history",
    topics: [
      { id: "sumer-egypt-kings", title: "Sumer/Egypt king lists", tags: ["texts"], role: "Evidence" },
      { id: "myth-fact-line", title: "Myth/fact dividing line", tags: ["method"], role: "Debate" },
      { id: "propaganda", title: "Propaganda thousand-year reigns", tags: ["texts"], role: "Debate" },
    ],
  },
  {
    id: "library-alex",
    name: "Library of Alexandria",
    topics: [
      { id: "loss", title: "Massive knowledge loss", tags: ["history"], role: "Evidence" },
      { id: "multiple-burns", title: "Multiple burnings?", tags: ["debate"], role: "Debate" },
    ],
  },
  {
    id: "diet-health",
    name: "Diet / health & civilization forms",
    topics: [
      { id: "grain-survival", title: "Grain as survival food", tags: ["diet"], role: "Note" },
      { id: "stature-decline", title: "Post-agri health decline", tags: ["diet"], role: "Evidence" },
      { id: "jaw-shrink", title: "Jaw shrinkage from mush", tags: ["diet"], role: "Evidence" },
      { id: "alt-pathways", title: "Alt civilization pathways", tags: ["theory"], role: "Theory" },
    ],
  },
  {
    id: "pyramids-system",
    name: "Pyramids: broader system ideas",
    topics: [
      { id: "integrated-giza", title: "Integrated Giza complex", tags: ["spec"], role: "Hypothesis" },
      { id: "energy-not-tomb", title: "Energy/engineering framing", tags: ["theory"], role: "Theory" },
      { id: "inherit-renovate", title: "Inherited/renovated later?", tags: ["timeline"], role: "Debate" },
    ],
  },
  {
    id: "amnesia",
    name: "Species with amnesia",
    topics: [
      { id: "older", title: "Things keep getting older", tags: ["mantra"], role: "Note" },
      { id: "undersea", title: "Undersea archaeology priority", tags: ["method"], role: "Method" },
    ],
  },
];

export default function App() {
  const [data, setData] = useLocalData(SEED);
  const [query, setQuery] = useState("");
  const [activeCatId, setActiveCatId] = useState(data[0]?.id ?? "");
  const [selected, setSelected] = useState<{catId: string, topicId: string} | null>(null);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [view, setView] = useState("list"); // list | kanban | timeline | map
  const [kanbanGroup, setKanbanGroup] = useState("role"); // role | tag
  const [showSettings, setShowSettings] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  // Appearance
  const [theme, setTheme] = useAppearance("aka_theme", "light"); // light | dark
  const [accent, setAccent] = useAppearance("aka_accent", "#111827"); // default neutral-900

  // computed
  const flat = useMemo(() => flatten(data), [data]);
  const tagUniverse = useMemo(() => uniq(DEFAULT_TAGS.concat(flat.flatMap((t: any) => t.tags || []))).sort(), [flat]);

  const visibleTopics = useMemo(() => {
    let topics: any[] = [];
    if (query.trim()) {
      const q = query.toLowerCase();
      topics = flat.filter((t: any) =>
        t.title.toLowerCase().includes(q) ||
        (t.summary||"").toLowerCase().includes(q) ||
        (t.notes||"").toLowerCase().includes(q) ||
        (t.tags||[]).some((tag: string) => tag.toLowerCase().includes(q))
      );
    } else {
      topics = (data.find((c: any) => c.id === activeCatId)?.topics || []).map((t: any) => ({...t, catId: activeCatId, catName: data.find((c: any)=>c.id===activeCatId)?.name }));
    }
    if (filterTags.length) {
      topics = topics.filter((t: any) => (t.tags||[]).some((tag: string) => filterTags.includes(tag)));
    }
    return topics;
  }, [query, flat, data, activeCatId, filterTags]);

  // selection default
  useEffect(() => {
    if (!selected && visibleTopics[0]) setSelected({ catId: visibleTopics[0].catId, topicId: visibleTopics[0].id });
  }, [visibleTopics, selected]);

  const selectedTopic = useMemo(() => {
    if (!selected) return null;
    const cat = data.find((c: any) => c.id === selected.catId);
    const topic = cat?.topics.find((t: any) => t.id === selected.topicId);
    return topic ? { ...topic, catName: cat?.name, catId: cat?.id } : null;
  }, [selected, data]);

  // handlers
  const updateTopic = (catId: string, topicId: string, patch: any) => {
    setData((prev: any) => prev.map((c: any) => c.id !== catId ? c : ({
      ...c,
      topics: c.topics.map((t: any) => t.id !== topicId ? t : ({ ...t, ...patch }))
    })));
  };

  const addCategory = () => {
    setShowAddCategory(true);
  };

  const handleAddCategory = (name: string) => {
    const id = slug(name) || `cat-${Date.now()}`;
    setData((prev: any) => [...prev, { id, name, topics: [] }]);
    setActiveCatId(id);
  };

  const addTopic = () => {
    setShowAddTopic(true);
  };

  const handleAddTopic = (title: string) => {
    const catId = activeCatId || data[0]?.id;
    if (!catId) return;
    const id = slug(title) || `t-${Date.now()}`;
    setData((prev: any) => prev.map((c: any) => c.id !== catId ? c : ({
      ...c,
      topics: [{ id, title, tags: [], summary: "", notes: "", links: [], role: "Note", confidence: 50, year: null, lat: null, lng: null }, ...c.topics]
    })));
    setSelected({ catId, topicId: id });
  };
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ancient-knowledge-atlas.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (Array.isArray(parsed)) setData(parsed);
        else alert("Invalid JSON format: expected an array of categories");
      } catch (err: any) {
        alert("Failed to parse JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // CSS variables for theme/accent
  const cssVars = {
    "--bg": theme === "dark" ? "#0b0e12" : "#ffffff",
    "--fg": theme === "dark" ? "#e5e7eb" : "#111827",
    "--muted": theme === "dark" ? "#9ca3af" : "#6b7280",
    "--card": theme === "dark" ? "#0f1520" : "#ffffff",
    "--border": theme === "dark" ? "#1f2937" : "#e5e7eb",
    "--accent": accent,
    "--accent-weak": hexWithAlpha(accent, 0.12),
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)", ...cssVars }}>
      <StyleBlock />

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b backdrop-blur" style={{ background: "color-mix(in oklab, var(--bg) 88%, transparent)", borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(v=>!v)} className="btn subtle" title="Toggle sidebar">☰</button>
          <div className="font-semibold tracking-tight">Ancient Knowledge Atlas</div>
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <div className="relative w-72 max-w-[50vw]">
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search topics…" className="input pr-9" />
              {query && (<button onClick={()=>setQuery("")} className="icon-btn" title="Clear">✕</button>)}
            </div>
            <button onClick={addTopic} className="btn">＋ Topic</button>
            <button onClick={addCategory} className="btn">＋ Category</button>
            <button onClick={exportJSON} className="btn">⬇︎ Export</button>
            <label className="btn cursor-pointer">⬆︎ Import<input type="file" accept="application/json" onChange={onImport} className="hidden" /></label>
            <button onClick={()=>setShowSettings(true)} className="btn subtle" title="Appearance">⚙︎</button>
          </div>
        </div>
      </header>

      <Toolbar view={view} setView={setView} kanbanGroup={kanbanGroup} setKanbanGroup={setKanbanGroup} />

      <div className="mx-auto max-w-7xl grid grid-cols-12 gap-6 px-4 py-6">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="col-span-12 md:col-span-4 lg:col-span-3 animate-in">
            <div className="card">
              <div className="card-head">Categories</div>
              <div className="max-h-[70vh] overflow-auto p-2">
                {data.map((c: any) => (
                  <button key={c.id} onClick={()=>{setActiveCatId(c.id); setQuery("");}}
                    className={cls("block w-full text-left rounded-xl px-3 py-2 mb-1 transition", c.id===activeCatId?"bg-[var(--accent)] text-white shadow-sm":"hover:bg-[var(--accent-weak)]")}
                  >
                    <div className="font-medium flex items-center gap-2">
                      <span className="inline-block size-2 rounded-full" style={{ background: c.id===activeCatId?"#fff":"var(--muted)" }} />
                      {c.name}
                    </div>
                    <div className={cls("text-xs", c.id===activeCatId?"text-white/80":"text-[var(--muted)]")}>{c.topics.length} topics</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 card">
              <div className="card-head">Tag filter</div>
              <div className="p-2 max-h-[30vh] overflow-auto">
                <div className="flex flex-wrap gap-2">
                  {tagUniverse.map((tag: string) => (
                    <button key={tag} onClick={()=> toggleTag(tag, filterTags, setFilterTags)}
                      className={cls("chip", filterTags.includes(tag)?"chip-on":"")}
                    >{tag}</button>
                  ))}
                </div>
                {filterTags.length>0 && (
                  <button onClick={()=>setFilterTags([])} className="mt-3 text-xs underline text-[var(--muted)]">Clear tags</button>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Main area (switch by view) */}
        <main className={cls(sidebarOpen?"col-span-12 md:col-span-8 lg:col-span-5":"col-span-12 lg:col-span-7", "min-h-[70vh]")}> 
          {view === "list" && (
            <TopicList
              data={data}
              visibleTopics={visibleTopics}
              selected={selected}
              setSelected={setSelected}
            />
          )}
          {view === "kanban" && (
            <KanbanView data={data} setSelected={setSelected} groupBy={kanbanGroup} />
          )}
          {view === "timeline" && (
            <TimelineView data={data} setSelected={setSelected} theme={theme} />
          )}
          {view === "map" && (
            <MapView data={data} setSelected={setSelected} />
          )}
        </main>

        {/* Detail panel */}
        <section className="col-span-12 lg:col-span-4 animate-in">
          <div className="card">
            <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <div className="text-sm" style={{ color: "var(--muted)" }}>Details</div>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={()=>setEditMode(v=>!v)} className="btn subtle text-sm">{editMode?"Done":"Edit"}</button>
                </div>
              </div>
            </div>
            {!selectedTopic ? (
              <div className="p-6" style={{ color: "var(--muted)" }}>Select a topic to view details.</div>
            ) : (
              <div className="p-4 space-y-4">
                <Field label="Category"><div className="text-sm">{selectedTopic.catName}</div></Field>

                <Field label="Title">
                  {editMode ? (
                    <input className="input" value={selectedTopic.title}
                      onChange={(e)=> updateTopic(selectedTopic.catId, selectedTopic.id, { title: e.target.value })} />
                  ) : (
                    <div className="font-medium text-lg">{selectedTopic.title}</div>
                  )}
                </Field>

                <Field label="Role">
                  {editMode ? (
                    <select className="input" value={selectedTopic.role||"Note"}
                      onChange={(e)=> updateTopic(selectedTopic.catId, selectedTopic.id, { role: e.target.value })}>
                      {ROLES.map((r: string)=> <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span className="chip chip-on">{selectedTopic.role||"Note"}</span>
                  )}
                </Field>

                <Field label="Confidence">
                  {editMode ? (
                    <div className="flex items-center gap-3">
                      <input type="range" min={0} max={100} value={selectedTopic.confidence ?? 50}
                        onChange={(e)=> updateTopic(selectedTopic.catId, selectedTopic.id, { confidence: clamp(parseInt(e.target.value||"0"),0,100) })} />
                      <span className="text-sm" style={{ color: "var(--muted)" }}>{selectedTopic.confidence ?? 50}%</span>
                    </div>
                  ) : (
                    <ConfidenceBar value={selectedTopic.confidence ?? 50} />
                  )}
                </Field>

                <Field label="Tags">
                  {editMode ? (
                    <TagEditor value={selectedTopic.tags||[]} options={tagUniverse}
                      onChange={(tags: string[])=> updateTopic(selectedTopic.catId, selectedTopic.id, { tags })} />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(selectedTopic.tags||[]).length? (selectedTopic.tags||[]).map((tag: string) => (
                        <span key={tag} className="chip">{tag}</span>
                      )) : <span className="text-sm" style={{ color: "var(--muted)" }}>—</span>}
                    </div>
                  )}
                </Field>

                <Field label="Summary">
                  {editMode ? (
                    <textarea className="input min-h-[100px]" value={selectedTopic.summary||""}
                      onChange={(e)=> updateTopic(selectedTopic.catId, selectedTopic.id, { summary: e.target.value })} />
                  ) : (
                    <div className="prose prose-sm max-w-none" style={{ color: "var(--fg)" }}>{selectedTopic.summary || <span style={{ color: "var(--muted)" }}>—</span>}</div>
                  )}
                </Field>

                <Field label="Notes">
                  {editMode ? (
                    <textarea className="input min-h-[120px]" value={selectedTopic.notes||""}
                      onChange={(e)=> updateTopic(selectedTopic.catId, selectedTopic.id, { notes: e.target.value })} />
                  ) : (
                    <div className="prose prose-sm max-w-none" style={{ color: "var(--fg)" }}>{selectedTopic.notes || <span style={{ color: "var(--muted)" }}>—</span>}</div>
                  )}
                </Field>

                <Field label="Links"><LinksBlock edit={editMode} topic={selectedTopic} updateTopic={updateTopic} /></Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Year (negative = BCE)">
                    {editMode ? (
                      <input className="input" type="number" placeholder="e.g., -2500 or 1998" value={selectedTopic.year ?? ""}
                        onChange={(e)=> updateTopic(selectedTopic.catId, selectedTopic.id, { year: e.target.value===""? null : Number(e.target.value) })} />
                    ) : (
                      <div>{selectedTopic.year ?? <span style={{ color: "var(--muted)" }}>—</span>}</div>
                    )}
                  </Field>
                  <Field label="Coordinates (lat, lng)">
                    {editMode ? (
                      <div className="flex items-center gap-2">
                        <input className="input" type="number" step="0.001" placeholder="lat" value={selectedTopic.lat ?? ""}
                          onChange={(e)=> updateTopic(selectedTopic.catId, selectedTopic.id, { lat: e.target.value===""? null : Number(e.target.value) })} />
                        <input className="input" type="number" step="0.001" placeholder="lng" value={selectedTopic.lng ?? ""}
                          onChange={(e)=> updateTopic(selectedTopic.catId, selectedTopic.id, { lng: e.target.value===""? null : Number(e.target.value) })} />
                      </div>
                    ) : (
                      <div>{(selectedTopic.lat!=null && selectedTopic.lng!=null) ? `${selectedTopic.lat.toFixed(3)}, ${selectedTopic.lng.toFixed(3)}` : <span style={{ color: "var(--muted)" }}>—</span>}</div>
                    )}
                  </Field>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="mx-auto max-w-7xl px-4 pb-10 pt-2 text-xs" style={{ color: "var(--muted)" }}>
        <div className="flex flex-wrap items-center gap-2">
          <span>⌘K to focus search · ⌘/ toggle sidebar</span>
          <span className="opacity-50">·</span>
          <span>Local-only data (export to share)</span>
        </div>
      </footer>

      <SettingsSheet theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent} showSettings={showSettings} setShowSettings={setShowSettings} />

      <AddModal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onSubmit={handleAddCategory}
        title="Add New Category"
        placeholder="Enter category name..."
        submitText="Add Category"
      />

      <AddModal
        isOpen={showAddTopic}
        onClose={() => setShowAddTopic(false)}
        onSubmit={handleAddTopic}
        title="Add New Topic"
        placeholder="Enter topic title..."
        submitText="Add Topic"
      />
    </div>
  );
}
