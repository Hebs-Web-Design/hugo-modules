export default () => ({
    items: [],
    total: 0,
    count: 0,
    add(newItem) {
        const cartItem = this.items.find(item => item.id === newItem.id);
        if(!cartItem) {
            this.items.push({...newItem, count: 1, total: newItem.price });
            this.total += newItem.price;
            this.count += 1;
        } else
            this.items = this.items.map((item) => {
                if(item.id !== newItem.id) return item;
                item.count += 1;
                item.total = item.price * item.count;
                this.total += item.price;
                this.count += 1;
                return item;
            });
    },
    remove(id) {
        const cartItem = this.items.find(item => item.id === id);
        if(cartItem.count > 1)
            this.items = this.items.map((item) => {
                if(item.id !== id) return item;
                item.count -= 1;
                item.total = item.price * item.count;
                this.total -= item.price;
                this.count -= 1;
                return item;
            });
        else if(cartItem.count === 1) {
            this.items = this.items.filter((item) => item.id !== id);
            this.total -= cartItem.price;
            this.count -= 1;
        }
    }
});