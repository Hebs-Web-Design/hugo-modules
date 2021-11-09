# picture

Hugo module to implement a basic partial and shortcode for picture emelents.

## Usage

### Shortcode

```
{{< picture img="img/logo.png" svg="img/logo.svg" alt="Logo" class="mx-auto px-3 md:px-0 inline-block" >}}
```

### Partial

```html
{{- partial "picture.html" (dict "img" "img/logo.png" "svg" "img/logo.svg" "alt" "Logo") -}}
```

## Options

* img : Path to image (png or jpg)
* svg : SVG version of image (optional)
* class : CSS classes to apply to image (optional)
* alt : Contents of "alt" attribute (optional)

And some more