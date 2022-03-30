import Alpine from 'alpinejs';
import directory from 'js/data.js';

Alpine.data('directory', directory);

// site specific config
{{ with .Site.Params.directory }}
let config = {
    clientid: '{{ .ApplicationId }}',
    tenantid: '{{ .TenantId }}'
};
{{ with .Group }}
config.group = '{{ . }}';
{{ end }}
{{ end }}

Alpine.store('config', config);

window.Alpine = Alpine;

Alpine.start();
