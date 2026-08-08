"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/images/hero/hero-kitchen-navy.jpg",
    alt: "Custom navy-blue kitchen with brass pendant lighting and marble island",
  },
  {
    src: "/images/hero/hero-living-room.jpg",
    alt: "Living room with tailored drapery and natural light",
  },
  {
    src: "/images/hero/hero-kitchen-dark-marble.jpg",
    alt: "Kitchen with dark marble countertops overlooking the garden",
  },
];

const SLIDE_INTERVAL_MS = 5500;

export const HeroSlider = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
      {slides.map((slide, index) => (
        <Image
          alt={slide.alt}
          className={`object-cover transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
          fill
          key={slide.src}
          priority={index === 0}
          sizes="(min-width: 1024px) 50vw, 100vw"
          src={slide.src}
        />
      ))}
      <div className="absolute right-0 bottom-0 left-0 flex justify-center gap-2 p-4">
        {slides.map((slide, index) => (
          <button
            aria-label={`Show slide ${index + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              index === active ? "w-6 bg-gold" : "w-1.5 bg-background/70"
            }`}
            key={slide.src}
            onClick={() => setActive(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
};
