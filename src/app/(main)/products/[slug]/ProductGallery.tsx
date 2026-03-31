"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  mainImage: string;
  thumbImage: string | null;
  name: string;
}

export default function ProductGallery({ mainImage, thumbImage, name }: Props) {
  const images = [mainImage, ...(thumbImage && thumbImage !== mainImage ? [thumbImage] : [])];
  const [active, setActive] = useState(0);

  return (
    <div className="pdp-sticky-col">
      <div style={{
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        backgroundColor: "var(--bg-subtle)",
        marginBottom: "var(--space-3)",
      }}>
        <Image
          src={`/images/${images[active]}`}
          alt={name}
          width={600}
          height={600}
          style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
          priority
        />
      </div>

      {images.length > 1 && (
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                padding: 0,
                border: `2px solid ${i === active ? "var(--green-dark)" : "var(--border-default)"}`,
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                cursor: "pointer",
                backgroundColor: "transparent",
                width: "72px",
                height: "72px",
                flexShrink: 0,
              }}
            >
              <Image
                src={`/images/${img}`}
                alt={`${name} ${i + 1}`}
                width={72}
                height={72}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
