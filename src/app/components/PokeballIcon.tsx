interface PokeballIconProps {
  className?: string;
  size?: number;
}

export function PokeballIcon({ className = "", size = 24 }: PokeballIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top half - red */}
      <path
        d="M12 2C6.48 2 2 6.48 2 12h8.5c0-0.83 0.67-1.5 1.5-1.5s1.5 0.67 1.5 1.5H22C22 6.48 17.52 2 12 2z"
        fill="currentColor"
      />
      {/* Bottom half - white */}
      <path
        d="M12 22c5.52 0 10-4.48 10-10h-8.5c0 0.83-0.67 1.5-1.5 1.5s-1.5-0.67-1.5-1.5H2C2 17.52 6.48 22 12 22z"
        fill="currentColor"
        opacity="0.6"
      />
      {/* Center circle */}
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      {/* Middle line */}
      <path
        d="M2 12h8M14 12h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
