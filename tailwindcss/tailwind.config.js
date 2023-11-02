// tailwind.config.js
module.exports = {
    content: ['./hugo_stats.json'],
    darkMode: 'media', // or 'media' or 'class'
    theme: {},
    variants: {
        extend: {
            filter: ['dark'],
            invert: ['dark'],
        }
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
}
