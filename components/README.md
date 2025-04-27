# Components

These components are adapted from [HyperUI](https://github.com/markmead/hyperui).

Configuration for the various components is placed in your Hugo configuration file as follows:

```yaml
params:
  components:
    logo:
      # Logo path. When inline = true this should be the full path
      asset: /path/to/logo/in/assets.svg
      inline: false # set to true to inline the SVG
    header:
      button:
        title: Button Title
        url: /path/to/page
      menu: main
```
