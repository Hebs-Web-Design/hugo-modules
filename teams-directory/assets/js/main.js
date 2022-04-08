import Alpine from 'alpinejs';
import persist from '@alpinejs/persist';
import intersect from '@alpinejs/intersect';
import list from 'js/directory/list.js';
import item from 'js/directory/item.js';

Alpine.data('list', list);
Alpine.data('item', item);

window.Alpine = Alpine;

Alpine.plugin(persist);
Alpine.plugin(intersect);

// global stuff
{{- with .Site.Params.directory }}
window.directoryconfig = {
    clientid: '{{ .ApplicationId }}',
    tenantid: '{{ .TenantId }}', 
    showlocation: {{ default "false" .ShowLocation }},
    {{- with .Group }}
    group: '{{ . }}',
    {{- end }}
    {{- with .SkipUsers }}
    skipusers: {{ . | jsonify }},
    {{- end }}
    {{- with .Locations }}
    locations: {{ . | jsonify }},
    {{- end }}
    {{- with .DefaultLocation }}
    defaultlocation: {{ . | jsonify }},
    {{- end }}
    {{ if hugo.IsProduction }} useworker: {{ default "false" .UseWorker }},{{ end }}
};
{{- end }}
Alpine.start();
