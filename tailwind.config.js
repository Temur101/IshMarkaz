/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    orange: '#FF5E00', // Vibrant orange
                    black: '#0A0A0A', // Deep black
                    gray: '#1A1A1A', // Dark gray for cards
                    text: '#FFFFFF', // White text
                    muted: '#888888', // Muted text
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            }
        },
    },
    plugins: [],
}
