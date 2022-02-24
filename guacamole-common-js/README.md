# guacamole-common-js

Hugo module for guacamole-common-js.

```toml
[[module.imports]]
path = "github.com/hebs-web-design/hugo-modules/guacamole-common-js"
```

## Usage

Import and use:

```js
import Guacamole from 'guacamole-common-js';

var tunnel = new Guacamole.HTTPTunnel('/guacamole/tunnel');
var client = new Guacamole.Client(tunnel);

document.body.appendChild(client.getDisplay().getElement());
client.connect();
```
