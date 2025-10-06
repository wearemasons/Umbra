import CallToAction from "@/components/call-to-action";
import ContentSection1 from "@/components/content-1";
import ContentSection2 from "@/components/content-2";
import ContentSection3 from "@/components/content-3";
import FAQsTwo from "@/components/faqs-2";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import React from "react";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ContentSection1 />
      <ContentSection2 />
      <ContentSection3 />
      <FAQsTwo />
      <CallToAction />
      <FooterSection />
    </>
  );
};

export default HomePage;
