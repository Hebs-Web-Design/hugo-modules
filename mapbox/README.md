# mapbox

Hugo module to embed a static Mapbox map as an image.

```toml
[[module.imports]]
path = "github.com/hebs-web-design/hugo-modules/mapbox"
```

## Usage

```

Configure globally:

```toml
[params]

[params.mapbox]
location = "[lat,long,zoom]"
size = "WxH"
token = "API-TOKEN"
map2x = true
class = "<css classes for image>"
```

Use shortcode:

```html
{{< mapbox (dict "location" "[lat,long,zoom]" "size" "WxH" "token" "API-TOKEN" "map2x" true "class" "inline" >}}
```
