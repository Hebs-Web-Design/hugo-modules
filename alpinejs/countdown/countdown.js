export default (url, title = '', seconds = 30) => ({
    init() {
        if (title === '') {
            this.title = url;
        } else {
            this.title = title;
        }

        setInterval(() => {
            // redirect at zero
            if (this.npercent === 0) {
                window.location.replace(this.url);
            }
            
            // otherwise decrement
            let percent = Math.round(this.npercent - (100 / this.seconds));
            if (percent < 0) {
                percent = 0;
            }

            // set percent
            this.npercent = percent;
        }, 1000);
    },
    url: url,
    seconds: seconds,
    title: '',
    npercent: 100,
    get timeleft() {
        return Math.round((this.seconds * this.npercent) / 100);
    },
    get unit() {
        if (this.timeleft > 1) {
            return 'seconds';
        }

        return 'second';
    },
    get percent() {
        return `${this.npercent}%`;
    }
});
