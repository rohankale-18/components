/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
			fontFamily: {
				sans: ["Poppins", "sans-serif"],
			},
            colors: {
                primary: {
                    light: "#6366f1", // Light mode color
                    dark: "#4f46e5", // Dark mode color
                },
            },
        },
    },
    plugins: [],
};
