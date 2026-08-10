"use client";

import { memo, useEffect, useRef, useState } from "react";
import { D } from "./generated/data";

type StoryStep = { kicker: string; title: string; body: string; link?: { href: string; label: string } };

const PAPER_URL = "https://jvanderberg.github.io/op-mf-proximity/outputs/paper.html";
const MAP_URL = "https://jvanderberg.github.io/op-mf-proximity/outputs/map.html";
const REPO_URL = "https://github.com/jvanderberg/op-mf-proximity";

const pctWithin800 = Math.round(((D.nHomes - D.anyDesc[4].n) / D.nHomes) * 100);
const fmtPct = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)}%`;
const fmtT = (t: number) => `t = ${t < 0 ? "−" : ""}${Math.abs(t).toFixed(1)}`;

function useScrollSteps(count: number) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(Number((visible.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-32% 0px -46% 0px", threshold: [0, 0.25, 0.6, 1] },
    );
    refs.current.slice(0, count).forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [count]);

  return { active, refs };
}

function StoryText({ steps, active, refs }: { steps: StoryStep[]; active: number; refs: React.MutableRefObject<(HTMLElement | null)[]> }) {
  return (
    <div className="story-copy">
      {steps.map((step, index) => (
        <section
          className={`story-step ${active === index ? "is-active" : ""}`}
          data-step={index}
          ref={(node) => { refs.current[index] = node; }}
          key={step.title}
        >
          <span>{step.kicker}</span>
          <h2>{step.title}</h2>
          <p>{step.body}</p>
          {step.link && <a className="step-link" href={step.link.href} target="_blank" rel="noreferrer">{step.link.label} ↗</a>}
        </section>
      ))}
    </div>
  );
}

function Counter({ active, total }: { active: number; total: number }) {
  return <div className="chapter-count">0{active + 1} / 0{total}</div>;
}

/* ---------- The village map, rendered once from real coordinates ---------- */

const VillageSVG = memo(function VillageSVG() {
  const { w, h, boundaryPath, homesPath, buildings } = D.map;
  return (
    <svg className="village" viewBox={`0 0 ${w} ${h}`} role="img"
      aria-label={`Map of Oak Park showing ${D.nHomes.toLocaleString()} single-family homes and ${D.nBuildings.toLocaleString()} multi-family buildings, ${D.nCorridor.toLocaleString()} on corridors and ${D.nEmbedded.toLocaleString()} embedded mid-block.`}>
      <path className="boundary" d={boundaryPath} />
      <path className="homes" d={homesPath} />
      <g className="bdots">
        {buildings.map((b, i) => (
          <circle key={i} className={b[2] ? "cor" : "emb"} cx={b[0]} cy={b[1]} r={2.1} />
        ))}
      </g>
      <g className="street-labels" aria-hidden="true">
        <text x={w / 2} y={9} textAnchor="middle">NORTH AVE</text>
        <text x={w / 2} y={h - 3} textAnchor="middle">ROOSEVELT RD</text>
        <text x={7} y={h / 2} textAnchor="middle" transform={`rotate(-90 7 ${h / 2})`}>HARLEM AVE</text>
        <text x={w - 5} y={h / 2} textAnchor="middle" transform={`rotate(90 ${w - 5} ${h / 2})`}>AUSTIN BLVD</text>
      </g>
    </svg>
  );
});

/* ---------- Chapter 1: the fear, and the map reveal ---------- */

const mapSteps: StoryStep[] = [
  {
    kicker: "The fear",
    title: "“An apartment building next door will hurt my property value.”",
    body: "It comes up at every zoning hearing, stated with total confidence, as if it were a law of physics. Oak Park's own data lets us check whether it's true.",
  },
  {
    kicker: "The thing is",
    title: "It’s already next door.",
    body: `Oak Park has ${D.nBuildings.toLocaleString()} multi-family buildings — 2-flats, courtyard apartments, condo buildings, townhomes — standing on the same blocks as its houses, most of them for a century. Each dot is one of them, plotted from the Cook County Assessor's records.`,
  },
  {
    kicker: "A village-sized experiment",
    title: "Nine out of ten houses sit within 800 feet of one.",
    body: `All ${D.nHomes.toLocaleString()} single-family homes in the village sit at some measurable distance from a multi-family building. If proximity really dragged values down, the pattern would be written all over this map — and with the ${D.year} assessment of every property, we can go looking for it.`,
  },
];

