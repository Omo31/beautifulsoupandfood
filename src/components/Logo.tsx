import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 250 50"
      width="210"
      height="40"
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
        </linearGradient>
      </defs>
      <path
        d="M10 10 C 20 0, 30 0, 40 10 S 60 20, 70 10"
        stroke="url(#logo-gradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      >
        <animate
          attributeName="d"
          values="M10 10 C 20 0, 30 0, 40 10 S 60 20, 70 10; M10 25 C 20 15, 30 15, 40 25 S 60 35, 70 25; M10 10 C 20 0, 30 0, 40 10 S 60 20, 70 10"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
      <text
        x="80"
        y="30"
        fontFamily="PT Sans, sans-serif"
        fontSize="20"
        fontWeight="bold"
        fill="hsl(var(--foreground))"
      >
        BeautifulSoup&Foods
      </text>
    </svg>
  );
}
