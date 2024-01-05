# carousel

A simple carousel using AlpineJS and Tailwind CSS classes.

## Usage

```js
import Alpine from 'alpinejs';
import carousel from './alpinejs/carousel';

Alpine.data('carousel', carousel);

Alpine.start();
```

```html
{{- with .Site.Data.list }}
    <div class="hidden -translate-x-full"><!-- extra classes --></div>
    <div class="relative overflow-hidden w-64 h-32 mx-auto" x-data="carousel($root)">
    {{- range $n, $item := . }}
        <div class="absolute inset-0 w-full h-full flex items-center justify-center transition-all ease-in-out duration-1000 transform{{ if eq $n 0 }} translate-x-0{{ else }} translate-x-full{{ end }}">
            <div>{{ $item }}</div>
        </div>
    {{- end }}
    </div>
{{- end }}
```

The `x-data` takes the following arguments:

```js
carousel(element, interval = 5000)
```
