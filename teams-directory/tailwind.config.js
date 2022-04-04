// tailwind.config.js
module.exports = {
    content: [
        './hugo_stats.json',
        './layouts/**/*.html',
        './assets/**/*.js',
        './assets/**/*.css',
    ],
    extractors: [
        {
            extractor: (content) => {
                let els = JSON.parse(content).htmlElements;
                return els.tags.concat(els.classes, els.ids);
            },
            extensions: ['json']
        },
    ],
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
    ],
}
