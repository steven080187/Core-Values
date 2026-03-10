import React, { useEffect, useRef, useState } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const ALL_VALUES = [
  "Acceptance","Accomplishment","Accountability","Accuracy","Achievement","Adaptability","Alertness","Altruism","Ambition","Amusement","Assertiveness","Attentive","Awareness","Balance","Beauty","Boldness","Bravery","Brilliance","Calm","Candor","Capable","Careful","Certainty","Challenge","Charity","Cleanliness","Clear","Clever","Comfort","Commitment","Common sense","Communication","Community","Compassion","Competence","Concentration","Confidence","Connection","Consciousness","Consistency","Contentment","Contribution","Control","Conviction","Cooperation",
  "Courage","Courtesy","Creation","Creativity","Credibility","Curiosity","Decisive","Decisiveness","Dedication","Dependability","Determination","Development","Devotion","Dignity","Discipline","Discovery","Drive","Effectiveness","Efficiency","Empathy","Empower","Endurance","Energy","Enjoyment","Enthusiasm","Equality","Ethical","Excellence","Experience","Exploration","Expressive","Fairness","Family","Famous","Fearless","Feelings","Ferocious","Fidelity","Focus","Foresight","Fortitude","Freedom","Friendship","Fun","Generosity",
  "Genius","Giving","Goodness","Grace","Gratitude","Greatness","Growth","Happiness","Hard work","Harmony","Health","Honesty","Honor","Hope","Humility","Imagination","Improvement","Independence","Individuality","Innovation","Inquisitive","Insightful","Inspiring","Integrity","Intelligence","Intensity","Intuitive","Irreverent","Joy","Justice","Kindness","Knowledge","Lawful","Leadership","Learning","Liberty","Logic","Love","Loyalty","Mastery","Maturity","Meaning","Moderation","Motivation","Openness",
  "Optimism","Order","Organization","Originality","Passion","Patience","Peace","Performance","Persistence","Playfulness","Poise","Potential","Power","Present","Productivity","Professionalism","Prosperity","Purpose","Quality","Realistic","Reason","Recognition","Recreation","Reflective","Respect","Responsibility","Restraint","Results-oriented","Reverence","Rigor","Risk","Satisfaction","Security","Self-reliance","Selfless","Sensitivity","Serenity","Service","Sharing","Significance","Silence","Simplicity","Sincerity","Skill","Skillfulness",
  "Smart","Solitude","Spirit","Spirituality","Spontaneous","Stability","Status","Stewardship","Strength","Structure","Success","Support","Surprise","Sustainability","Talent","Teamwork","Temperance","Thankful","Thorough","Thoughtful","Timeliness","Tolerance","Toughness","Tradition","Tranquility","Transparency","Trust","Trustworthy","Truth","Understanding","Uniqueness","Unity","Valor","Victory","Vigor","Vision","Vitality","Wealth","Welcoming","Winning","Wisdom","Wonder",
];

const STAGES = {
  welcome: "welcome",
  intro: "intro",
  sort: "sort",
  halftime: "halftime",
  narrowHalf: "narrowHalf",
  topTenIntro: "topTenIntro",
  topTen: "topTen",
  rankIntro: "rankIntro",
  rank: "rank",
  narrativeIntro: "narrativeIntro",
  narrative: "narrative",
};

