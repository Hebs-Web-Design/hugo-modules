import Alpine from 'alpinejs';
import persist from '@alpinejs/persist';
import directory from 'js/directory/data.js';

Alpine.data('directory', directory);

// site specific config
{{ with .Site.Params.directory }}
let config = {
    clientid: '{{ .ApplicationId }}',
    tenantid: '{{ .TenantId }}',
    showlocation: {{ default false .showLocation | jsonify }},
    {{ with .Group }}group: '{{ . }}',{{ end }}
    {{ with .SkipUsers }}skipusers: {{ . | jsonify }}{{ end }}
};
{{ end }}

Alpine.store('config', config);

window.Alpine = Alpine;

Alpine.plugin(persist);
Alpine.start();
