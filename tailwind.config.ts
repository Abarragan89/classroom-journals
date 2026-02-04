import type { Config } from "tailwindcss";

export default {
	darkMode: ["class", "class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				success: {
					DEFAULT: 'var(--success)',
					foreground: 'var(--success-foreground)'
				},
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)'
				},
				warning: {
					DEFAULT: 'var(--warning)',
					foreground: 'var(--warning-foreground)'
				},
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)'
				},
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				sidebar: {
					DEFAULT: 'var(--sidebar-background)',
					foreground: 'var(--sidebar-foreground)',
					primary: 'var(--sidebar-primary)',
					'primary-foreground': 'var(--sidebar-primary-foreground)',
					accent: 'var(--sidebar-accent)',
					'accent-foreground': 'var(--sidebar-accent-foreground)',
					border: 'var(--sidebar-border)',
					ring: 'var(--sidebar-ring)'
				},
				// fontFamily: {
				// 	sans: 'var(--font-sans)',
				// 	serif: 'var(--font-serif)',
				// 	mono: 'var(--font-mono)',
				// },

				// borderRadius: {
				// 	DEFAULT: 'var(--radius)',
				// 	sm: 'calc(var(--radius) - 2px)',
				// 	md: 'var(--radius)',
				// 	lg: 'calc(var(--radius) + 2px)',
				// },

			},
			boxShadow: {
				'2xs': 'var(--shadow-2xs)',
				xs: 'var(--shadow-xs)',
				sm: 'var(--shadow-sm)',
				DEFAULT: 'var(--shadow)',
				md: 'var(--shadow-md)',
				lg: 'var(--shadow-lg)',
				xl: 'var(--shadow-xl)',
				'2xl': 'var(--shadow-2xl)',
			},

			letterSpacing: {
				normal: 'var(--tracking-normal)',
			},

			spacing: {
				base: 'var(--spacing)',
			},


			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				fall: {
					'0%': { transform: 'translateY(-100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'bounce-down': {
					'0%': {
						transform: 'translateY(-60px)',
						opacity: '0'
					},
					'60%': {
						transform: 'translateY(8px)',
						opacity: '1'
					},
					'80%': {
						transform: 'translateY(-4px)'
					},
					'90%': {
						transform: 'translateY(2px)'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				fall: 'fall 1.5s ease-out forwards',
				'bounce-down': 'bounce-down 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 1.4s forwards',
			}
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
