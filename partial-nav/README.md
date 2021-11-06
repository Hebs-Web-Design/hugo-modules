# partial-nav

Hugo module to implement a basic nav/menu bar.

Reactive using Alpinejs and Tailwind CSS.

```toml
[[module.imports]]
path = "github.com/hebs-web-design/hugo-modules/partial-nav"
```

## Usage

Import JS:

```js
import Alpine from 'alpinejs';
import nav from 'js/nav.js'

Alpine.data('nav', nav);

Alpine.start();
```

Configure:

```toml
[params]

[params.nav]
collapse = "md"
```

Use partial:

```html
{{ partial "nav.html" . }}
```