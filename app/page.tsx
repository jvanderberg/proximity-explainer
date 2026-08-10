"use client";

import { memo, useState } from "react";
import { Scrollama, Step } from "react-scrollama";
import { D } from "./generated/data";

type StoryStep = { title: string; body: string; link?: { href: string; label: string } };

const PAPER_URL = "https://jvanderberg.github.io/op-mf-proximity/outputs/paper.html";
const MAP_URL = "https://jvanderberg.github.io/op-mf-proximity/outputs/map.html";
const REPO_URL = "https://github.com/jvanderberg/op-mf-proximity";

const pctWithin800 = Math.round(((D.nHomes - D.anyDesc[4].n) / D.nHomes) * 100);
const fmtPct = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)}%`;
const fmtT = (t: number) => `t = ${t < 0 ? "−" : ""}${Math.abs(t).toFixed(1)}`;

function StoryText({ steps, active, onStepEnter }: { steps: StoryStep[]; active: number; onStepEnter: (index: number) => void }) {
  return (
    <div className="story-copy">
      <Scrollama<number> offset={0.45} onStepEnter={({ data }) => onStepEnter(data)}>
        {steps.map((step, index) => (
          <Step data={index} key={step.title}>
            <section className={`story-step ${active === index ? "is-active" : ""}`} data-step={index}>
              <h2>{step.title}</h2>
              <p>{step.body}</p>
              {step.link && <a className="step-link" href={step.link.href} target="_blank" rel="noreferrer">{step.link.label} ↗</a>}
            </section>
          </Step>
        ))}
      </Scrollama>
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
    title: "“An apartment building next door will hurt my property value.”",
    body: "It comes up at every zoning hearing, and it's stated as settled fact. Oak Park's own data lets us check whether it's true.",
  },
  {
    title: "It’s already next door.",
    body: `Oak Park has ${D.nBuildings.toLocaleString()} multi-family buildings: 2-flats, courtyard apartments, condo buildings, townhomes. They stand on the same blocks as its houses, most of them for a century now. Each dot is one of them, plotted from the Cook County Assessor's records.`,
  },
  {
    title: "Nine out of ten houses sit within 800 feet of one.",
    body: `All ${D.nHomes.toLocaleString()} single-family homes in the village sit at some measurable distance from a multi-family building. If proximity really dragged values down, the pattern would be written all over this map. With the ${D.year} assessment of every property, we can go looking for it.`,
  },
];

function MapStory() {
  const [active, setActive] = useState(0);
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
      <StoryText steps={mapSteps} active={active} onStepEnter={setActive} />
    </section>
  );
}

/* ---------- Chapter 2: corridor vs embedded, on the map ---------- */

const corridorSteps: StoryStep[] = [
  {
    title: "Multi-family clusters on busy streets.",
    body: `Color each building by its location and the red dots trace the arterials: Harlem, North Avenue, Madison, Roosevelt, Austin. A corridor building fronts a named arterial, sits on a corner within 150 feet of one, or stands within 300 feet of commercial property. That's ${D.nCorridor.toLocaleString()} of the ${D.nBuildings.toLocaleString()}.`,
  },
  {
    title: "Busy streets discount houses all by themselves.",
    body: `We measured this directly, with no multi-family terms in the model at all: houses within 100 feet of an arterial are assessed ${fmtPct(D.arterial[0].pct)} against similar houses on quiet blocks, apartment or no apartment. Leave that out and the street's discount gets pinned on whatever happens to be built along it. So corridor buildings are set aside and estimated separately.`,
  },
  {
    title: `That leaves ${D.nEmbedded} buildings, mid-block among houses.`,
    body: "The blue dots are embedded: multi-family on quiet residential streets, away from the arterials and the commercial strips. This is exactly the kind of building zoning reform would allow more of. The question is whether these discount their neighbors.",
  },
];

function CorridorStory() {
  const [active, setActive] = useState(0);
  return (
    <section className="scroll-story corridor-story">
      <div className="story-stage">
        <div className={`map-frame cscene-${active}`}>
          <div className="map-heading">
            <span>SAME MAP · COLORED BY LOCATION</span>
            <strong>{active === 0 ? "Corridor vs. embedded" : active === 1 ? "The street has its own effect" : `The embedded ${D.nEmbedded}`}</strong>
          </div>
          <VillageSVG />
          <div className="map-legend">
            <span className="key cor-key"><i />CORRIDOR · {D.nCorridor.toLocaleString()}</span>
            <span className="key emb-key"><i />EMBEDDED · {D.nEmbedded.toLocaleString()}</span>
          </div>
        </div>
        <Counter active={active} total={corridorSteps.length} />
      </div>
      <StoryText steps={corridorSteps} active={active} onStepEnter={setActive} />
    </section>
  );
}

