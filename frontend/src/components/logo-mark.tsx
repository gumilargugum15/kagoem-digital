import type { SVGProps } from "react";

/**
 * Kagoem Digital brand mark — a geometric "K" glyph.
 * Renders in `currentColor`, meant to sit inside the existing gradient icon tile.
 */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M8 4v16" />
      <path d="M8 12.5 18 4" />
      <path d="M8 12.5 18 20" />
    </svg>
  );
}