function MapStory() {
  const { active, refs } = useScrollSteps(mapSteps.length);
  return (
    <section className="scroll-story map-story">
      <div className="story-stage">
        <div className={`map-frame mscene-${active}`}>
          <div className="map-heading">
            <span>OAK PARK, ILLINOIS · {D.year} ASSESSMENT</span>
            <strong>{active === 0 ? "Every single-family home" : active === 1 ? `Plus ${D.nBuildings.toLocaleString()} multi-family buildings` : "Everyone already lives together"}</strong>
          </div>
          <VillageSVG />
          <div className="map-callout mc-buildings"><strong>{D.nBuildings.toLocaleString()}</strong><span>MULTI-FAMILY BUILDINGS</span></div>
          <div className="map-callout mc-homes"><strong>{D.nHomes.toLocaleString()}</strong><span>SINGLE-FAMILY HOMES</span></div>
          <div className="map-callout mc-within"><strong>{pctWithin800}%</strong><span>OF HOUSES WITHIN 800 FT</span></div>
        </div>
        <Counter active={active} total={mapSteps.length} />
      </div>
      <StoryText steps={mapSteps} active={active} refs={refs} />
    </section>
  );
}

/* ---------- Chapter 2: corridor vs embedded, on the map ---------- */

const corridorSteps: StoryStep[] = [
  {
    kicker: "The method, continued",
    title: "Multi-family clusters on busy streets.",
    body: `Color each building by its location and the red dots trace the arterials — Harlem, North Avenue, Madison, Roosevelt, Austin. A corridor building fronts a named arterial, sits on a corner within 150 feet of one, or stands within 300 feet of commercial property. That's ${D.nCorridor.toLocaleString()} of the ${D.nBuildings.toLocaleString()}.`,
  },
  {
    kicker: "Why that matters",
    title: "Busy streets discount houses all by themselves.",
    body: "Houses near arterials and commercial strips run 3–6% below similar houses on quiet blocks — traffic, noise, curb cuts — apartment or no apartment. Leave that in and the street's discount gets pinned on whatever happens to be built along it. So corridor buildings are set aside, estimated separately from the question we care about.",
  },
  {
    kicker: "The clean test",
    title: `That leaves ${D.nEmbedded} buildings, mid-block among houses.`,
    body: "The blue dots are embedded: multi-family on quiet residential streets, away from the arterials and the commercial strips. This is exactly the kind of building zoning reform would allow more of. The question is whether these discount their neighbors.",
  },
];

function CorridorStory() {
  const { active, refs } = useScrollSteps(corridorSteps.length);
  return (
    <section className="scroll-story corridor-story">
      <div className="story-stage">
        <div className={`map-frame cscene-${active}`}>
          <div className="map-heading">
            <span>SAME MAP · COLORED BY LOCATION</span>
            <strong>{active === 0 ? "Corridor vs. embedded" : active === 1 ? "The street has its own effect" : "The embedded 965"}</strong>
          </div>
          <VillageSVG />
          <div className="map-legend">
            <span className="key cor-key"><i />CORRIDOR · {D.nCorridor.toLocaleString()}</span>
            <span className="key emb-key"><i />EMBEDDED · {D.nEmbedded.toLocaleString()}</span>
          </div>
        </div>
        <Counter active={active} total={corridorSteps.length} />
      </div>
      <StoryText steps={corridorSteps} active={active} refs={refs} />
    </section>
  );
}

/* ---------- Chapter 4: the split result ---------- */

