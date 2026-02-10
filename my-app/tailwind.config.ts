import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Organic & Wellness Color Palette (Light Mode)
        beige: {
          50: '#FAFAF5',
          100: '#F5F5DC',
          200: '#E8E8D0',
          300: '#DCD9B8',
          400: '#CFC9A0',
          500: '#C2BA88',
        },
        sage: {
          50: '#F5F7F5',
          100: '#E5EBE7',
          200: '#C5D5CA',
          300: '#A6BFAD',
          400: '#8DAA91',
          500: '#8DAA91', // Main sage green
          600: '#6B8E70',
          700: '#4A6B4F',
          800: '#2A4D2F',
        },
        terracotta: {
          50: '#FEF3F0',
          100: '#FDE7E1',
          200: '#F4C4B5',
          300: '#ECA189',
          400: '#E38D6F',
          500: '#E07A5F', // Main terracotta (light mode)
          600: '#C96849',
          700: '#B15633',
          800: '#8A3F1F',
        },

        // Midnight Forest Dark Mode Palette
        midnight: {
          base: '#1A1C19',      // Primary base - deep charcoal with forest undertone
          surface: '#242823',   // Surface/card - slightly lighter for depth
          text: '#DCE5D8',      // Secondary text - desaturated light sage
          border: '#3E443D',    // Border/divider - muted green-grey
          50: '#F5F7F5',
          100: '#E5EBE7',
          200: '#C5D5CA',
          300: '#A6BFAD',
          400: '#8DAA91',
          500: '#1A1C19',
          600: '#242823',
          700: '#3E443D',
        },
        coral: {
          50: '#FEF3F0',
          100: '#FDE7E1',
          200: '#F4C4B5',
          accent: '#F29C85',    // Brighter coral for dark mode CTAs
          500: '#F29C85',
          600: '#E38D6F',
        },

        // Keep shadcn defaults but customize
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Lato', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-down": "slide-down 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config