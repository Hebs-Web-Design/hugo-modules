# pricecard

This component is a partial that assumes it is passed the following:

```yaml
name: name of item
description: description of item
price: $100
unit: yearly
features:
  - Awesome feature A
  - Awesome feature B
```

This can be passed as a `dict` or provided from a `range` loop as follows:

```html
<div class="max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 not-prose">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch md:grid-cols-2 md:gap-8">
    {{- range index site.Data.prices -}}
        {{- partial "components/pricecard" . -}}
    {{- end -}}
    </div>
</div>
```