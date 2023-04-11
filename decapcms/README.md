# decapcms

This module can be used to deploy Decap CMS to a Hugo site.

## Usage

1. Add to your Hugo site config
2. Run `hugo mod npm pack` to add dependencies to `package.json`
3. Install dependencies via NPM using `npm install`
4. Ensure `go.mod` and `go.sum` are up to date by running `go mod tidy`

## Configuring the CMS

Create a `config.yml` in `static/admin` as per the (documentation)[https://decapcms.org/docs/intro/].

## Notes

* The CMS is available at /admin (this cannot be changed)
* Securing the CMS must be done separately 
