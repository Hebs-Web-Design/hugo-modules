import Alpine from 'alpinejs';
import persist from '@alpinejs/persist';
import intersect from '@alpinejs/intersect';
import focus from '@alpinejs/focus';
import list from 'js/directory/list';
import item from 'js/directory/item';
import * as directoryconfig from '@directoryconfig';

Alpine.data('list', list);
Alpine.data('item', item);

window.Alpine = Alpine;

Alpine.plugin(persist);
Alpine.plugin(intersect);
Alpine.plugin(focus);

// global stuff
window.directoryconfig = directoryconfig;
Alpine.start();
