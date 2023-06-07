import Alpine from 'alpinejs';
import persist from '@alpinejs/persist';
import intersect from '@alpinejs/intersect';
import focus from '@alpinejs/focus';
import list from 'js/directory/list';
import item from 'js/directory/item';
import * as params from '@params';

Alpine.data('list', list);
Alpine.data('item', item);

window.Alpine = Alpine;

// load plugins
Alpine.plugin(persist);
Alpine.plugin(intersect);
Alpine.plugin(focus);

// global stuff
window.directoryconfig = params.config;
Alpine.start();
