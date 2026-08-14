"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import type { getHeroImages } from "@/lib/queries";

interface HeroSliderProps {
  readonly images: Awaited<ReturnType<typeof getHeroImages>>;
}

const SLIDE_INTERVAL_MS = 5500;

export const HeroSlider = ({ images }: HeroSliderProps) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) {
      return;
    }
    const id = setInterval(() => {
      setActive((current) => (current + 1) % images.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <ImagePlaceholder
        className="aspect-[4/3] w-full"
        label="Esteric Kitchens & Interior Designs"
        tone="gold"
      />
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
      {images.map((image, index) => (
        <Image
          alt={image.altText ?? "Esteric Kitchens & Interior Designs"}
          className={`object-cover transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
          fill
          key={image.id}
          priority={index === 0}
          sizes="(min-width: 1024px) 50vw, 100vw"
          src={image.url}
        />
      ))}
      {images.length > 1 ? (
        <div className="absolute right-0 bottom-0 left-0 flex justify-center p-2">
          {images.map((image, index) => (
            <button
              aria-label={`Show slide ${index + 1}`}
              className="flex items-center justify-center p-2.5"
              key={image.id}
              onClick={() => setActive(index)}
              type="button"
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${
                  index === active ? "w-6 bg-gold" : "w-1.5 bg-background/70"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
