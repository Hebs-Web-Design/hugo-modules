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

## Azure AD App Registration

This requires an App Registration in your Azure AD tenant as follows:

1. TODO

The required Microsoft Graph API permissions granted to the App Registration are:

* User.Read
* User.Read.All
* Presence.Read.All
* Groupmember.Read.All

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
# Skip matching users (based on UPN)
skipUsers = ["usera@example.net", "userb@example.net",]
# Logos in assets with "alt" versions set in "dark mode"
logo = "img/logo.png"
logoAlt = "img/logo-inverted.png"
logoSvg = "img/logo.svg"
logoAlt = "img/logo-inverted.svg"
# Show the location of users ("Office Location" in Azure AD) in list
showLocation = false
# Show footer containing last update time and version/hash of site (if GitInfo is enabled)
showFooter = false
# Deploy _headers file for Cloudflare Pages
deployHeaders = false
# Deploy _worker.js file for Cloudflare Pages
useWorker = false
# Default location for OpenSteetMap maps
defaultLocation = "Perth Office"

# Maps confguration (optional)
[params.directory.maps]
# Service to use for maps. Either "mapbox" or "openstreetmap" (default)
service = "mapbox"
# API key for Mapbox (not required for OpenStreetMap maps)
apiKey = "MAPBOX-API-KEY"

[params.directory.locations]
"Perth Office" = [-31.9560, 115.8606]
"Sydney Office" = [-33.7697, 150.8024]
```

### Attributes

The following Azure AD attributes are shown in the directory:

* displayName
* mail
* officeLocation
* businessPhones[0]
* jobTitle

### Locations and Maps

The users "Office Location" is used to display a map based on a match being
found under "locations" or based on the "defaultLocation" set.

## Cloudflare Pages specific features

### Functions

Enabling the "useWorker" option will deploy a "_worker.js" file to enable
proxying of MS Graph API via a Cloudflare Worker.

The goal of this is to eventually enable caching of API responses, however
this is **not working** currently.

### Headers

This deploys a file named "_headers" to implement HTTP headers via Cloudflare Pages.
