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

## Parameters

The data can be initialised with the starting "open" set to "false" as follows:

```html
<div x-data="toggler(false)">
```

## Properties

The following properties are exposed:

* open (boolean) - Are we "open" or not

## Methods


The following methods are provided:

* show - Used to show the "whatever" (sets "open" to true)
* visible - Alias of "open" property
* hide - Alias of close
* close - Sets "open" to "false"
* delayclose - Sets "open" to "false" only after the specified number of attempts (defaults to 1) have occurred
* toggle - Toggles the state of "open"
