# cart.js

This is some reusable data that can be used to built a basic shopping cart via AplineJS.

## Usage

Use this javascript:

```js
import Alpine from 'alpinejs';
import cart from './alpinejs/cart';
Alpine.store('cart', cart);
Alpine.start();
```

Then in a template/partial:

```html
<div id="products-list" class="max-w-lg mx-auto" x-data='products'>
    <ul class="p-4">
        <template x-for="(item, index) in items" x-key="index">
            <li class="p-4">
                <img src="/350x450.png" alt="">
                <h1 class="mt-4 text-6xl text-blue-900 font-bold capitalize" x-text="item.name"></h1>
                <h2 class="mt-8 text-4xl font-regular">Lorem ipsum dolor, sit amet consectetur adipisicing elit.</h2>
                <p class="mt-4 text-4xl font-bold" x-text="'$' + ' ' + item.price"></p>
                <div class="ctrl mt-8 flex justify-end">
                    <button type="button" @click="$store.cart.add(item)">Add to Cart</button>
                </div>
            </li>
        </template>
    </ul>
</div>
```
