# decapcms

This module can be used to deploy Decap CMS to a Hugo site.

## Usage

1. Add to your Hugo site config
2. Run `hugo mod npm pack` to add dependencies to `package.json`
3. Install dependencies via NPM using `npm install`
4. Ensure `go.mod` and `go.sum` are up to date by running `go mod tidy`

## Configuring the CMS

The CMS may be configured in two ways (or both):

1. Create a `config.yml` in `static/admin` as per the [documentation](https://decapcms.org/docs/intro/).
2. Add config to your site configuration as follows:
  
  ```yaml
  params:
    decapcms:
      config:
        backend:
          name: git-gateway
  ```

  Please see <https://decapcms.org/docs/beta-features/#manual-initialization> for more information.

  Both options may be used unless the config in your site configuration includes `load_config_file: false` which will prevent the loading of `config.yml`.

  It is also possible to not provide any configuration at all in your site configuration, however in this case a static `config.yml` file must exist.
3. Add the admin page as `content/admin.md` (for example):
  
  ```markdown
  ---
  title: Content Management 
  layout: decapcms
  ---

  This content is never shown...
  ```
## Notes

* Securing the CMS must be done separately 