/* ---------- Chapter 4: the whole-village result, embedded only ---------- */

function VillageChart() {
  const W = 560, H = 350, PL = 18, zero = 240, scale = 56;
  const bw = (W - PL * 2) / 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Value effect of embedded multi-family by distance band, whole-village model: plus 1.2, plus 0.9, plus 1.3, and plus 1.4 percent, all statistically zero.">
      <line className="zero" x1={PL} y1={zero} x2={W - PL} y2={zero} />
      {D.split.embedded.map((d, i) => {
        const bh = Math.abs(d.pct) * scale;
        const x = PL + i * bw + 16;
        const w = bw - 32;
        return (
          <g key={d.band}>
            <rect className="bar pos" x={x} y={zero - bh} width={w} height={bh} rx={3} />
            <text className="val" x={x + w / 2} y={zero - bh - 12} textAnchor="middle">{fmtPct(d.pct)}</text>
            <text className="tstat" x={x + w / 2} y={zero - bh - 30} textAnchor="middle">{fmtT(d.t)}</text>
            <text className="cat" x={x + w / 2} y={zero + 22} textAnchor="middle">{d.band}</text>
          </g>
        );
      })}
      <text className="axis-title" x={W / 2} y={H - 14} textAnchor="middle">VALUE VS. SIMILAR HOUSES 800+ FT FROM ANY MULTI-FAMILY · FULL CONTROLS</text>
    </svg>
  );
}

function VillageBand() {
  return (
    <section className="village-band">
      <div className="village-copy">
        <h2>Zero at every distance, village-wide too.</h2>
        <p>
          {`The ring result isn't a quirk of the design. Compare all ${D.nHomes.toLocaleString()} houses at once, with full controls, and distance to embedded multi-family still doesn't matter: ${fmtPct(D.split.embedded[0].pct)} at 0–100 feet, statistically zero at every distance. It stayed zero under every alternative classification and check an independent adversarial audit of the pipeline demanded.`}
        </p>
      </div>
      <div className="band-card">
        <div className="card-heading">
          <span>WHOLE-VILLAGE MODEL · EMBEDDED BUILDINGS</span>
          <strong>Flat everywhere</strong>
        </div>
        <VillageChart />
      </div>
    </section>
  );
}

/* ---------- Chapter 5: the ring design ---------- */

