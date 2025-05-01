# heroicons

Hugo module to embed SVG icons from [heroicons](https://github.com/tailwindlabs/heroicons) in your Hugo project.

```toml
[[module.imports]]
path = "github.com/hebs-web-design/hugo-modules/heroicons"
```

## Usage

Use the partial in a template:

```html
{{ partial "h-icon" (dict "icon" "icon-name" "class" "size-8") }}
```

Or as a shortcode (named parameters):

```html
{{< h-icon icon="icon-name" >}}
```

Or as a shortcode (positional parameters):

```html
{{< h-icon "icon-name" >}}
```

### Options

The following options can be passed to the partial (via a "dict") or the shortcode (named parameters only):

* icon : The name of the Bootstrap Icon to show (requred).
* class : CSS class to apply to SVG
* variant : Choose and alternate variant, one of `outline`, `solid`, `mini` or `micro`. Defaults to `outline`
* title : Adds a `<title>` element to the SVG output (optional)
* :class : Allows setting the class via Alpine.js (see https://alpinejs.dev/directives/bind#shorthand-syntax for more information)
* :title : Allows setting the title via Alpine.js
* x-show : See https://alpinejs.dev/directives/show
* @click : See https://alpinejs.dev/directives/on#shorthand-syntax
* x-cloak : See https://alpinejs.dev/directives/cloak


When calling the shortcode using positional parameters only "icon" can be set.

## Versioning

Versioning is based on the "semverpair" algorithm that is described here: <https://github.com/bep/semverpair>
