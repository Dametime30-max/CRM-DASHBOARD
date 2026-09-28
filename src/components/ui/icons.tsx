/** Small inline icon set (no icon library dependency). */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export const IconPlus = (p: IconProps) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconSearch = (p: IconProps) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const IconCheck = (p: IconProps) => (<svg {...base(p)}><path d="M20 6 9 17l-5-5" /></svg>);
export const IconAlert = (p: IconProps) => (<svg {...base(p)}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>);
export const IconClock = (p: IconProps) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const IconCalendar = (p: IconProps) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>);
export const IconList = (p: IconProps) => (<svg {...base(p)}><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>);
export const IconChevronDown = (p: IconProps) => (<svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>);
export const IconChevronRight = (p: IconProps) => (<svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>);
export const IconArrowUp = (p: IconProps) => (<svg {...base(p)}><path d="M12 19V5M5 12l7-7 7 7" /></svg>);
export const IconArrowDown = (p: IconProps) => (<svg {...base(p)}><path d="M12 5v14M19 12l-7 7-7-7" /></svg>);
export const IconPencil = (p: IconProps) => (<svg {...base(p)}><path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>);
export const IconTrash = (p: IconProps) => (<svg {...base(p)}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>);
export const IconNote = (p: IconProps) => (<svg {...base(p)}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></svg>);
export const IconInfo = (p: IconProps) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>);
export const IconArrowRight = (p: IconProps) => (<svg {...base(p)}><path d="M5 12h14M12 5l7 7-7 7" /></svg>);
export const IconScale = (p: IconProps) => (<svg {...base(p)}><path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0Zm14 0-3 7a3 3 0 0 0 6 0Z" /></svg>);
