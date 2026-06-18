type PlatformIconProps = {
  platform: string;
  className?: string;
  size?: number;
};

/** Glifos monocromáticos (currentColor) para las plataformas de publicación. */
export function PlatformIcon({ platform, className, size = 16 }: PlatformIconProps) {
  const p = platform.toLowerCase();
  const base = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className,
    "aria-hidden": true,
  } as const;

  if (p.includes("insta")) {
    return (
      <svg {...base} fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (p.includes("tiktok") || p.includes("tik tok")) {
    return (
      <svg {...base} fill="currentColor">
        <path d="M16.5 3c.3 2 1.6 3.5 3.5 3.8v2.5c-1.3.1-2.6-.3-3.6-1v5.7a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.6a2.8 2.8 0 1 0 1.9 2.6V3h2.6z" />
      </svg>
    );
  }

  if (p.includes("you")) {
    return (
      <svg {...base} fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (p.includes("linked")) {
    return (
      <svg {...base} fill="currentColor">
        <path d="M4.98 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM3.2 9h3.5v12H3.2zM9 9h3.35v1.64h.05c.47-.85 1.6-1.74 3.3-1.74 3.53 0 4.18 2.2 4.18 5.05V21h-3.5v-4.9c0-1.17-.02-2.67-1.9-2.67-1.9 0-2.2 1.27-2.2 2.58V21H9z" />
      </svg>
    );
  }

  return (
    <svg {...base} fill="currentColor">
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
