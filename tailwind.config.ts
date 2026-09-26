import type { Config } from "tailwindcss";

// Radius intentionally small per spec.md §5 — no pill-shaped buttons/badges.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: "3px",
        sm: "2px",
        md: "3px",
        lg: "4px",
      },
      colors: {
        // One accent, used sparingly (primary actions + focus rings only)
        // per spec.md §5 — everything else stays neutral gray. Muted marine
        // blue chosen deliberately over default Tailwind blue-600/indigo-600
        // so it doesn't read as templated SaaS chrome.
        accent: {
          DEFAULT: "#1F4B7A",
          hover: "#173A61",
        },
      },
    },
  },
  plugins: [],
};

export default config;
