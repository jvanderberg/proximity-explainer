import { EMBEDDED_APARTMENTS } from "../generated/character-collage";
import { CollageImage } from "./CollageImage";

const assessorImage = (pin: string) => `/apartment-images/${pin}.webp`;
const assessorPage = (pin: string) => `https://www.cookcountyassessoril.gov/pin/${pin}`;

export const metadata = {
  title: "The Character of Oak Park",
  description: "A collage of embedded apartment buildings woven into Oak Park's residential blocks.",
  openGraph: {
    title: "The Character of Oak Park",
    description: "Embedded apartment buildings are already part of Oak Park's residential fabric.",
    url: "/character/",
    images: ["/og.png"],
  },
};

function pinLabel(pin: string) {
  return `${pin.slice(0, 2)}-${pin.slice(2, 4)}-${pin.slice(4, 7)}-${pin.slice(7, 10)}-${pin.slice(10)}`;
}

export default function CharacterPage() {
  const heroImages = EMBEDDED_APARTMENTS.slice(0, 18);

  return (
    <main className="character-page">
      <section className="character-hero">
        <div className="character-hero-grid" aria-hidden="true">
          {heroImages.map((building) => (
            <CollageImage
              key={building.pin}
              src={assessorImage(building.pin)}
              alt=""
            />
          ))}
        </div>
        <div>
          <p className="character-kicker">Oak Park, Illinois</p>
          <h1>The character of Oak Park</h1>
          <p>
            These are embedded apartment buildings: two-flats and small apartment buildings on
            residential blocks, away from the arterials and commercial strips.
          </p>
        </div>
      </section>

      <section className="character-intro">
        <p>
          The point is visual before it is statistical. Oak Park already has this form everywhere:
          brick flats, courtyard buildings, frame two-flats, quiet entries, porches, cornices, and
          apartment doors sitting comfortably among houses.
        </p>
        <p>
          {EMBEDDED_APARTMENTS.length.toLocaleString()} embedded apartment parcels are shown here
          from the same assessor-derived dataset used in the proximity analysis.
        </p>
      </section>

      <section className="photo-collage" aria-label="Collage of embedded apartment buildings in Oak Park">
        {EMBEDDED_APARTMENTS.map((building) => (
          <a
            className={`collage-tile size-${building.size}`}
            href={assessorPage(building.pin)}
            key={building.pin}
            target="_blank"
            rel="noreferrer"
          >
            <CollageImage
              src={assessorImage(building.pin)}
              alt={`${building.address}, Oak Park`}
            />
            <i aria-hidden="true" />
            <span>
              <strong>{building.address}</strong>
              <em>{pinLabel(building.pin)} · class {building.classCode}</em>
            </span>
          </a>
        ))}
      </section>
    </main>
  );
}
