export default () => ({
    open: false,
 
    show() {
        this.open = true;
    },
    close() {
        this.open = false;
    },
    toggle() {
        this.open = ! this.open;
    }
});
