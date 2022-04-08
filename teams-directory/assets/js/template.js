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
Alpine.start();
