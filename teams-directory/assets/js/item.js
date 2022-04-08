import L from 'leaflet';

function initPresence() {
    return {
        availability: ['Unknown', 'Unknown'],
        activity: ['Unknown', 'Unknown'],
        current: 0,
    };
}

export default (item = {
        id: '',
        displayName: '',
        jobTitle: '',
        officeLocation: '',
        businessPhones: '',
        mail: undefined,
    }, presence = initPresence(), locations = {}, defaultlocation = undefined) => ({
    id: item.id !== undefined ? item.id : '',
    name: item.displayName !== undefined ? item.displayName : '',
    title: item.jobTitle !== undefined ? item.jobTitle : '',
    location: item.officeLocation !== null && item.officeLocation !== undefined ? item.officeLocation : '',
    phone: item.businessPhones !== null && item.businessPhones !== undefined && item.businessPhones.length > 0 ? item.businessPhones[0] : undefined,
    mail: item.mail !== undefined ? item.mail : undefined,
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
    mapdone: false,
    hasMapLocation() {
        let location = this.location.toLowerCase();

        return this.locations[location] !== undefined || this.defaultlocation !== undefined;
    },
    initMap(element) {
        if (!this.mapdone && this.hasMapLocation()) {
            try {
                let map = L.map(element, {
                    dragging: false,
                    zoomControl: false,
                });
                let location = this.getLocation();

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }).addTo(map);
                L.marker(location).addTo(map);

                map.setView(location, 13);
            } catch (error) {
                console.log(error);
            }

            this.mapdone = true;
        }
    },
    getLocation() {
        let location = this.location.toLowerCase();

        if (this.locations[location] !== undefined) {
            return this.locations[location];
        }

        if (this.defaultlocation !== undefined) {
            return this.defaultlocation;
        }

        return [0, 0];
    }
});