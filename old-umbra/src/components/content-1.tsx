import Image from "next/image";

export default function ContentSection1() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">
          Visualize the Connections in Your Research.
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
          <div className="relative mb-6 sm:mb-0">
            <div className="bg-linear-to-b aspect-76/59 relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
              <Image
                src="/editor.png"
                className="rounded-[15px] transition-transform duration-300 hover:scale-125"
                alt="Umbra's Research Editor"
                width={1207}
                height={929}
              />
            </div>
          </div>

          <div className="relative space-y-4">
            <p className="text-muted-foreground">
              Umbra{`'`}s interactive graph allows researchers to easily explore
              relationships between studies, discover hidden patterns, and build
              a deeper understanding of the scientific landscape.
            </p>

            <div className="pt-6">
              <blockquote className="border-l-4 pl-4">
                <p>
                  Umbra has revolutionized my research process. The ability to
                  visualize connections between papers has saved me countless
                  hours and led to new insights.
                </p>

                <div className="mt-6 space-y-3">
                  <cite className="block font-medium">
                    Dr. Evelyn Reed, Institute of Mock Testimonials
                  </cite>
                </div>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
