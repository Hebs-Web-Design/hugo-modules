# tailwindcss

## Usage

1. Add to hugo module config:
   ```toml
     [[module.imports]]
       path = "github.com/hebs-web-design/hugo-modules/tailwindcss/v3"
   ```
2. ```hugo mod npm pack```
3. ```npm install```
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
