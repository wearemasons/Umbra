"use client";

import React, { useEffect, useRef } from "react";

interface ParallaxContainerProps {
  children: React.ReactNode;
  speed?: number; // Speed for the background (lower = slower, 0 = no movement)
  className?: string;
  backgroundUrl?: string;
}

const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  children,
  speed = 0.01,
  className = "",
  backgroundUrl,
}) => {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;

      // Move background at a slower speed for the parallax effect
      if (backgroundRef.current) {
        const bgTransform = scrolled * speed;
        backgroundRef.current.style.transform = `translateY(${bgTransform}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Initial call to set the correct position
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [speed]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background image with parallax effect */}
      {backgroundUrl && (
        <div
          ref={backgroundRef}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}>
          <div className="absolute inset-0 backdrop-blur-sm bg-black/40"></div>
        </div>
      )}

      {/* Content scrolls normally - no transform applied */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default ParallaxContainer;
