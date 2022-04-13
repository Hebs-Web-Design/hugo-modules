import Alpine from 'alpinejs';
import persist from '@alpinejs/persist';
import intersect from '@alpinejs/intersect';
import focus from '@alpinejs/focus';
import list from 'js/directory/list';
import item from 'js/directory/item';

Alpine.data('list', list);
Alpine.data('item', item);

window.Alpine = Alpine;

Alpine.plugin(persist);
Alpine.plugin(intersect);
Alpine.plugin(focus);

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
    {{- with .Maps }}
    {{- with .Service }}
    mapservice: '{{ . }}',
    {{- end }}
    {{- with .ApiKey }}
    mapsapikey: '{{ . }}',
    {{- end }}
    {{- end }}
};
{{- end }}
Alpine.start();
