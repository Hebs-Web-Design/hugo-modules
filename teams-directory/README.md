# teams-directory

Hugo module to implement a phone directory with presence from Microsoft Teams.

## Usage

### Shortcode

Place the shortcode and set the page type in the front matter on the page where the directory should appear:

```
type: directory
---
{{< directory >}}
```

## App Registration

This requires an App Registration in your Azure AD tenant as follows:

1. TODO

## Site Config

```toml
[params]

[params.directory]
# The Application ID of your App Registration is Azure AD
applicationId = "YOUR-APPLICATION-ID-FROM-AZURE-AD"
# Your Azure AD Tenant ID
tenantId = "YOUR-TENANT-ID-FROM-AZURE-AD"
# The Object ID of the group to get members of (optional)
# Without this value all users frm Azure AD that have an "mail" value are retrieved
group = "YOUR-GROUP-ID-FROM-AZURE-AD"
# Logos in assets with "alt" versions set in "dark mode"
logo = "img/logo.png"
logoAlt = "img/logo-inverted.png"
logoSvg = "img/logo.svg"
logoAlt = "img/logo-inverted.svg"
# Show the location of users (Office Location in Azure AD) in list
showLocation = false
# Show footer containing last update time and version/hash of site (if GitInfo is enabled)
showFooter = false
```
