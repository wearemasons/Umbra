import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border px-6 py-12 md:py-20 lg:py-32">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Ready to Dive Deeper?
          </h2>
          <p className="mt-4">
            Request a demo to see how Umbra can transform your research
            workflow.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="mailto:seifzellaban@gmail.com">
                <span>Request a Demo</span>
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="https://github.com/wearemasons/Umbra">
                <span>Learn More</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
