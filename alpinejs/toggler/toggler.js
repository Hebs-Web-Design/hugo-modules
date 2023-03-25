export default () => ({
    open: false,

    get visible() {
        return this.open;
    },
    show() {
        this.open = true;
    },
    hide() {
        this.close();
    },
    close() {
        this.open = false;
    },
    toggle() {
        this.open = ! this.open;
    }
});
