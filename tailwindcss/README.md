# tailwindcss

## Usage

1. Add to hugo module config:
   ```toml
     [[module.imports]]
       path = "github.com/hebs-web-design/hugo-modules/tailwindcss/v3"
   ```
2. ```hugo mod npm pack```
3. ```npm install```
4. Include CSS using partial:
    ```hugo
    {{ partial "tailwind" . }}
    ```