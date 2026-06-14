import { BRAND } from "@/lib/brand";

export function ScripvoxIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="14" width="8" height="18" rx="4" fill={BRAND.PINK} />
      <rect x="14" y="6" width="8" height="26" rx="4" fill={BRAND.PINK} />
      <rect x="25" y="10" width="8" height="22" rx="4" fill={BRAND.PINK} />
    </svg>
  );
}
