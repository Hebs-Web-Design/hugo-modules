import Alpine from 'alpinejs';
import persist from '@alpinejs/persist';
import directory from 'js/directory/data.js';

Alpine.data('directory', directory);

// site specific config
{{ with .Site.Params.directory }}
let config = {
    clientid: '{{ .ApplicationId }}',
    tenantid: '{{ .TenantId }}',
    showlocation: {{ .showLocation | default false }}
};
{{ with .Group }}
config.group = '{{ . }}';
{{ end }}
{{ end }}

Alpine.store('config', config);

window.Alpine = Alpine;

Alpine.plugin(persist);
Alpine.start();