// ─── UTILITIES ────────────────────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── AI ───────────────────────────────────────────────────────────────────────
async function generateAINarrative(name, values) {
  const apiKey = import.meta.env.VITE_GROQ_KEY;
  const valuesText = values.map((v, i) => `${i + 1}. ${v}`).join("\n");
  const prompt = `You are writing a heartfelt first-person narrative statement for someone named ${name} who has just completed a meaningful self-reflection exercise about their core values. They are on a personal journey of growth and recovery.

Their top 10 core values in ranked order are:
${valuesText}

Write a flowing narrative in first person as if ${name} is speaking directly. Begin exactly with: "My name is ${name}. My top core value is ${values[0]}."

Then naturally weave through all 10 values — not listing them robotically, but letting them emerge organically as a portrait of who this person is. The tone should be warm, grounded, and quietly powerful. Write as if this person is explaining to someone important who they are and what they stand for. End with one quiet, strong sentence that ties their whole identity together.

About 200–240 words. No bullet points, no headers — just flowing first-person prose.`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.72,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

function buildFallbackNarrative(name, values) {
  if (values.length < 10) return "";
  const [v1, v2, v3, v4, v5, v6, v7, v8, v9, v10] = values;
  return (
    `My name is ${name}. My top core value is ${v1.toLowerCase()}, and it is the lens through which I see everything else in my life. ` +
    `${v2} and ${v3} live close behind — they shape the way I treat people, the standards I hold for myself, and what I refuse to give up on. ` +
    `${v4} and ${v5} are values I carry into hard moments. When I am uncertain, when I am tired, when I want to quit — I come back to these. ` +
    `${v6} and ${v7} remind me that I do not have to earn my worth. They describe who I already am. ` +
    `${v8} and ${v9} are part of the person I am still becoming — and becoming is enough. ` +
    `And ${v10.toLowerCase()} ties all of it together. ` +
    `These are not random words. They are the honest shape of who I am and the life I am building.`
  );
}

function buildProcessReflection(name) {
  return `${name || "You"}, take a breath and step back for just a moment. What you just did was not small. You moved through ${ALL_VALUES.length} core values and sorted them — keeping what felt true, letting go of what did not. Then you narrowed them down twice, until only ten remained. Then you placed those ten in order, from your number one core value to your number ten. These are not a random collection of nice words. You just completed a thorough examination of yourself. You paid attention, made real distinctions, and listened for what was true. The values in front of you are not accidental. They are an honest map of who you are. Now read your statement out loud, like you are telling someone who you are and what you stand for.`;
}

// ─── PDF ─────────────────────────────────────────────────────────────────────
function downloadPdfLikeHtml({ name, orderedTopTen, narrative, processReflection }) {
  const safeName = (name || "core-values-reflection")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  const html = `<!doctype html>
<html><head><meta charset="utf-8" />
<title>Core Values Reflection — ${name}</title>
<style>
body { font-family: Georgia, serif; color: #1f2937; padding: 40px; line-height: 1.7; }
h1 { font-size: 26px; margin-bottom: 6px; }
h2 { font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; color: #b45309; margin-top: 32px; }
.box { border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; background: #fafafa; }
.chip { display: inline-block; border: 1px solid #d1d5db; border-radius: 999px; padding: 5px 12px; margin: 0 6px 6px 0; font-size: 13px; }
ol { padding-left: 22px; }
</style>
</head><body>
  <h1>My name is ${name}.</h1>
  <div class="box">${narrative.split("\n").filter(Boolean).map((p) => `<p>${p}</p>`).join("")}</div>
  <h2>Final Reflection</h2>
  <div>${orderedTopTen.map((v, i) => `<span class="chip">#${i + 1} ${v}</span>`).join("")}</div>
  <h2>What I Just Did</h2>
  <div class="box">${processReflection}</div>
  <h2>Ranked Values</h2>
  <ol>${orderedTopTen.map((v, i) => `<li>${i + 1}. ${v}</li>`).join("")}</ol>
  <script>window.onload = () => window.print();</script>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName || "core-values-reflection"}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

// ─── FADE-IN WORDS ────────────────────────────────────────────────────────────
// Words emerge one by one like a calm voice rising from silence.
function FadeInWords({ text, msPerWord = 80 }) {
  const words = text.split(" ");
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    setRevealed(0);
    const timers = words.map((_, i) =>
      setTimeout(() => setRevealed(i + 1), i * msPerWord)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span
            style={{
              opacity: i < revealed ? 1 : 0,
              transition: "opacity 850ms ease",
              display: "inline",
            }}
          >
            {word}
          </span>
          {i < words.length - 1 ? " " : ""}
        </React.Fragment>
      ))}
    </span>
  );
}

