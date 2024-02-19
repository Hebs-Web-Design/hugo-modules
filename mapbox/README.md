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

## API Token

The MapBox API token may be specified as-is or prefixed with `env:` to have the API key loaded from the specified environment variable.

As the environment variable provided is loaded using the Hugo `getenv` function, so by default it must start with `HUGO_` or `CI_` however this can be changed by updating your site configuration.
