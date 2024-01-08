# utilites

This Hugo module contains a number of partials and shortcodes that I have reimplemented a number of times so here they are for re-use.

They are not likely to be much use to anyone else.

## partials

### favicon

Add to `hugo.yml`:

```yaml
params:
  favicon:
    svg:
      img: logo.svg
      fill: '#ff0000'
    png: logo.png
```

Include partial:

```
{{- partial "favicon" . }}
```

This results in the following:

```html
<link rel="mask-icon" href="logo.svg" color="#ff0000">
<link rel="apple-touch-icon-precomposed" href="logo_180x.png">
<link rel="icon" href="logo_32x.png" sizes="32x32">
<link rel="shortcut icon" href="logo_196x.png" sizes="196x196">
```
