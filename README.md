# proximity-explainer

**[Read the live explainer →](https://apartments.yesoakpark.org/)**

A scroll-driven visual explainer answering one question: **do apartments hurt
the value of the houses next door?** It walks through the data and methodology
of [op-mf-proximity](https://github.com/jvanderberg/op-mf-proximity), which
tests the claim against the Cook County Assessor's 2026 valuation of every
property in Oak Park, Illinois.

The story, in scroll order:

1. The fear: "an apartment next door will tank my home's value."
2. The reveal: Oak Park already has 2,332 multi-family buildings woven among
   its 9,596 houses — mapped from real coordinates.
3. The naive answer: houses near multi-family *are* worth ~5% less, even
   with controls. The fear looks confirmed.
4. The confounder: multi-family clusters on busy arterial streets, and busy
   streets discount houses all by themselves. Separate corridor buildings
   from embedded (mid-block) ones.
5. The split: the whole discount belongs to the corridor. Embedded is zero.
6. The ring method (Linden & Rockoff): compare houses only to other houses
   around the *same* building. Still zero (+0.9%, t = 1.6).
7. Dose-response and robustness checks: still zero.
8. The literature: quasi-experimental studies elsewhere find the same thing.

## Data

Every number and every map point is generated from the pipeline outputs —
nothing is hand-typed. `scripts/build-data.mjs` reads the sibling checkout of
`op-mf-proximity` (`../op-mf-proximity` by default) and writes
`app/generated/data.ts`, which is committed so the site builds standalone:

```bash
npm run build:data   # regenerate after re-running the pipeline
```

## Development

Next.js static export. Node 22.13+.

```bash
npm install
npm run dev
```

`npm test` builds the site and checks that the key machine-generated numbers
render. `npm run build:pages` writes the static site to `out/`.

## Publishing

Pushes to `main` build and deploy via GitHub Pages
([workflow](.github/workflows/pages.yml)).
