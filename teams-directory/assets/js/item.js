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
    
        // handle different states
        switch (availability) {
            case 'Away':
            case 'Available':
            case 'Offline':
            case 'Unknown':
                return {
                    description: availability,
                    icon: icon
                };
            case 'Busy':
                // handle different busy states
                let description = availability;
                switch (activity) {
                    case 'InACall':
                        description = 'In a call';
                        break;
                    case 'InAMeeting':
                        description = 'In a meeting';
                        break;
                } 
                return {
                    description: description,
                    icon: icon
                };
            case 'AvailableIdle':
                return {
                    description: 'Available',
                    icon: `${iconBase}/presence_available.png`
                };
            case 'BeRightBack':
                return {
                    description: 'Be Right Back',
                    icon: `${iconBase}/presence_away.png`
                };
            case 'BusyIdle':
                return {
                    description: 'Busy',
                    icon: `${iconBase}/presence_busy.png`
                };
            case 'DoNotDisturb':
                return {
                    description: 'Do Not Disturb',
                    icon: `${iconBase}/presence_dnd.png`
                };
            case 'PresenceUnknown':
                return {
                    description: 'Unknown',
                    icon: `${iconBase}/presence_unknown.png`
                };
            case 'OutOfOffice':
                return {
                    description: 'Out Of Office',
                    icon: `${iconBase}/presence_oof.png`
                };
        }
    
        return {
            description: 'Unknown',
            icon: `${iconBase}/presence_unknown.png`
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