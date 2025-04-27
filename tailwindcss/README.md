# tailwindcss

## Usage

1. Add to hugo module config:
   ```toml
   [build.buidStats]
     enable = true
   
   [[build.cachebusters]]
     source = "assets/notwatching/hugo_stats\\.json"
     target = "css"
   
   [[build.cachebusters]]
     source = "(postcss|tailwind)\\.config\\.js"
     target = "css"

   [[module.imports]]
     path = "github.com/hebs-web-design/hugo-modules/tailwindcss/v4"
  
   [[module.mounts]]
     source = "hugo_stats.json"
     target = "assets/notwatching/hugo_stats.json"
     disableWatch = true
   
   [[module.mounts]]
     source = "assets"
     target = "assets"
   ```
2. `hugo mod npm pack`
3. `npm install`
4. Create "assets/css/main.css":
    ```css
    @import "tailwindcss";
    /* If you have hugo_stats.json in your .gitignore file make sure to add it here */
    @source "hugo_stats.json";

    /* Include any additional CSS here */
    ```
5. Include CSS using provided partial:
    ```hugo
    {{- partialCached "tailwind" . -}}
    ```
