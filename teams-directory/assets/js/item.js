import L from 'leaflet';
import { initPresence } from './functions';

L.Icon.Default.imagePath = '/directory/leaflet/';

export default ({
        id = '',
        displayName = '',
        jobTitle = '',
        officeLocation = '',
        businessPhones = [],
        mail = '',
        presence = initPresence(),
        locations = {},
        defaultlocation = '',
        mapservice = 'openstreetmap',
        mapsapikey = '',
    }) => ({
    id: id !== undefined ? id : '',
    name: displayName !== undefined ? displayName : '',
    title: jobTitle !== undefined ? jobTitle : '',
    location: officeLocation !== null && officeLocation !== undefined ? officeLocation : '',
    phone: businessPhones !== null && businessPhones !== undefined && businessPhones.length > 0 ? businessPhones[0] : undefined,
    mail: mail !== undefined ? mail : '',
    presence: presence !== undefined ? presence : initPresence(),
    getPresenceDescription(index = undefined) {
        return this.getPresence(index, true);
    },
    getPresenceIcon(index = undefined) {
        return this.getPresence(index, false);
    },
    getPresence(index = undefined, description = false) {
        // handle unspecified index
        if (index === undefined) {
            index = this.presence.current;
        }

        let availability = this.parsePresence(index);
        
        if (description) {
            return availability.description;
        }

        return availability.icon;
    },
    parsePresence(index = undefined) {
        let iconBase = '/directory/img';
        
        if (index === undefined) {
            index = this.presence.current;
        }
    
        let availability = this.presence.availability[index];
        let activity = this.presence.activity[index];
        let icon = `${iconBase}/presence_${availability.toLowerCase()}.png`;
        let description = availability;
    
        // handle different states
        switch (availability) {
            case 'Away':
                // handle different away states
                if (activity == 'OutOfOffice') {
                    description = 'Out of Office';
                    icon = `${iconBase}/presence_oof.png`;
                }

                break;
            case 'Busy':
                // handle different busy states
                if (activity == 'InACall') {
                    description = 'In a call';
                } else if (activity == 'InAMeeting') {
                    description = 'In a meeting';
                }

                break;
            case 'AvailableIdle':
                description = 'Available';
                icon = `${iconBase}/presence_available.png`;

                break;
            case 'BeRightBack':
                description = 'Be Right Back';
                icon = `${iconBase}/presence_away.png`;

                break;
            case 'BusyIdle':
                description = 'Busy';
                icon = `${iconBase}/presence_busy.png`;

                break;
            case 'DoNotDisturb':
                description = 'Do Not Disturb';
                icon = `${iconBase}/presence_dnd.png`;

                // handle different DoNotDisturb states
                if (activity == 'Presenting') {
                    description = 'Presenting';
                } else if (activity == 'UrgentInterruptionsOnly') {
                    description = 'Focusing';
                }
                
                break;
            case 'PresenceUnknown':
                description = 'Unknown';
                icon = `${iconBase}/presence_unknown.png`;

                break;
        }
    
        // return presence info
        return {
            description: description,
            icon: icon,
        };
    },
    get callto() {
        return `callto:${this.mail}`;
    },
    get mailto() {
        return `mailto:${this.mail}`;
    },
    get tel() {
        return `tel:${this.phone}`;
    },
    get chat() {
        return `https://teams.microsoft.com/l/chat/0/0?users=${this.mail}`;
    },
    get hasphone() {
        return this.phone !== null && this.phone !== undefined && this.phone !== '';
    },
    get haslocation() {
        return this.location !== null && this.location !== undefined && this.location !== '';
    },

    // modal stuff
    open: false,
    toggle() {
        this.open = !this.open;
    },
    close() {
        this.open = false;
    },
    // location map handling
    defaultlocation: defaultlocation,
    locations: locations,
    mapservice: mapservice,
    mapsapikey: mapsapikey,
    mapdone: false,
    hasMapLocation() {
        let location = this.location.toLowerCase();

        // is there a specific location match
        if (this.locations[location] !== undefined) {
            return true;
        }

        // is there no default location defined
        if (this.defaultlocation === undefined || this.defaultlocation == '') {
            return false;
        }
        
        // is default location valid
        if (this.locations[this.defaultlocation] === undefined) {
            return true;
        }

        // if not then false
        return false;
    },
    initMap(element) {
        if (!this.mapdone && this.hasMapLocation()) {
            try {
                let map = L.map(element, {
                    dragging: false,
                    zoomControl: true,
                });
                let location = this.getLocation();

                // set up tile layer based on maps engine selected
                switch (this.mapservice) {
                    case 'mapbox':
                        if (this.mapsapikey !== '') {
                            L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${this.mapsapikey}`, {
                                attribution: '&copy <a href="https://www.mapbox.com/feedback/">Mapbox</a> &copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                                tileSize: 512,
                                zoomOffset: -1
                            }).addTo(map);
                        }

                        break;
                    case 'google':
                        L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                            maxZoom: 19,
                            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                            attribution: '&copy <a href="https://maps.google.com/">Google</a>',
                        }).addTo(map);
                        break;
                    default:
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            maxZoom: 19,
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                        }).addTo(map);
                }

                // add marker
                L.marker(location).addTo(map);

                // set view to location
                map.setView(location, 15);
            } catch (error) {
                console.log(`Map init error: ${error}`);
            }

            this.mapdone = true;
        }
    },
    getLocation() {
        let location = this.location.toLowerCase();

        // try specific location
        if (this.locations[location] !== undefined) {
            return this.locations[location];
        }

        if (this.defaultlocation !== undefined) {
            location = this.defaultlocation.toLowerCase();

            if (this.locations[location] !== undefined) {
                return this.locations[location];
            }
        }

        return [0, 0];
    },

    // search stuff
    isVisible(search = '') {
        if (search == '') {
            return true;
        }

        const name = this.name.toLowerCase();

        return name.includes(search);
    },
});