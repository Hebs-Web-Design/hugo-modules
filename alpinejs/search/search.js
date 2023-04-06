export default (dev = false) => ({
    dev: dev,
    text: '',
    results: [],
    searching: false,
    searcherror: false,
    async dosearch() {
        // clear any existing results
        this.results = [];

        // skip an empty search
        if (this.text === '') {
            return;
        }

        this.searching = true;

        // in "dev" mode just return up to 20 random results
        if (this.dev) {
            let results = [];
            const max = Math.floor(Math.random() * 20);

            for (let n = 1; n <= max; n++) {
                results.push({
                    id: n,
                    url: `/item-${n}/`,
                    title: `Item ${n}`,
                    excerpt: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque felis imperdiet proin fermentum leo vel orci.`
                });
                
            }

            this.results = results;
            this.searching = false;
            return;
        }

        if (this.pagefind === undefined) {
            // attempt to load pagefind library
            try {
                const pagefind = await import("/_pagefind/pagefind.js");

                // retrieve results
                const search = await pagefind.search(this.text);

                let results = [];
                for (const result of search.results) {
                    const data = await result.data();

                    results.push({
                        id: result.id,
                        title: data.meta.title,
                        url: data.url,
                        excerpt: data.excerpt,
                    });
                }

                this.results = results;
                
            } catch(err) {
                console.log(`Problem with search...are you running locally? Error: ${err}`);
                this.searcherror = true;
                this.searching = false;

                return;
            }

            this.searching = false;
            this.searcherror = false;
        }
    },
    get noresults() {
        return this.results.length === 0;
    },
    get hastext() {
        return this.text !== '';
    },
    clear() {
        this.text = '';
        this.results = [];
    },
});