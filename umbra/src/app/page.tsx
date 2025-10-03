import CallToAction from "@/components/call-to-action";
import ContentSection from "@/components/content-1";
import FAQsTwo from "@/components/faqs-2";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import React from "react";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ContentSection/>
      <FAQsTwo />
      <CallToAction/>
      <FooterSection />
    </>
  );
};

export default HomePage;