import React from "react";

interface KnockoutIconProps extends React.ComponentProps<"svg"> {
  strokeWidth?: number;
}

export default function KnockoutIcon({ className, strokeWidth = 2, ...props }: KnockoutIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="12" r="3" />
      <path d="M9 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9" />
      <path d="M13 12h2" />
    </svg>
  );
}
