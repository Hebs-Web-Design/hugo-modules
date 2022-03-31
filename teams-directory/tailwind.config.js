// tailwind.config.js
module.exports = {
    purge: {
        enabled: process.env.HUGO_ENVIRONMENT === 'production',
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
        mode: 'all',
        safelist: {}
    },
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
