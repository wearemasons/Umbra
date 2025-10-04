import Image from "next/image";

export default function ContentSection3() {
  return (
    <section className="pb-16 md:pb-32">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">
          An AI research companion not just another chatbot.
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
          {/* Text column (force left on desktop) */}
          <div className="relative space-y-4 order-2 sm:order-1">
            <p className="text-muted-foreground">
              Umbra goes beyond simple Q&amp;A. It understands your research
              context, connects the dots across papers, and helps you uncover
              ideas that don’t surface with keyword searches alone.
            </p>

            <p className="text-muted-foreground">
              Think of it as a collaborator — one that never sleeps, has read
              the entire literature, and is ready to brainstorm, summarize, or
              guide you toward new insights.
            </p>

            <div className="pt-6">
              <blockquote className="border-l-4 pl-4">
                <p>
                  Talking to Umbra isn’t like querying a chatbot, it feels like
                  working with a co-researcher who already knows the field and
                  helps you push it forward.
                </p>

                <div className="mt-6 space-y-3">
                  <cite className="block font-medium">
                    Prof. Lina Morales, Mock University of Science
                  </cite>
                </div>
              </blockquote>
            </div>
          </div>

          {/* Image column (force right on desktop) */}
          <div className="relative mb-6 sm:mb-0 order-1 sm:order-2">
            <div className="bg-linear-to-b aspect-76/59 relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
              <Image
                src="/chat.png"
                className="hidden rounded-[15px] dark:block transition-transform duration-300 hover:scale-125"
                alt="Umbra's AI Research Companion"
                width={1207}
                height={929}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