const splitSteps: StoryStep[] = [
  {
    kicker: "The results, continued",
    title: "Zero at every distance, village-wide too.",
    body: `The ring result isn't a fluke of the design. In the whole-village model, houses near embedded multi-family show ${fmtPct(D.split.embedded[0].pct)} at 0–100 feet, ${fmtPct(D.split.embedded[1].pct)} at 100–200, ${fmtPct(D.split.embedded[2].pct)} at 200–400 — slightly positive, statistically indistinguishable from zero, never negative anywhere.`,
  },
  {
    kicker: "And the streets we set aside?",
    title: "The corridor discount is right where we left it.",
    body: `Estimated in the same model, houses near corridor buildings run ${fmtPct(D.split.corridor[0].pct)} up close, fading with distance — the busy street being priced, exactly as expected. The street carries a discount. The building doesn't.`,
  },
];

function SplitChart({ phase }: { phase: number }) {
  const W = 620, H = 480, PL = 40, PT = 66;
  const zero = PT + 120, scale = 34;
  const bw = (W - PL - 14) / 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Value effect by distance band: corridor buildings show minus 5.8 to minus 1.3 percent; embedded buildings show plus 0.9 to plus 1.4 percent, statistically zero.">
      <line className="zero" x1={PL - 26} y1={zero} x2={W - 14} y2={zero} />
      <text className="zero-label" x={W - 16} y={zero - 6} textAnchor="end">0</text>
      {D.split.corridor.map((d, i) => {
        const bh = Math.abs(d.pct) * scale;
        const x = PL + i * bw + 8;
        const w = (bw - 26) / 2;
        return (
          <g key={d.band} className="cor-bar">
            <rect className="bar neg" x={x} y={zero} width={w} height={bh} rx={3} />
            <text className="val" x={x + w / 2} y={zero + bh + 20} textAnchor="middle">{fmtPct(d.pct)}</text>
          </g>
        );
      })}
      {D.split.embedded.map((d, i) => {
        const bh = Math.abs(d.pct) * scale;
        const x = PL + i * bw + 8 + (bw - 26) / 2 + 4;
        const w = (bw - 26) / 2;
        return (
          <g key={d.band} className="emb-bar">
            <rect className="bar pos" x={x} y={zero - bh} width={w} height={bh} rx={3} />
            <text className="val" x={x + w / 2} y={zero - bh - 10} textAnchor="middle">{fmtPct(d.pct)}</text>
            <text className="tstat" x={x + w / 2} y={zero - bh - 26} textAnchor="middle">{fmtT(d.t)}</text>
          </g>
        );
      })}
      {D.split.corridor.map((d, i) => (
        <text key={d.band} className="cat" x={PL + i * bw + 8 + (bw - 26) / 2} y={H - 44} textAnchor="middle">{d.band}</text>
      ))}
      <text className="axis-title" x={W / 2} y={H - 12} textAnchor="middle">VALUE EFFECT VS. HOUSES 800+ FT AWAY · SAME MODEL, BOTH TYPES</text>
      <g className="chart-legend">
        <rect className="bar neg" x={PL - 26} y={PT - 40} width={14} height={14} rx={3} />
        <text className="cat" x={PL - 6} y={PT - 28}>CORRIDOR</text>
        <rect className="bar pos" x={PL + 110} y={PT - 40} width={14} height={14} rx={3} />
        <text className="cat" x={PL + 130} y={PT - 28}>EMBEDDED</text>
      </g>
      {phase >= 1 && <text className="annotation" x={W / 2} y={PT + 6} textAnchor="middle">the discount tracks the street, not the housing type</text>}
    </svg>
  );
}

function SplitStory() {
  const { active, refs } = useScrollSteps(splitSteps.length);
  return (
    <section className="scroll-story split-story">
      <div className="story-stage">
        <div className={`stage-card sscene-${active}`}>
          <div className="card-heading">
            <span>WHOLE-VILLAGE MODEL · BOTH TYPES ESTIMATED TOGETHER</span>
            <strong>{active === 0 ? "Embedded: flat everywhere" : "Corridor: the street being priced"}</strong>
          </div>
          <SplitChart phase={active} />
        </div>
        <Counter active={active} total={splitSteps.length} />
      </div>
      <StoryText steps={splitSteps} active={active} refs={refs} />
    </section>
  );
}

/* ---------- Chapter 5: the ring design ---------- */

