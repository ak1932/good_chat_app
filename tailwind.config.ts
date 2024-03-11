import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            colors: {
                "theme_bg": "#3c3836",
                "theme_yellow": "#E9B824",
                "theme_gray": "#303030", // use for box shadow as well
                "theme_red": "#EE9322",
                "theme_blue": "#458588",
                "theme_green": "#8ec07c",
            },
      boxShadow: {
        'theme': '5px 5px #303030', // use gray color from theme
        'selected_theme': '5px 5px #DFDFDF', // use gray color from theme
        'chat_yellow_theme': '5px 5px #E9B824', // use gray color from theme
        'chat_red_theme': '5px 5px #EE9322', // use gray color from theme
      }
        },
    },
    plugins: [],
};
export default config;