// ─── DELAYED REVEAL ──────────────────────────────────────────────────────────
// Wraps children in opacity 0 → 1 after `ms` milliseconds.
// Used to let the celebration text settle before revealing the next challenge.
function Delayed({ ms, children }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return (
    <div style={{ opacity: show ? 1 : 0, transition: "opacity 1.1s ease", pointerEvents: show ? "auto" : "none" }}>
      {children}
    </div>
  );
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// Deep ocean midnight — evokes introspection, depth, stillness.
// Gold — worth, value, the light inside each person.
// Teal — healing, clarity, moving forward.
const C = {
  bg: "linear-gradient(160deg, #060c1a 0%, #0b1d35 55%, #060c1a 100%)",
  card: "rgba(255,255,255,0.045)",
  cardBorder: "rgba(255,255,255,0.09)",
  shadow: "0 24px 64px rgba(0,0,0,0.55)",
  gold: "#d4a847",
  goldLight: "#e6c060",
  goldBg: "rgba(212,168,71,0.10)",
  goldBorder: "rgba(212,168,71,0.28)",
  teal: "#5dd4b8",
  tealBg: "rgba(93,212,184,0.09)",
  tealBorder: "rgba(93,212,184,0.28)",
  textPrimary: "#e8f0f7",
  textSecondary: "#7ea8c4",
  textMuted: "#3e6175",
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function StageCard({ children, wide = false, glow = false }) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 32,
        boxShadow: glow
          ? `${C.shadow}, 0 0 120px rgba(93,212,184,0.055)`
          : C.shadow,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        padding: 34,
        maxWidth: wide ? 1100 : 860,
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}

function Btn({ children, onClick, disabled = false, ghost = false, style = {} }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: disabled
          ? "1px solid rgba(255,255,255,0.07)"
          : ghost
          ? "1px solid rgba(255,255,255,0.14)"
          : "1px solid transparent",
        background: disabled
          ? "rgba(255,255,255,0.04)"
          : ghost
          ? "rgba(255,255,255,0.04)"
          : `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
        color: disabled ? C.textMuted : ghost ? C.textSecondary : "#07101e",
        padding: "13px 22px",
        borderRadius: 18,
        fontSize: 15,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        letterSpacing: "0.01em",
        transition: "all 0.18s ease",
        fontFamily: "inherit",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Pill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: active ? `1px solid ${C.teal}` : "1px solid rgba(255,255,255,0.10)",
        background: active ? C.tealBg : "rgba(255,255,255,0.025)",
        color: active ? C.teal : C.textSecondary,
        borderRadius: 999,
        padding: "9px 17px",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        transition: "all 0.16s ease",
        letterSpacing: "0.01em",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );
}

function ProgressBar({ value }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 999, height: 6, overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: `linear-gradient(90deg, ${C.teal}, ${C.gold})`,
          height: "100%",
          borderRadius: 999,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

function DotLoader({ label = "Creating your statement…" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: C.teal,
            animation: `cvPulseDot 1.4s ease-in-out ${i * 0.22}s infinite`,
          }}
        />
      ))}
      <span style={{ color: C.textSecondary, fontSize: 14, marginLeft: 4 }}>{label}</span>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function CoreValuesSortApp() {
  async function uploadTextFile() {
  const text = "hello from my app";
  const base64 = btoa(unescape(encodeURIComponent(text)));

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: 'reflection.txt',
      content: base64,
    }),
  });

  const data = await res.json();
  alert(data.url || data.error);
}
  const [name, setName] = useState("");
  const [stage, setStage] = useState(STAGES.welcome);
  const [deck, setDeck] = useState(() => shuffleArray(ALL_VALUES));
  const [sortIndex, setSortIndex] = useState(0);
  const [havePile, setHavePile] = useState([]);
  const [notPile, setNotPile] = useState([]);
  const [halfSelections, setHalfSelections] = useState([]);
  const [topTenSelections, setTopTenSelections] = useState([]);
  const [orderedTopTen, setOrderedTopTen] = useState([]);
  const [counselorMode, setCounselorMode] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  // AI narrative state
  const [aiNarrative, setAiNarrative] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  // Rank drag state (pointer-event live reorder)
  const [rankDragValue, setRankDragValue] = useState(null);
  const [rankLiveOrder, setRankLiveOrder] = useState(null);
  const rankLiveOrderRef = useRef(null);

  // Background music
  const audioRef = useRef(null);
  const audioStartedRef = useRef(false);

  // Derived
  const currentValue = deck[sortIndex];
  const sortProgress = Math.round((sortIndex / deck.length) * 100);
  const halfTarget = Math.max(1, Math.ceil(havePile.length / 2));
  const canStart = name.trim() !== "";
  const processReflection = buildProcessReflection(name);
  const displayRankOrder = rankLiveOrder ?? orderedTopTen;

  // Start background music on first user interaction (satisfies browser autoplay policy)
  useEffect(() => {
    const audio = new Audio('/music/cosmic-contemplation.mp3');
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    function tryStart() {
      if (audioStartedRef.current) return;
      audioStartedRef.current = true;
      audio.play().catch(() => {});
      document.removeEventListener('pointerdown', tryStart);
    }

    document.addEventListener('pointerdown', tryStart);

    return () => {
      document.removeEventListener('pointerdown', tryStart);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Inject global styles once
  useEffect(() => {
    const id = "cv-global-style";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      *, *::before, *::after { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        background: ${C.bg};
        background-attachment: fixed;
        color: ${C.textPrimary};
        min-height: 100vh;
      }
      input, textarea {
        width: 100%;
        padding: 13px 15px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.12);
        font-size: 15px;
        background: rgba(255,255,255,0.05);
        color: ${C.textPrimary};
        font-family: inherit;
      }
      input::placeholder, textarea::placeholder { color: ${C.textMuted}; }
      input:focus, textarea:focus {
        outline: none;
        border-color: ${C.teal};
        box-shadow: 0 0 0 3px rgba(93,212,184,0.12);
      }
      .cv-grid { display: grid; gap: 16px; }
      .cv-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
      .cv-rank-card.dragging { opacity: 0.4; transform: scale(0.97); }
      @keyframes cvPulseDot {
        0%, 80%, 100% { transform: scale(0.7); opacity: 0.35; }
        40%            { transform: scale(1.15); opacity: 1; }
      }
      @media (max-width: 800px) {
        .cv-two { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(s);
  }, []);

  // Auto-start AI generation the moment user enters the narrativeIntro screen
  useEffect(() => {
    if (stage !== STAGES.narrativeIntro) return;
    if (!orderedTopTen.length) return;

    let cancelled = false;
    setGenError("");
    setAiNarrative("");

    const hasKey = !!import.meta.env.VITE_GROQ_KEY;
    if (!hasKey) {
      setAiNarrative(buildFallbackNarrative(name, orderedTopTen));
      return;
    }

    setGenerating(true);
    generateAINarrative(name, orderedTopTen)
      .then((narrative) => {
        if (!cancelled) {
          setAiNarrative(narrative);
          setGenerating(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setGenError(err.message);
          setAiNarrative(buildFallbackNarrative(name, orderedTopTen));
          setGenerating(false);
        }
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // ── ACTIONS ────────────────────────────────────────────────────────────────
  function resetAll() {
    setDeck(shuffleArray(ALL_VALUES));
    setSortIndex(0);
    setHavePile([]);
    setNotPile([]);
    setHalfSelections([]);
    setTopTenSelections([]);
    setOrderedTopTen([]);
    setAiNarrative("");
    setGenError("");
    setGenerating(false);
    setStage(STAGES.welcome);
  }

  // ── Hidden developer mode: tap header label 5 times to toggle ─────────────
  function handleSecretTap() {
    const next = tapCount + 1;
    if (next >= 5) {
      setCounselorMode((p) => !p);
      setTapCount(0);
      return;
    }
    setTapCount(next);
  }

  function choosePile(which) {
    if (!currentValue) return;
    if (which === "have") setHavePile((p) => [...p, currentValue]);
    else setNotPile((p) => [...p, currentValue]);
    if (sortIndex + 1 >= deck.length) {
      setSortIndex((n) => n + 1);
      setStage(STAGES.halftime);
    } else {
      setSortIndex((n) => n + 1);
    }
  }

  function toggleHalf(v) {
    setHalfSelections((prev) => {
      if (prev.includes(v)) return prev.filter((x) => x !== v);
      if (prev.length >= halfTarget) return prev;
      return [...prev, v];
    });
  }

  function toggleTopTen(v) {
    setTopTenSelections((prev) => {
      if (prev.includes(v)) return prev.filter((x) => x !== v);
      if (prev.length >= 10) return prev;
      return [...prev, v];
    });
  }

  // ── Rank drag — pointer-event live reorder ────────────────────────────────
  function startRankDrag(value) {
    const order = [...orderedTopTen];
    rankLiveOrderRef.current = order;
    setRankLiveOrder(order);
    setRankDragValue(value);
  }

  useEffect(() => {
    if (!rankDragValue) return;

    function handleMove(e) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const card = el?.closest?.('[data-rank-card]');
      if (!card) return;
      const targetVal = card.getAttribute('data-rank-card');
      if (!targetVal || targetVal === rankDragValue) return;
      const lo = rankLiveOrderRef.current;
      if (!lo) return;
      const fromIdx = lo.indexOf(rankDragValue);
      const toIdx = lo.indexOf(targetVal);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
      const next = [...lo];
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, rankDragValue);
      rankLiveOrderRef.current = next;
      setRankLiveOrder(next);
    }

    function handleUp() {
      if (rankLiveOrderRef.current) setOrderedTopTen(rankLiveOrderRef.current);
      setRankDragValue(null);
      setRankLiveOrder(null);
      rankLiveOrderRef.current = null;
    }

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rankDragValue]);

  // Developer skip helpers — preserved intact
  function skipToHalf() {
    setHavePile(ALL_VALUES.slice(0, 40));
    setNotPile(ALL_VALUES.slice(40));
    setStage(STAGES.halftime);
  }
  function skipToTopTen() {
    const yes = ALL_VALUES.slice(0, 20);
    setHavePile(yes);
    setHalfSelections(yes);
    setStage(STAGES.topTenIntro);
  }
  function skipToRanking() {
    const top = ALL_VALUES.slice(0, 10);
    setHavePile(ALL_VALUES.slice(0, 20));
    setHalfSelections(ALL_VALUES.slice(0, 20));
    setTopTenSelections(top);
    setOrderedTopTen(top);
    setStage(STAGES.rank);
  }

  // ── SHARED STYLES ─────────────────────────────────────────────────────────
  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 7,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  };

  const hintBox = {
    border: `1px solid ${C.tealBorder}`,
    background: C.tealBg,
    borderRadius: 18,
    padding: "18px 22px",
    color: C.textSecondary,
    lineHeight: 1.8,
    fontSize: 15,
  };

  const counterRow = {
    marginTop: 14,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 14,
    padding: "12px 18px",
    color: C.textSecondary,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    fontSize: 14,
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ maxWidth: 1180, width: "100%", margin: "0 auto" }}>

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 30, flexWrap: "wrap" }}>
          <div>
            {/* Secret tap target — 5 taps toggles developer mode */}
            <button
              type="button"
              onClick={handleSecretTap}
              style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer", letterSpacing: "0.24em", textTransform: "uppercase", fontSize: 11, color: C.teal, fontWeight: 600, fontFamily: "inherit" }}
            >
              Core Values Exercise
            </button>
            <h1 style={{ margin: "6px 0 0", fontSize: 30, lineHeight: 1.15, color: C.textPrimary, fontWeight: 700 }}>
              Who are you, really?
            </h1>
            {counselorMode && (
              <div style={{ marginTop: 6, color: C.gold, fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>
                Developer mode on
              </div>
            )}
          </div>
          {stage !== STAGES.welcome && <Btn ghost onClick={resetAll}>Start over</Btn>}
        </div>

        {/* ════════════════ WELCOME ════════════════════════════════════════════ */}
        {stage === STAGES.welcome && (
          <StageCard wide>
            <div style={{ textAlign: "center", padding: "14px 0 40px" }}>
              <h2 style={{ margin: "0 0 18px", fontSize: 42, fontWeight: 700, lineHeight: 1.15, color: C.textPrimary }}>
                Know what you stand for.
              </h2>
              <p style={{ margin: "0 auto", maxWidth: 520, fontSize: 17, lineHeight: 1.9, color: C.textSecondary }}>
                Most people have a rough sense of what they value.
                Fewer have ever stopped to look at it directly.
                This exercise helps you close that gap.
              </p>
            </div>

            <div className="cv-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 36 }}>
              {[
                { label: "Not goals.", body: "Goals are things you reach. Values are things you live by — quietly, constantly, whether you're paying attention or not." },
                { label: "Not rules.", body: "Values aren't instructions handed to you from outside. They're a description of what's already true about who you are." },
                { label: "Yours alone.", body: "No one builds this list for you. The choices you make here — and the order you place them in — come entirely from you." },
              ].map(({ label, body }) => (
                <div key={label} style={{ border: `1px solid ${C.cardBorder}`, background: "rgba(255,255,255,0.025)", borderRadius: 22, padding: "24px 22px" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: 10 }}>{label}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.85, color: C.textSecondary }}>{body}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <Btn onClick={() => setStage(STAGES.intro)} style={{ padding: "15px 40px", fontSize: 16 }}>
                I'm ready →
              </Btn>
            </div>
          </StageCard>
        )}

        {/* ════════════════ INTRO ══════════════════════════════════════════════ */}
        {stage === STAGES.intro && (
          <StageCard>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Before we begin</div>
            <div style={{ color: C.textSecondary, fontSize: 16, marginBottom: 24, lineHeight: 1.75 }}>
              Enter your name, then begin the exercise.
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Your name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type your name" />
            </div>


            <div style={{ ...hintBox, marginTop: 22 }}>
              Go one card at a time — sort each value into{" "}
              <strong style={{ color: C.textPrimary }}>this feels like me</strong> or{" "}
              <strong style={{ color: C.textPrimary }}>not so much</strong>.
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
              <Btn disabled={!canStart} onClick={() => setStage(STAGES.sort)}>
                Begin the exercise
              </Btn>
              {counselorMode && (
                <>
                  <Btn ghost onClick={skipToHalf}>Skip → half</Btn>
                  <Btn ghost onClick={skipToTopTen}>Skip → top 10</Btn>
                  <Btn ghost onClick={skipToRanking}>Skip → ranking</Btn>
                </>
              )}
            </div>
          </StageCard>
        )}

        {/* ════════════════ SORT ═══════════════════════════════════════════════ */}
        {stage === STAGES.sort && (
          <>
            <StageCard>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, color: C.textSecondary, fontSize: 14 }}>
                <span>Card {sortIndex + 1} of {deck.length}</span>
                <span style={{ color: C.gold, fontWeight: 600 }}>{sortProgress}%</span>
              </div>
              <ProgressBar value={sortProgress} />
            </StageCard>

            <div style={{ marginTop: 14 }}>
            <StageCard>
              <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center", marginBottom: 20, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Read the word · Choose a pile
              </div>
              <div style={{
                borderRadius: 26,
                border: `1px solid ${C.cardBorder}`,
                background: "radial-gradient(ellipse at center, rgba(93,212,184,0.07) 0%, transparent 72%)",
                padding: "72px 24px",
                textAlign: "center",
                fontSize: 46,
                fontWeight: 700,
                minHeight: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                letterSpacing: "-0.015em",
                color: C.textPrimary,
              }}>
                {currentValue}
              </div>
              <div className="cv-grid cv-two" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 22 }}>
                <Btn onClick={() => choosePile("have")} style={{ height: 56 }}>This feels like me</Btn>
                <Btn ghost onClick={() => choosePile("not")} style={{ height: 56 }}>Not so much</Btn>
              </div>
            </StageCard>
            </div>
          </>
        )}

        {/* ════════════════ HALFTIME — fade-in ═════════════════════════════════ */}
        {stage === STAGES.halftime && (
          <StageCard glow>
            <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 18 }}>
              <FadeInWords text="You made it." msPerWord={140} />
            </div>
            <div style={{ color: C.textSecondary, fontSize: 18, lineHeight: 1.9, marginBottom: 28 }}>
              <FadeInWords
                text={`You just went through all ${deck.length} values and kept ${havePile.length} that felt like you. Look at that list. Each one of those was a real choice — and you made it.`}
                msPerWord={78}
              />
            </div>
            <Delayed ms={3600}>
              <div style={{ ...hintBox, marginBottom: 26 }}>
                <FadeInWords
                  text={`One catch. We're going to ask you to let some of them go. From everything you just chose, keep only half — the ${halfTarget} words that feel the strongest. The ones you'd fight to keep.`}
                  msPerWord={62}
                />
              </div>
              <Btn onClick={() => setStage(STAGES.narrowHalf)}>Alright — let's do it</Btn>
            </Delayed>
          </StageCard>
        )}

        {/* ════════════════ NARROW HALF ════════════════════════════════════════ */}
        {stage === STAGES.narrowHalf && (
          <StageCard wide>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Choose your strongest half</div>
            <div style={{ color: C.textSecondary, fontSize: 15, marginBottom: 18 }}>
              Select <strong style={{ color: C.gold }}>{halfTarget}</strong> values from your pile of {havePile.length}.
            </div>
            <div className="cv-wrap">
              {havePile.map((v) => (
                <Pill key={v} label={v} active={halfSelections.includes(v)} onClick={() => toggleHalf(v)} />
              ))}
            </div>
            <div style={counterRow}>
              <span><strong style={{ color: C.teal }}>{halfSelections.length}</strong> selected</span>
              <span><strong style={{ color: C.gold }}>{Math.max(0, halfTarget - halfSelections.length)}</strong> remaining</span>
            </div>
            <div style={{ marginTop: 22 }}>
              <Btn disabled={halfSelections.length !== halfTarget} onClick={() => setStage(STAGES.topTenIntro)}>
                Keep going
              </Btn>
            </div>
          </StageCard>
        )}

        {/* ════════════════ TOP TEN INTRO — fade-in ════════════════════════════ */}
        {stage === STAGES.topTenIntro && (
          <StageCard glow>
            <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 18 }}>
              <FadeInWords text="Look at what held on." msPerWord={140} />
            </div>
            <div style={{ color: C.textSecondary, fontSize: 18, lineHeight: 1.9, marginBottom: 28 }}>
              <FadeInWords
                text="You made real choices back there. The words that didn't make the cut — you let them go. These ones survived. They meant more."
                msPerWord={82}
              />
            </div>
            <Delayed ms={3200}>
              <div style={{ ...hintBox, marginBottom: 26 }}>
                <FadeInWords
                  text="We're going to ask you one more thing. From these, we need your top ten — the ten that feel most central to who you are."
                  msPerWord={62}
                />
              </div>
              <Btn onClick={() => setStage(STAGES.topTen)}>I can do that</Btn>
            </Delayed>
          </StageCard>
        )}

        {/* ════════════════ TOP TEN ════════════════════════════════════════════ */}
        {stage === STAGES.topTen && (
          <StageCard wide>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Select your top 10</div>
            <div style={{ color: C.textSecondary, fontSize: 15, marginBottom: 18 }}>
              Pick exactly 10 from the group you just kept.
            </div>
            <div className="cv-wrap">
              {halfSelections.map((v) => (
                <Pill key={v} label={v} active={topTenSelections.includes(v)} onClick={() => toggleTopTen(v)} />
              ))}
            </div>
            <div style={counterRow}>
              <span><strong style={{ color: C.teal }}>{topTenSelections.length}</strong> selected</span>
              <span><strong style={{ color: C.gold }}>{Math.max(0, 10 - topTenSelections.length)}</strong> remaining</span>
            </div>
            <div style={{ marginTop: 22 }}>
              <Btn
                disabled={topTenSelections.length !== 10}
                onClick={() => { setOrderedTopTen(topTenSelections); setStage(STAGES.rankIntro); }}
              >
                Continue
              </Btn>
            </div>
          </StageCard>
        )}

        {/* ════════════════ RANK INTRO — fade-in ═══════════════════════════════ */}
        {stage === STAGES.rankIntro && (
          <StageCard glow>
            <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 18 }}>
              <FadeInWords text="You found your ten." msPerWord={140} />
            </div>
            <div style={{ color: C.textSecondary, fontSize: 18, lineHeight: 1.9, marginBottom: 28 }}>
              <FadeInWords
                text="These are not ten random words. You went through all of those options and worked your way down to these. Every one of them earned its place."
                msPerWord={82}
              />
            </div>
            <Delayed ms={3200}>
              <div style={{ ...hintBox, marginBottom: 26 }}>
                <FadeInWords
                  text="Last thing. We need you to put them in order. Number one at the top — the value that, when life gets hard, you come back to first."
                  msPerWord={62}
                />
              </div>
              <Btn onClick={() => setStage(STAGES.rank)}>Put them in order</Btn>
            </Delayed>
          </StageCard>
        )}

        {/* ════════════════ RANK ═══════════════════════════════════════════════ */}
        {stage === STAGES.rank && (
          <StageCard>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Put your top 10 in order</div>
            <div style={{ color: C.textSecondary, fontSize: 14, marginBottom: 24 }}>
              Hold and drag any card to reorder. #1 is your most important value.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {displayRankOrder.map((value, idx) => {
                const isDragging = rankDragValue === value;
                const isFirst = idx === 0;
                return (
                  <div
                    key={value}
                    data-rank-card={value}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      startRankDrag(value);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      border: isDragging
                        ? `1px solid ${C.teal}`
                        : isFirst
                        ? `1px solid ${C.goldBorder}`
                        : `1px solid ${C.cardBorder}`,
                      background: isDragging
                        ? "rgba(93,212,184,0.12)"
                        : isFirst
                        ? C.goldBg
                        : "rgba(255,255,255,0.03)",
                      borderRadius: 20,
                      padding: "14px 18px",
                      cursor: isDragging ? "grabbing" : "grab",
                      userSelect: "none",
                      touchAction: "none",
                      transform: isDragging ? "scale(1.025)" : "scale(1)",
                      boxShadow: isDragging
                        ? `0 20px 48px rgba(0,0,0,0.6), 0 0 24px rgba(93,212,184,0.18)`
                        : "none",
                      zIndex: isDragging ? 10 : 1,
                      position: "relative",
                      transition: rankDragValue
                        ? "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.1s, background 0.1s"
                        : "all 0.22s ease",
                    }}
                  >
                    {/* Number badge */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                      background: isFirst ? "rgba(212,168,71,0.18)" : isDragging ? "rgba(93,212,184,0.2)" : "rgba(255,255,255,0.06)",
                      border: isFirst ? `1px solid rgba(212,168,71,0.4)` : isDragging ? `1px solid rgba(93,212,184,0.4)` : "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 15,
                      color: isFirst ? C.gold : isDragging ? C.teal : C.textMuted,
                    }}>
                      {idx + 1}
                    </div>

                    {/* Drag handle */}
                    <div style={{ fontSize: 18, color: isDragging ? C.teal : "rgba(255,255,255,0.18)", letterSpacing: "1px", flexShrink: 0 }}>⠿</div>

                    {/* Value name */}
                    <div style={{ flex: 1, fontSize: 17, fontWeight: 600, color: isFirst ? C.gold : C.textPrimary }}>
                      {value}
                    </div>

                    {isFirst && !rankDragValue && (
                      <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", flexShrink: 0 }}>
                        Top value
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 26 }}>
              <Btn onClick={() => setStage(STAGES.narrativeIntro)}>See my final reflection</Btn>
            </div>
          </StageCard>
        )}

        {/* ════════════════ NARRATIVE INTRO — fade-in (the big one) ════════════ */}
        {stage === STAGES.narrativeIntro && (
          <StageCard glow>
            <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 18 }}>
              <FadeInWords text="Pause here." msPerWord={160} />
            </div>
            <div style={{ color: C.textSecondary, fontSize: 16, marginBottom: 22 }}>
              <FadeInWords
                text="Before you read your final statement, take one quiet moment."
                msPerWord={95}
              />
            </div>
            <div style={{ ...hintBox, fontSize: 17, lineHeight: 1.95 }}>
              <FadeInWords text={processReflection} msPerWord={55} />
            </div>
            <div style={{ marginTop: 26, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              {generating ? (
                <DotLoader />
              ) : (
                <Btn onClick={() => setStage(STAGES.narrative)}>Reveal my statement</Btn>
              )}
              {genError && (
                <span style={{ fontSize: 12, color: "#f87171", lineHeight: 1.4 }}>
                  {genError} — using template instead.
                </span>
              )}
            </div>
          </StageCard>
        )}

        {/* ════════════════ NARRATIVE ══════════════════════════════════════════ */}
        {stage === STAGES.narrative && (
          <StageCard>
            {/* Name header */}
            <div style={{ background: C.goldBg, border: `1px solid ${C.goldBorder}`, borderRadius: 22, padding: "22px 28px", marginBottom: 26 }}>
              <h2 style={{ margin: 0, fontSize: 28, color: C.textPrimary, fontWeight: 700 }}>
                <FadeInWords text={`My name is ${name}.`} msPerWord={140} />
              </h2>
            </div>

            {/* Read-aloud nudge */}
            <div style={{ ...hintBox, marginBottom: 26, fontSize: 14 }}>
              Read this out loud slowly — like you are telling someone who you are and what you stand for.
            </div>

            {/* AI narrative — fades in word by word */}
            <div style={{ fontSize: 18, lineHeight: 1.95, marginBottom: 34, color: C.textPrimary }}>
              <FadeInWords text={aiNarrative} msPerWord={50} />
            </div>

            {/* Chips */}
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: C.teal, marginBottom: 12, fontWeight: 600 }}>
              Final Reflection
            </div>
            <div className="cv-wrap" style={{ marginBottom: 28 }}>
              {orderedTopTen.map((v, i) => (
                <div key={v} style={{ border: `1px solid ${C.goldBorder}`, background: C.goldBg, borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 600, color: C.gold }}>
                  #{i + 1} {v}
                </div>
              ))}
            </div>

            {/* Two-column summary */}
            <div className="cv-grid cv-two" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 26 }}>
              <div style={{ border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: 20, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                  Ranked values
                </div>
                <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.95, color: C.textSecondary, fontSize: 14 }}>
                  {orderedTopTen.map((v, i) => <li key={v}>{i + 1}. {v}</li>)}
                </ol>
              </div>
              <div style={{ border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: 20, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                  Prompt for discussion
                </div>
                <div style={{ color: C.textSecondary, lineHeight: 1.8, fontSize: 14 }}>
                  Which value felt easiest to choose? Which one surprised you? Which one do you most want your daily actions to reflect more clearly?
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Btn ghost onClick={() => setStage(STAGES.rank)}>Back to ranking</Btn>
              <Btn ghost onClick={() => downloadPdfLikeHtml({ name, orderedTopTen, narrative: aiNarrative, processReflection })}>
                Download PDF
              </Btn>
              <Btn onClick={resetAll}>Start new session</Btn>
            </div>
          </StageCard>
        )}

      </div>
    </div>
  );
}
