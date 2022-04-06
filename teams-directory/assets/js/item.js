function initPresence() {
    return {
        availability: ['Unknown', 'Unknown'],
        activity: ['Unknown', 'Unknown'],
        current: 0,
    };
}

// this is totally unused currently 
export default () => ({
    displayName: '',
    jobTitle: '',
    officeLocation: '',
    presence: initPresence(),
    getPresenceDescription(index = undefined) {
        return this.getPresence(index, true);
    },
    getPresenceIcon(index = undefined, description = false) {
        return this.getPresence(index, false);
    },
    getPresence(index = undefined, description = false) {
        // handle unknown presence
        if (this.presence === undefined) {
            this.presence = initPresence();
        }

        // handle unspecified index
        if (index === undefined) {
            index = this.currentPresenceIndex();
        }

        let availability = parsePresence(this.presence, index);
        
        if (description) {
            return availability.description;
        }

        return availability.icon;
    },
    get currentPresenceIndex() {
        // handle unknown presence
        if (this.presence === undefined) {
            this.presence = initPresence();
        }

        return this.presence.current;
    },
    parsePresence(index = undefined) {
        let iconBase = '/directory/img';
        
        if (index === undefined) {
            index = this.currentPresenceIndex();
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
    }
});