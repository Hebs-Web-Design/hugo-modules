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
        officeLocation: undefined,
        businessPhones: undefined,
        mail: undefined,
    }, presence = initPresence()) => ({
    id: item.id !== undefined ? item.id : '',
    name: item.displayName !== undefined ? item.displayName : '',
    title: item.jobTitle !== undefined ? item.jobTitle : '',
    location: item.officeLocation !== undefined ? item.officeLocation : undefined,
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
});