# sitemap.xml

Hugo sitemap template that allows excluding certain content via front matter.

```toml
[[module.imports]]
path = "github.com/hebs-web-design/hugo-modules/sitemap"
```

## Usage

In your front matter as follows:

```yaml
---
title: Something To Exclude
sitemap_exclude: true
---

Some content to exclude.
```
