// initial state can be set
export default (open = false) => ({
    open: open,
    closecount: 0,

    // are we visible?
    get visible() {
        return this.open;
    },

    // show thing
    show() {
        this.open = true;
        this.closecount = 0;
    },

    // hide and close do the same thing
    hide() {
        this.close();
    },
    close() {
        this.open = false;
    },

    // delay close until after "n" tries
    delayclose(event, n = 1) {
        if (this.closecount >= n) {
            this.close();

            return;
        }

        this.closecount++;
    },

    // toggle state
    toggle() {
        if (this.open) {
            this.close();
        } else {
            this.show();
        }
    }
});
