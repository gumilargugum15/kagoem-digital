import { useState } from "react";
import { getStorageUrl } from "@/services/api";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  return (
    <div>
      <div className="aspect-[16/9] overflow-hidden rounded-3xl shadow-elegant">
        <img
          src={getStorageUrl(images[active]) ?? undefined}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image}
              onClick={() => setActive(index)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                active === index
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={getStorageUrl(image) ?? undefined}
                alt={`${alt} ${index + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
