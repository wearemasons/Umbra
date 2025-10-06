import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Link href="/" aria-label="go home" className="mx-auto block size-fit">
          <span className="font-lobster text-2xl select-none  text-shadow-white dark:text-white">
            Umbra
          </span>
        </Link>
        <span className="text-muted-foreground block text-center text-sm">
          {" "}
          © {new Date().getFullYear()} Space Apps Submission: Umbra, All rights
          reserved
        </span>
      </div>
    </footer>
  );
}
