/* eslint-disable @next/next/no-img-element */

export default function ContentSection2() {
  return (
    <section className="pb-16 md:pb-32">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
        <img
          className="rounded-(--radius) grayscale"
          src="/graph.png"
          alt="team image"
          height=""
          width=""
          loading="lazy"
        />

        <div className="grid gap-6 md:grid-cols-2 md:gap-12">
          {/* Left Column */}
          <h2 className="text-4xl font-medium">
            Umbra’s research editor; focus today, collaboration tomorrow.
          </h2>

          {/* Right Column */}
          <div className="space-y-6">
            <p>
              Write and organize in pure Markdown with a clean, distraction-free
              editor. Umbra makes it easy to capture ideas without wrestling
              with formatting.
            </p>
            <p>
              And we’re not stopping there — live collaboration and shared
              editing are on the horizon, so your team can create together in
              real time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
