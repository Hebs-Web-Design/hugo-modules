export default (el: HTMLElement, interval = 5000) => ({
    init() {
        if (this.el.hasChildNodes()) {
            this.items = this.el.children.length;
            this.cycle();
        }
    },
    el: el,
    items: 0,
    interval: interval,
    position: 0,
    timer: 0,
    forward: true,
    next() {
        // get current element
        let current = this.el.children[this.position];
        if (current === null) {
            console.log(`Could not find element "${this.position}"`);
            return;
        }

        // increment
        if (this.position == (this.items - 1)) {
            // at the end reverse the flow
            this.pause();
            this.forward = !this.forward;
            this.cycle();

            return;
        } else {
            this.position++;
        }

        // get next element
        let next = this.el.children[this.position];
        if (next === null) {
            console.log(`Could not find element "${this.position}"`);
            return;
        }

        // change classes
        current.classList.replace("translate-x-0", "-translate-x-full");
        next.classList.replace("translate-x-full", "translate-x-0");
    },
    prev() {
        // get current element
        let current = this.el.children[this.position];
        if (current === null) {
            console.log(`Could not find element "${this.position}"`);
            return;
        }

        // decrement
        if (this.position == 0) {
            // at the end reverse the flow
            this.pause();
            this.forward = !this.forward;
            this.cycle();

            return;
        } else {
            this.position--;
        }

        // get next element
        let next = this.el.children[this.position];
        if (next === null) {
            console.log(`Could not find element "${this.position}"`);
            return;
        }

        // change classes
        current.classList.replace("translate-x-0", "translate-x-full");
        next.classList.replace("-translate-x-full", "translate-x-0");
    },
    cycle() {
        let self = this;

        if (this.forward) {
            this.timer = setInterval(() => {
                self.next();
            }, self.interval);
        } else {
            this.timer = setInterval(() => {
                self.prev();
            }, self.interval);
        }
    },
    pause() {
        clearInterval(this.timer);
    },
});