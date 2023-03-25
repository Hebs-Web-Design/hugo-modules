export default () => ({
    open: false,
 
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
