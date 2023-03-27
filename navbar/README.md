# navbar

Hugo module to implement a basic nav/menu bar.

Reactive using Alpinejs and Tailwind CSS.

```toml
[[module.imports]]
path = "github.com/hebs-web-design/hugo-modules/navbar"
```

## Usage

Import JS:

```js
import Alpine from 'alpinejs';
import toggler from './alpinejs/toggler';

Alpine.data('toggler', toggler);

Alpine.start();
```

Configure:

```yaml
navbar:
    brand:
      logo:
        image: logo.svg
        class: w-52 lg:w-44 xl:w-52
      text:
        content: Navbar
        class: font-semibold
    classes:
      navbar: drop-shadow-lg bg-white
      text: hover:text-blue-900 text-slate-500
      button: bg-blue-900 text-white font-semibold
      burger: bg-blue-900
      divider: border-blue-900
```

Use partial:

```html
{{ partial "navbar.html" . }}
```

## Notes

CSS requries TailwindCSS to be all up and running on your site correctly and the Javascript must be included too.
