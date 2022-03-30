# teams-directory

Hugo module to implement a phone directory with presence from Microsoft Teams.

## Usage

### Shortcode

Place this shortcode on the page where the directory should appear:

```
{{< directory >}}
```

## Site Config

```toml
[params]

[params.directory]
applicationId = "YOUR-APPLICATION-ID-FROM-AZURE-AD"
tenantId = "YOUR-TENANT-ID-FROM-AZURE-AD"
group = "YOUR-GROUP-ID-FROM-AZURE-AD"
logo = "https://example.com/logo.png"
logoAlt = "https://example.com/logo-inverted.png"
```