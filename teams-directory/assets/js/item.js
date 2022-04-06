// this is totally unused currently
export default (item = {
        name: '',
        title: '',
        location: undefined,
        phone: undefined,
        mail: undefined,
    }, presence = [
        { availability: 'Unknown', activity: 'Unknown' },
        { availability: 'Unknown', activity: 'Unknown' },
    ],
    current = 0) => ({
    name: item.name !== undefined ? item.name : '',
    title: item.title !== undefined ? item.title : '',
    location: item.location !== undefined ? item.location : undefined,
    phone: item.phone !== undefined ? item.phone : undefined,
    mail: item.mail !== undefined ? item.mail : undefined,
    presence: presence !== undefined ? presence : [ { availability: 'Unknown', activity: 'Unknown' }, { availability: 'Unknown', activity: 'Unknown' } ],
    current: current !== undefined ? current : 0,
    getPresenceDescription(index = undefined) {
        return this.getPresence(index, true);
    },
    getPresenceIcon(index = undefined) {
        return this.getPresence(index, false);
    },
    getPresence(index = undefined, description = false) {
        // handle unspecified index
        if (index === undefined) {
            index = this.current;
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
            index = this.current;
        }
    
        let availability = this.presence[index].availability;
        let activity = this.presence[index].activity;
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
    has(property) {
        return this[property] !== undefined && this[property] !== null;
    },
    value(value, prefix = undefined) {
        let v = value.toLowerCase();

        if (prefix !== undefined) {
            return `${prefix}:${v}`;
        }

        return v;
    },
    callto() {
        return this.value(this.mail, 'callto');
    },
    mailto() {
        return this.value(this.mail, 'mailto');
    },
    hastel() {
        return this.phone !== null && this.phone !== undefined && this > 0;
    },
    tel(text = false) {
        if (this.hastel()) {
            if (text) {
                return `${this.phone}`;
            }
            
            return `tel:${this.phone}`;
        }

        return '';
    },
    telText() {
        return this.tel(true);
    },
    chat() {
        return `https://teams.microsoft.com/l/chat/0/0?users=${this.mail}`;
    },
});