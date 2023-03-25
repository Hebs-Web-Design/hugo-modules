# countdown.js

This is a simple countdown that can be used to perform a redirect after a time has elapsed.

In addition the percent and seconds left is available to allow the builting of a coundown.

## Usage

Use this javascript:

```js
import Alpine from 'alpinejs';
import countdown from './alpinejs/countdown';
Alpine.data('countdown', countdown);
Alpine.start();
```

Then in a shortcode:

```html
{{- $url := default "/" (.Get "url") }}
{{- $title := default "" (.Get "title") }}
<div class="flex flex-col gap-6" x-data="countdown('{{ absURL $url }}', '{{ $title }}'{{ with .Get "seconds" }}, {{ . }}{{ end }})" x-cloak>
    <div>You will be returned back to the <a class="transition hover:text-secondary" :href="url" x-text="title"></a> page in <span x-text="timeleft"></span> <span x-text="unit"></span>...</div>
    <div class="rounded-lg bg-slate-200 h-4">
        <div class="bg-secondary h-4 transition rounded-l-lg" :style="{ width: percent }" :class="npercent === 100 ? 'rounded-r-lg' : ''"></div>
    </div>
</div>
```