const ringSteps: StoryStep[] = [
  {
    kicker: "The strongest test",
    title: "Compare houses around the same building.",
    body: "Even within a neighborhood, blocks differ in ways no model fully captures. So borrow the sharpest tool in the applied-economics kit: draw rings around each embedded building and compare only the houses that share it.",
    link: { href: PAPER_URL + "#ring", label: "The design, in the paper" },
  },
  {
    kicker: "Apples to apples",
    title: "Each building becomes its own experiment.",
    body: "Houses within 100 feet of the building are compared to houses 400–800 feet from that same building — same micro-market, same schools, same street grid. Anything shared by the whole cluster cancels out. Only the nearness itself remains.",
  },
  {
    kicker: "At scale",
    title: `${D.ring.embedded.buildings} buildings, ${D.ring.embedded.n.toLocaleString()} houses.`,
    body: "Run that comparison simultaneously around every embedded building with houses in its rings, with the full set of house controls on top. If living beside a 2-flat or a small apartment building costs you anything, this is where it shows up. That's the whole method — now the results.",
  },
];

// Deterministic scatter of houses around the ring diagram (no randomness at render).
// Band populations are chosen so each ring visibly holds houses, especially 0–100 ft.
const RING_BAND_SPECS = [
  { n: 10, rMin: 27, rMax: 39, band: 0 },
  { n: 20, rMin: 48, rMax: 79, band: 1 },
  { n: 42, rMin: 92, rMax: 160, band: 2 },
  { n: 76, rMin: 176, rMax: 322, band: 3 },
];
const ringHouses = RING_BAND_SPECS.flatMap(({ n, rMin, rMax, band }, s) =>
  Array.from({ length: n }, (_, i) => {
    const angle = (i + s * 0.37) * 2.39996;
    const jitter = Math.abs(Math.sin((i + 1) * 12.9898 * (s + 1)));
    const r = rMin + (rMax - rMin) * ((i / n + 0.31 * jitter) % 1);
    const x = 360 + r * Math.cos(angle);
    const y = 360 + r * Math.sin(angle) * 0.98;
    return { x: +x.toFixed(1), y: +y.toFixed(1), band };
  })
);

function RingDiagram({ active }: { active: number }) {
  const rings = [
    { r: 41, label: "100 ft" },
    { r: 83, label: "200 ft" },
    { r: 165, label: "400 ft" },
    { r: 330, label: "800 ft" },
  ];
  return (
    <svg viewBox="0 0 720 752" className={`ring-diagram rscene-${active}`} role="img"
      aria-label="Diagram of one embedded multi-family building with rings at 100, 200, 400 and 800 feet; houses inside the closest ring are compared with houses 400 to 800 feet away around the same building.">
      {rings.map((ring) => (
        <g key={ring.label}>
          <circle className="ring" cx={360} cy={360} r={ring.r} />
          <text className="ring-label" x={360 + 6} y={360 - ring.r + 16}>{ring.label}</text>
        </g>
      ))}
      <g className="ring-houses">
        {ringHouses.map((house, i) => (
          <rect key={i} className={`rh band-${house.band}`} x={house.x - 4} y={house.y - 4} width={8} height={8} rx={1.5} />
        ))}
      </g>
      <g className="mf-building">
        <rect x={338} y={334} width={44} height={52} rx={3} />
        <rect className="win" x={346} y={343} width={9} height={9} />
        <rect className="win" x={365} y={343} width={9} height={9} />
        <rect className="win" x={346} y={360} width={9} height={9} />
        <rect className="win" x={365} y={360} width={9} height={9} />
      </g>
      <g className="ring-key">
        <text className="rk near" x={360} y={722} textAnchor="middle">HOUSES WITHIN 100 FT</text>
        <text className="rk far" x={360} y={744} textAnchor="middle">VS. HOUSES 400–800 FT · SAME BUILDING</text>
      </g>
    </svg>
  );
}

