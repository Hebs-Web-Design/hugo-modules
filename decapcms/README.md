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

### Registering additional editor components

You may add any additonal editor components to `window.editorComponents` so these are added to the CMS by including creating a Javascript file in assets then listing any components to load in your site config.

An example Javascript file might be created as `assets/js/mycomponent.js`:

```javascript
const myComponent = {
  // Internal id of the component
  id: "collapsible-note",
  // Visible label
  label: "Collapsible Note",
  // Fields the user need to fill out when adding an instance of the component
  fields: [
    {
      name: 'summary',
      label: 'Summary',
      widget: 'string'
    },
    {
      name: 'contents',
      label: 'Contents',
      widget: 'markdown'
    }
  ],
  // Regex pattern used to search for instances of this block in the markdown document.
  // Patterns are run in a multiline environment (against the entire markdown document),
  // and so generally should make use of the multiline flag (`m`). If you need to capture
  // newlines in your capturing groups, you can either use something like
  // `([\S\s]*)`, or you can additionally enable the "dot all" flag (`s`),
  // which will cause `(.*)` to match newlines as well.
  //
  // Additionally, it's recommended that you use non-greedy capturing groups (e.g.
  // `(.*?)` vs `(.*)`), especially if matching against newline characters.
  pattern: /^<details><summary>(.*?)<\/summary>(.*?)<\/details>$/ms,
  // Given a RegExp Match object
  // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match#return_value),
  // return an object with one property for each field defined in `fields`.
  //
  // This is used to populate the custom widget in the markdown editor in the CMS.
  fromBlock: function(match) {
    return {
      summary: match[1],
      contents: match[2]
    };
  },
  // Given an object with one property for each field defined in `fields`,
  // return the string you wish to be inserted into your markdown.
  //
  // This is used to serialize the data from the custom widget to the
  // markdown document
  toBlock: function(data) {
    return `<details><summary>${data.summary}</summary>${data.contents}</details>`;
  },
  // Preview output for this component. Can either be a string or a React component
  // (component gives better render performance)
  toPreview: function(data) {
    return `
<details>
  <summary>${data.summary}</summary>

  ${data.contents}

</details>
`;
  }
};

// add to list of components
//
// Important - make sure this is an array of components...so don't overwrite it each time but add to it
if (window.editorComponents === undefined) {
  window.editorComponents = [myComponent];
} else {
  window.editorComponents.push(myComponent)
}
```

Then the following site configuration will trigger loading the component and adding it to the CMS:

```yaml
params:
    decapcms:
      components:
        - js/mycomponent.js
```

## Notes

* Securing the CMS must be done separately 
