# search.js

This is some reusable data that can be used to implement a search box using [Pagefind](https://pagefind.app/).

## Usage

Use this javascript:

```js
import Alpine from 'alpinejs';
import search from './alpinejs/search';
Alpine.data('search', search);
Alpine.start();
```

Then in a template/partial:

```html
<div x-data="search{{ if .Site.IsServer }}(true){{ end }}">
    <form>
        <input type="text" @input.debounce.500ms="await dosearch()" @keyup.escape.window="clear" x-model.debounce.500ms="text">
    </form>
    <template x-for="result in results" :key="result.id">
        <div>
            <div><a :href="result.url" x-html="result.title"></a></div>
            <div x-html="result.excerpt"></div>
        </div>
    </template>
</div>
```

The above assumes that Pagefind has indexed the production site as per their documentation.

There is no requirement to import the Pagfind JS directly as this is done via the AlpineJS data and the Pagefind CSS is not used, so you must style everything yourself.
