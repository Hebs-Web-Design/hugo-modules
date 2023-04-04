# bootstrap-icons

Hugo module to embed SVG Bootstrap Icons in your Hugo project.

```toml
[[module.imports]]
path = "github.com/hebs-web-design/hugo-modules/bootstrap-icons"
```

## Usage

Use the partial in a template:

```html
{{ partial "b-icon.html" (dict "icon" "icon-name" "class" "warning") }}
```

Or as a shortcode (named parameters):

```html
{{< b-icon icon="icon-name" width="32" height="32" >}}
```

Or as a shortcode (positional parameters):

```html
{{< b-icon "icon-name" >}}
```

### Options

The following options can be passed to the partial (via a "dict") or the shortcode (named parameters only):

* icon : The name of the Bootstrap Icon to show (requred).
* width : SVG width (optional: defaults to `16`)
* height : SVG height (optional: defaults to `16`)
* class : CSS class to apply to SVG (optional: defaults to `"bi bi-<icon-name>"`)
* title : Adds a `<title>` element to the SVG output (optional)

When calling the shortcode using positional parameters only "icon" can be set.

## Versioning

Versioning is based on the "semverpair" algorithm that is described here: <https://github.com/bep/semverpair>
