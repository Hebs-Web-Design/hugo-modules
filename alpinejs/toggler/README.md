# toggler.js

This is a simple toggler that can be used to toggle the visibly state of an object.

This may be a modal, a menu or anything else.

## Usage

Use this javascript:

```js
import Alpine from 'alpinejs';
import toggler from './alpinejs/toggler';
Alpine.data('toggler', toggler);
Alpine.start();
```

Then in a shortcode:

```html
<div x-data="toggler">
    <div @click="toggle">Click Here To Toggle</div>
    <div x-show="open">Hello There</div>
</div>
```
