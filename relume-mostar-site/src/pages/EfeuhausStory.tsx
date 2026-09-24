import { asset } from "@/lib/asset";

export default function EfeuhausStory() {
  return (
    <>
      <section id="the-house" className="efeuhaus-band px-[5%] py-20 md:py-24 lg:py-28">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="efeuhaus-band-kicker mb-4 text-[0.7rem] uppercase tracking-[0.4em]">Efeuhaus</p>
          <h2 className="efeuhaus-band-heading mb-6 font-light italic">Architectural Vestige.</h2>
          <p className="efeuhaus-band-text mx-auto max-w-xl text-base leading-relaxed">
            A wooden house in a forest garden, its gable climbed by ivy season after season until the two are hard
            to tell apart.
          </p>
        </div>
        <div className="container mx-auto mt-12 max-w-4xl md:mt-16">
          <img
            src={asset("/images/figma-hero/05_base.png")}
            alt="The ivy-covered wooden house among the trees"
            className="w-full rounded-sm object-cover"
          />
        </div>
      </section>

      <section id="the-garden" className="efeuhaus-band px-[5%] py-20 md:py-24 lg:py-28">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="efeuhaus-band-kicker mb-4 text-[0.7rem] uppercase tracking-[0.4em]">The Garden</p>
          <h2 className="efeuhaus-band-heading mb-6 font-light italic">The garden keeps close to the house.</h2>
          <p className="efeuhaus-band-text mx-auto max-w-xl text-base leading-relaxed">
            Blue pots, pine trees, and a worn bench sit within a few steps of the door — the same ground the ivy
            climbed from.
          </p>
          <a href="#seasons" className="efeuhaus-band-button mt-8 inline-block">
            See the seasons
          </a>
        </div>
        <div className="container mx-auto mt-12 max-w-4xl md:mt-16">
          <img
            src={asset("/images/figma-hero/02_CloseUp.png")}
            alt="Blue plant pots and flowers in the garden"
            className="w-full rounded-sm object-cover"
          />
        </div>
      </section>

      <section id="seasons" className="efeuhaus-canvas px-[5%] py-20 md:py-24 lg:py-28">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="efeuhaus-kicker mb-4 text-[0.7rem] uppercase tracking-[0.4em]">Seasons</p>
          <h2 className="efeuhaus-headline mb-6 text-[2rem] font-light italic md:text-[2.5rem]">
            The garden through the year.
          </h2>
          <p className="efeuhaus-subline mx-auto max-w-xl text-base leading-relaxed">
            The house changes with what grows on it — the ivy is the clearest clock there is.
          </p>
        </div>
        <div className="container mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-10 text-left md:grid-cols-3 md:gap-8">
          <div>
            <span className="efeuhaus-kicker text-[0.7rem] tracking-[0.3em]">01</span>
            <h3 className="efeuhaus-band-heading-sm mt-3 mb-2 font-light italic">Spring</h3>
            <p className="efeuhaus-subline text-sm leading-relaxed">
              New leaves break first at the base of the gable, pale green against the dark wood.
            </p>
          </div>
          <div>
            <span className="efeuhaus-kicker text-[0.7rem] tracking-[0.3em]">02</span>
            <h3 className="efeuhaus-band-heading-sm mt-3 mb-2 font-light italic">Summer</h3>
            <p className="efeuhaus-subline text-sm leading-relaxed">
              Full leaf cover: the house is more ivy than timber from the garden side.
            </p>
          </div>
          <div>
            <span className="efeuhaus-kicker text-[0.7rem] tracking-[0.3em]">03</span>
            <h3 className="efeuhaus-band-heading-sm mt-3 mb-2 font-light italic">Autumn / Winter</h3>
            <p className="efeuhaus-subline text-sm leading-relaxed">
              The leaves thin and redden, then drop — the timber and the bare branches carry the scene instead.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