const ringSteps: StoryStep[] = [
  {
    title: "Compare houses around the same building.",
    body: "Even within a neighborhood, blocks differ in ways no model fully captures. So the main analysis uses a stricter design: draw rings around each embedded building and compare only the houses that share it.",
    link: { href: PAPER_URL + "#ring", label: "The design, in the paper" },
  },
  {
    title: "Each building becomes its own experiment.",
    body: "Houses within 100 feet of the building are compared to houses 400–800 feet from that same building: same micro-market, same schools, same street grid. Anything shared by the whole cluster cancels out. Only the nearness itself remains.",
  },
  {
    title: `${D.ring.embedded.buildings} buildings, ${D.ring.embedded.n.toLocaleString()} houses.`,
    body: `Run that comparison simultaneously around every embedded building with houses in its rings, with the full set of house controls on top. ${D.ring.embedded.comparisons.groups_with_ref} of the ${D.ring.embedded.comparisons.n_groups} buildings have houses out in the reference band; those anchor the estimate. If living beside a 2-flat or a small apartment building costs you anything, this is where it shows up. That's the whole method. Now the results.`,
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
  const [active, setActive] = useState(0);
  return (
    <section className="scroll-story ring-story">
      <div className="story-stage">
        <div className={`stage-card ring-card rscene-${active}`}>
          <div className="card-heading ring-heading">
            <strong>
              {active === 0
                ? "Rings at 100, 200, 400 and 800 feet around one embedded building"
                : active === 1
                  ? "Houses inside 100 feet, measured against houses 400–800 feet from the same building"
                  : `The same comparison, run around all ${D.ring.embedded.buildings} embedded buildings at once`}
            </strong>
          </div>
          <RingDiagram active={active} />
        </div>
        <Counter active={active} total={ringSteps.length} />
      </div>
      <StoryText steps={ringSteps} active={active} onStepEnter={setActive} />
    </section>
  );
}

/* ---------- The rest: dose, robustness, literature, finale ---------- */

function DoseBand() {
  return (
    <section className="dose-band">
      <div className="dose-copy">
        <h2>Having several nearby makes no difference either.</h2>
        <p>
          Count the embedded multi-family buildings within 400 feet of each house. Houses with
          one, two, or three or more are worth the same as houses with none. Every difference
          is a rounding error.
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
        <h2>Next to an embedded building: nothing.</h2>
        <p>
          {`Houses within 100 feet of an embedded multi-family building are valued ${fmtPct(D.ring.embedded.bands[0].pct)} relative to houses 400–800 feet from the same building. Statistically zero. Restricted to the ${D.ring.embedded.comparisons.groups_with_ref} buildings with houses in both bands: ${fmtPct(D.ring.restricted0.pct)}. In ${D.sales.n.toLocaleString()} recorded sale prices: ${fmtPct(D.sales.emb0)}, zero again with wider error bars. And the design isn't blind: run it on the corridor buildings we set aside and it finds their ${fmtPct(D.ring.corridor.bands[0].pct)} street discount. When there's a real effect, this method sees it. Next to embedded buildings, there is nothing to see.`}
        </p>
      </div>
    </section>
  );
}

function LiteratureBand() {
  return (
    <section className="lit-band">
      <div className="lit-intro">
        <h2>The research keeps finding the same thing.</h2>
        <p>
          This is one suburb, measured once. But studies that look directly at what multi-family
          housing does to the single-family homes around it keep reaching the same conclusion:
          nothing.
        </p>
      </div>
      <div className="lit-cards">
        <article>
          <b>SUBURBAN BOSTON · 2005</b>
          <h3>Large apartment developments left nearby house values untouched.</h3>
          <p>MIT&rsquo;s Center for Real Estate tracked 36,000 sales around seven large, deliberately controversial mixed-income rental developments. House prices next to them simply tracked the surrounding market.</p>
          <a href="https://news.mit.edu/2005/housing" target="_blank" rel="noreferrer">Pollakowski, Ritchay &amp; Weinrobe ↗</a>
        </article>
        <article>
          <b>MINNEAPOLIS · 2021</b>
          <h3>Legalizing multi-family didn&rsquo;t dent house prices.</h3>
          <p>After the 2040 Plan allowed triplexes on every lot, Kuhlmann found single-family parcels gaining multi-family rights rose modestly in value. They did not fall.</p>
          <a href="https://www.tandfonline.com/doi/full/10.1080/01944363.2020.1852101" target="_blank" rel="noreferrer">J. of the American Planning Assoc. ↗</a>
        </article>
      </div>
      <p className="lit-method">
        The ring method itself comes from Linden &amp; Rockoff (2008), who used it to measure
        how home values respond to a genuinely unwelcome neighbor. The design finds real effects
        when they exist. That&rsquo;s the point.
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
          <h1>Do apartments hurt home values? Oak Park checked.</h1>
          <p className="dek">
            {`Every house, every apartment building, every 2-flat in the village, measured against each other in the county assessor's ${D.year} valuation. Here's what the data actually says about living next door to multi-family housing.`}
          </p>
          <p className="byline">By Josh VanderBerg <span>•</span> Data from the Cook County Assessor</p>
          <a className="scroll-cue" href="#story">SCROLL TO BEGIN <b>↓</b></a>
        </div>
      </section>

      <section className="opening" id="story">
        <div className="intro-card">
          <p>Ask around and you&rsquo;ll hear it as settled fact: apartments drag down the value of the houses beside them.</p>
          <p>It&rsquo;s a testable claim. And Oak Park, dense and full of hundred-year-old multi-family housing, is a good place to test it.</p>
        </div>
      </section>

      <MapStory />

      <section className="bridge method-bridge">
        <div>
          <h2>Compare like with like.</h2>
          <p>
            A house&rsquo;s value is mostly its size, lot, age, and condition. So every comparison from
            here on holds those fixed: building and lot square footage, age, bedrooms, bathrooms,
            fireplaces, central air, garage, basement, construction quality, repair state, and
            neighborhood. What&rsquo;s left is location. Does distance to multi-family move the number?
            There&rsquo;s a problem with measuring that naively, and it&rsquo;s visible on the map.
          </p>
        </div>
      </section>

      <CorridorStory />

      <section className="bridge ring-bridge">
        <div>
          <h2>So what actually happens right next door?</h2>
        </div>
      </section>

      <RingStory />

      <VerdictBand />

      <VillageBand />

      <DoseBand />

      <LiteratureBand />

      <section className="finale">
        <div>
          <span className="finale-quote">&ldquo;An apartment building next door will hurt my property value.&rdquo;</span>
          <h2>No, it won&rsquo;t.</h2>
          <p>
            Houses beside Oak Park&rsquo;s mid-block 2-flats, condo buildings, and townhomes are worth
            the same as identical houses two blocks away. At every distance, in every model, no matter
            how many are nearby. The buildings zoning reform would allow on residential streets are
            precisely the kind that show no effect at all.
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
          Every number on this page is generated by the open pipeline; nothing is hand-typed.
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