function RingStory() {
  const { active, refs } = useScrollSteps(ringSteps.length);
  return (
    <section className="scroll-story ring-story">
      <div className="story-stage">
        <div className={`stage-card ring-card rscene-${active}`}>
          <div className="card-heading">
            <span>RING DESIGN · ONE FIXED EFFECT PER BUILDING</span>
            <strong>{active <= 1 ? "One building, four rings" : `× ${D.ring.embedded.buildings} embedded buildings`}</strong>
          </div>
          <RingDiagram active={active} />
        </div>
        <Counter active={active} total={ringSteps.length} />
      </div>
      <StoryText steps={ringSteps} active={active} refs={refs} />
    </section>
  );
}

/* ---------- The rest: dose, robustness, literature, finale ---------- */

function DoseBand() {
  return (
    <section className="dose-band">
      <div className="dose-copy">
        <span>WHAT ABOUT SEVERAL?</span>
        <h2>Three apartment buildings on the block move a house&rsquo;s value not at all.</h2>
        <p>
          Compare houses by how many embedded multi-family buildings stand within 400 feet —
          one, two, three or more — against houses with none nearby. Every difference is a
          rounding error.
        </p>
      </div>
      <div className="dose-tiles">
        {D.dose.map((d) => (
          <div className="dose-tile" key={d.label}>
            <span>{d.label.toUpperCase()} WITHIN 400 FT</span>
            <strong>{fmtPct(d.pct)}</strong>
            <em>{fmtT(d.t)} · zero</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function VerdictBand() {
  return (
    <section className="verdict-band">
      <div className="verdict-stat">
        {fmtPct(D.ring.embedded.bands[0].pct)}
        <em>{fmtT(D.ring.embedded.bands[0].t)}</em>
      </div>
      <div>
        <span>THE HEADLINE RESULT</span>
        <h2>Next to an embedded building: nothing.</h2>
        <p>
          {`Houses within 100 feet of an embedded multi-family building are valued ${fmtPct(D.ring.embedded.bands[0].pct)} relative to houses 400–800 feet from the same building — statistically zero. And the design isn't blind: run it on corridor buildings and it still finds ${fmtPct(D.ring.corridor.bands[0].pct)}. When there's a real effect, this method sees it. For embedded buildings, there is simply nothing to see.`}
        </p>
      </div>
    </section>
  );
}

function LiteratureBand() {
  return (
    <section className="lit-band">
      <div className="lit-intro">
        <span>OAK PARK ISN&rsquo;T SPECIAL</span>
        <h2>The research keeps finding the same thing.</h2>
        <p>
          This is one suburb, measured once. But quasi-experimental studies — the kind that watch
          what actually happens when multi-family arrives — reach the same conclusion in city
          after city: neutral-to-positive effects on nearby values.
        </p>
      </div>
      <div className="lit-cards">
        <article>
          <b>11 U.S. CITIES · 2023</b>
          <h3>New apartment buildings lowered nearby rents.</h3>
          <p>Asquith, Mast &amp; Reed tracked large new market-rate buildings in low-income areas: rents within 800 feet fell 5–7% relative to comparable blocks slightly farther away.</p>
          <a href="https://direct.mit.edu/rest/article/105/2/359/100977" target="_blank" rel="noreferrer">Review of Economics and Statistics ↗</a>
        </article>
        <article>
          <b>MINNEAPOLIS · 2021</b>
          <h3>Legalizing multi-family didn&rsquo;t dent house prices.</h3>
          <p>After the 2040 Plan allowed triplexes on every lot, Kuhlmann found single-family parcels gaining multi-family rights rose modestly in value — they did not fall.</p>
          <a href="https://www.tandfonline.com/doi/full/10.1080/01944363.2020.1852101" target="_blank" rel="noreferrer">J. of the American Planning Assoc. ↗</a>
        </article>
        <article>
          <b>AUCKLAND · 2023</b>
          <h3>Big upzoning, big building boom.</h3>
          <p>Greenaway-McGrevy &amp; Phillips showed Auckland&rsquo;s sweeping upzoning set off a durable construction surge — the supply response skeptics said would never come.</p>
          <a href="https://www.sciencedirect.com/science/article/pii/S0094119023000244" target="_blank" rel="noreferrer">Journal of Urban Economics ↗</a>
        </article>
      </div>
      <p className="lit-method">
        The ring method itself is borrowed from Linden &amp; Rockoff (2008), who used it to measure
        how home values respond to a genuinely unwelcome neighbor. The design finds real effects
        when they exist — that&rsquo;s the point.
      </p>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <header className="masthead"><a href="#top" className="brand">OAK PARK, EXPLAINED</a><span>HOME VALUES · {D.year} ASSESSMENT</span></header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">The proximity question</p>
          <h1>Do apartments hurt home values? Oak Park checked.</h1>
          <p className="dek">
            {`Every house, every apartment building, every 2-flat in the village — measured against each other in the county assessor's ${D.year} valuation. Here's what the data actually says about living next door to multi-family housing.`}
          </p>
          <p className="byline">By Josh VanderBerg <span>•</span> Data from the Cook County Assessor</p>
          <a className="scroll-cue" href="#story">SCROLL TO BEGIN <b>↓</b></a>
        </div>
      </section>

      <section className="opening" id="story">
        <div className="intro-card">
          <p>Ask around and you&rsquo;ll hear it as settled fact: apartments drag down the value of the houses beside them.</p>
          <p>It&rsquo;s a testable claim. And Oak Park — dense, walkable, and full of hundred-year-old multi-family housing — turns out to be the perfect place to test it.</p>
        </div>
      </section>

      <MapStory />

      <section className="bridge method-bridge">
        <div>
          <span>THE METHOD</span>
          <h2>Compare like with like.</h2>
          <p>
            A house&rsquo;s value is mostly its size, lot, age, and condition. So every comparison from
            here on holds those fixed — building and lot square footage, age, bedrooms, bathrooms,
            fireplaces, central air, garage, basement, construction quality, repair state, and
            neighborhood. What&rsquo;s left is location: does distance to multi-family move the number?
            One trap has to be dealt with first.
          </p>
        </div>
      </section>

      <CorridorStory />

      <section className="bridge ring-bridge">
        <div>
          <span>THE SHARPEST TOOL</span>
          <h2>Then shrink every comparison to a single block.</h2>
        </div>
      </section>

      <RingStory />

      <VerdictBand />

      <SplitStory />

      <DoseBand />

      <LiteratureBand />

      <section className="finale">
        <div>
          <span>THE LESSON</span>
          <h2>The discount is the traffic, not the tenants.</h2>
          <p>
            Houses beside Oak Park&rsquo;s mid-block 2-flats, condo buildings, and townhomes are worth
            the same as identical houses two blocks away. The one real discount in the data belongs to
            busy streets — and it&rsquo;s there with or without apartments. The buildings zoning reform
            would allow are precisely the kind that show no effect at all.
          </p>
          <p className="finale-caveat">
            One honest caveat: these are the assessor&rsquo;s modeled market values, not closing prices,
            and a snapshot rather than an experiment. The full paper spells out what that does and
            doesn&rsquo;t let us claim.
          </p>
          <div className="finale-cta">
            <a className="cta-button" href={PAPER_URL} target="_blank" rel="noreferrer">Read the paper <b>↗</b></a>
            <a className="cta-button ghost" href={MAP_URL} target="_blank" rel="noreferrer">Explore the map <b>↗</b></a>
            <a className="cta-button ghost" href={REPO_URL} target="_blank" rel="noreferrer">Run the code <b>↗</b></a>
          </div>
        </div>
      </section>

      <footer>
        <p>
          <strong>Method:</strong> Cook County Assessor {D.year} valuations, all {D.nHomes.toLocaleString()} detached
          single-family homes in Oak Park township. Hedonic models with full house controls; corridor/embedded
          classification from arterial frontage and commercial proximity; ring design after Linden &amp; Rockoff (2008).
          Every number on this page is generated by the open pipeline — nothing is hand-typed.
        </p>
        <div>
          <a href={REPO_URL} target="_blank" rel="noreferrer">Pipeline &amp; data</a>
          <a href={PAPER_URL} target="_blank" rel="noreferrer">Full paper</a>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
