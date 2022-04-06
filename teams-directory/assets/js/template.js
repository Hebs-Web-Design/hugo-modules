import Alpine from 'alpinejs';
import persist from '@alpinejs/persist';
import list from 'js/directory/list.js';
import item from 'js/directory/item.js';

Alpine.data('list', list);
Alpine.data('item', item);

// site specific config
{{ with .Site.Params.directory }}
let config = {
    clientid: '{{ .ApplicationId }}',
    tenantid: '{{ .TenantId }}',
    showlocation: {{ default false .showLocation | jsonify }},
    {{ with .Group }}group: '{{ . }}',{{ end }}
    {{ with .SkipUsers }}skipusers: {{ . | jsonify }},{{ end }}
    {{ if hugo.IsProduction }}{{ with .UseWorker }}useworker: {{ . | jsonify }},{{ end }}{{ end }}
};
{{ end }}

Alpine.store('config', config);

window.Alpine = Alpine;

Alpine.plugin(persist);
Alpine.start();
