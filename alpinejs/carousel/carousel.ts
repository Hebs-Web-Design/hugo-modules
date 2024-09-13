export default (el: HTMLElement, interval: number = 5000) => ({
    init(): void {
        console.log("Initialising carousel...")
        if (this.el.hasChildNodes()) {
            let classes: string[] = []

            this.items = this.el.children.length

            console.log(`Found ${this.items} items in carousel`)
            
            for (let index = 0; index < this.items; index++) {
                if (index === 0) {
                    classes.push("translate-x-0")
                } else {
                    classes.push(`-translate-x-[${(index / this.items) * 100}%]`)
                }
            }
            this.classes = classes

            this.cycle()
        }
    },
    el: el,
    items: 0,
    interval: interval,
    position: 0,
    timer: 0,
    forward: true,
    classes: ["translate-x-0", "translate-x-full"],
    next(): void {
        // get current element
        if (this.el === null || this.el === undefined) {
            console.log(`Could not find element "${this.position}"`)
            return
        }

        // increment
        if (this.position == (this.items - 1)) {
            // at the end reverse the flow
            this.pause()
            this.forward = !this.forward
            this.cycle()

            return;
        } else {
            this.position++
        }

        // change classes
        console.log(`Changing "${this.classes[this.position - 1]}" to "${this.classes[this.position]}"`)
        this.el.classList.replace(this.classes[this.position - 1], this.classes[this.position])
    },
    prev(): void {
        // get current element
        if (this.el === null || this.el === undefined) {
            console.log(`Could not find element "${this.position}"`)
            return
        }

        // increment
        if (this.position == 0) {
            // at the end reverse the flow
            this.pause()
            this.forward = !this.forward
            this.cycle()

            return;
        } else {
            this.position--
        }

        // change classes
        console.log(`Changing "${this.classes[this.position + 1]}" to "${this.classes[this.position]}"`)
        this.el.classList.replace(this.classes[this.position + 1], this.classes[this.position])
    },
    cycle(): void {
        let self = this

        if (this.forward) {
            this.timer = setInterval(() => {
                self.next()
            }, self.interval)
        } else {
            this.timer = setInterval(() => {
                self.prev()
            }, self.interval)
        }
    },
    pause(): void {
        clearInterval(this.timer)
    },
});
