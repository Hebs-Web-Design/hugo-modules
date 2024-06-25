# tailwindcss

## Usage

1. Add to hugo module config:
   ```toml
   [build]
     writeStats = true
   
   [[build.cachebusters]]
     source = "assets/watching/hugo_stats\\.json"
     target = "tailwind.css"
   
   [[build.cachebusters]]
     source = "(postcss|tailwind)\\.config\\.js"
     target = "css"

   [[build.cachebusters]]
     source = "assets/.*\\.(js|ts|jsx|tsx)"
     target = "js"

   [[build.cachebusters]]
     source = "assets/.*\\.(.*)$"
     target = "$1"
  
   [[module.mounts]]
     source = "hugo_stats.json"
     target = "assets/watching/hugo_stats.json"

   [[module.imports]]
     path = "github.com/hebs-web-design/hugo-modules/tailwindcss/v3"
     
   [[module.mounts]]
     source = "assets"
     target = "assets"
   ```
2. `hugo mod npm pack`
3. `npm install`
4. Include CSS using provided partial:
    ```hugo
    {{- partial "tailwind" . }}
    ```
    
    or concatenate the provided CSS with your own

    ```hugo
    {{- $options := dict "inlineImports" true }}
    {{- $css := slice (resources.Get "css/your.css" | postCSS $options) (resources.Get "css/tailwind.css" | postCSS $options) | resources.Concat "js/bundle.css" }}
    {{- if hugo.IsProduction }}
        {{- $css = $css | minify | fingerprint | resources.PostProcess }}
    {{- end }}
    <link rel="stylesheet" href="{{ $css.RelPermalink }}">
    ```
