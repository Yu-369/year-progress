/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                void: '#050505',
                acid: '#CCFF00',
                subtle: '#333333',
                glass: 'rgba(255, 255, 255, 0.03)',
            },
            transitionTimingFunction: {
                'premium': 'cubic-bezier(0.19, 1, 0.22, 1)',
                'bounce-sm': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            animation: {
                'reveal': 'reveal 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards',
                'pop': 'pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'glitch-text': 'glitch 2s infinite linear alternate-reverse',
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scan': 'scan 8s linear infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                reveal: {
                    '0%': { opacity: '0', transform: 'translateY(30px) scale(0.98)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
                pop: {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glitch: {
                    '0%': { transform: 'translate(0)' },
                    '20%': { transform: 'translate(-1px, 1px)' },
                    '40%': { transform: 'translate(-1px, -1px)' },
                    '60%': { transform: 'translate(1px, 1px)' },
                    '80%': { transform: 'translate(1px, -1px)' },
                    '100%': { transform: 'translate(0)' }
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' }
                }
            }
        },
    },
    plugins: [],
}
