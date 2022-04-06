import Alpine from 'alpinejs';
import axios from 'axios';
import * as msal from '@azure/msal-browser';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const updateInterval = 30000;
const presenceBatchMax = 650;

function isPaged(response) {
    return response.data['@odata.nextLink'] !== undefined;
}

function nextData(response) {
    return response.data['@odata.nextLink'];
}

function initPresence() {
    return {
        availability: ['Unknown', 'Unknown'],
        activity: ['Unknown', 'Unknown'],
        current: 0,
    };
}

function setPresence(item, availability, activity) {
    // handle missing activity
    if (item.activity === undefined) {
        item.activity = ['Unknown', 'Unknown'];
    }

    // skip any changes if current availability is the same
    if (item.availability[item.current] == availability) {
        // but update activity regardless
        item.activity[item.current] = activity;

        return item;
    }

    // set new values and return
    let index = item.current == 0 ? 1 : 0;

    item.availability[index] = availability;
    item.activity[index] = activity;
    item.current = index;

    return item;
}

function parsePresence(presence, index = undefined) {
    let iconBase = '/directory/img';
    
    if (index === undefined) {
        index = presence.current;
    }

    let availability = presence.availability === undefined ? 'Unknown' : presence.availability[index];
    let activity = presence.activity === undefined ? 'Unknown' : presence.activity[index];
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

function initMsalClient(clientId) {
    const msalConfig = {
        auth: {
          clientId: clientId,
          redirectUri: `${window.location.protocol}//${window.location.host}${window.location.pathname}`
        }
    };
    
    return new msal.PublicClientApplication(msalConfig);
}

function sortList(a, b) {
    let asplit = a.displayName.split(' ');
    let bsplit = b.displayName.split(' ');

    let x = (asplit.length > 1) ? asplit.slice(1, asplit.length).join(" ").toLowerCase() : asplit[0].toLowerCase();
    let y = (bsplit.length > 1) ? bsplit.slice(1, bsplit.length).join(" ").toLowerCase() : bsplit[0].toLowerCase();

    if (x < y) { return -1; }
    if (x > y) { return 1; }

    return 0;
}

function filterList(item) {
    let skipusers = Alpine.store('config').skipusers;

    // do nothing if setting is not defined
    if (skipusers === undefined) {
        return true;
    }

    // skip items that are in the lisst
    return !skipusers.includes(item.userPrincipalName);
}

export default () => ({
    initdone: false,
    list: Alpine.$persist([]),
    lastupdate: Alpine.$persist(0),
    get lastUpdateText() {
        let lastupdate = dayjs.unix(this.lastupdate);

        return lastupdate.format('LLL');
    },
    presence: Alpine.$persist({}),
    presencelastupdate: Alpine.$persist(0),
    showlocation: Alpine.store('config').showlocation,
    msalClient: initMsalClient(Alpine.store('config').clientid),
    loginRequest: {
        scopes: ['user.read'],
        authority: `https://login.microsoftonline.com/${Alpine.store('config').tenantid}`,
        redirectUri: `${window.location.protocol}//${window.location.host}${window.location.pathname}`
    },
    tokenRequest: {
        scopes: [
            'groupmember.read.all',
            'presence.read.all',
            'user.read.all'
        ],
    },
    accountId: '',
    async getToken(request) {
        const currentAcc = this.msalClient.getAccountByHomeId(this.accountId);
    
        if (currentAcc) {
            request.account = currentAcc;
            return await this.msalClient.acquireTokenSilent(request).catch(async (error) => {
                // silent token aquistion failed
                if (error instanceof msal.InteractionRequiredAuthError) {
                    // fallback to interaction when silent call fails
                    this.msalClient.acquireTokenRedirect(request);
                } else {
                    throw error;
                }
            });
        } else {
            throw 'Could not get current account information';
        }
    },
    async graphGet(url, params = undefined, eventual = false) {
        return await this.graph(url, 'get', undefined, params, eventual);
    },
    async graphPost(url, data) {
        return await this.graph(url, 'post', data);
    },
    async graph(url, method = 'get', data = undefined, params = undefined, eventual = false, json = false) {
        try {
            // get access token
            const response = await this.getToken(this.tokenRequest);
        
            let baseURL = Alpine.store('config').useworker ? `${window.location.protocol}//${window.location.host}/v1.0/` : 'https://graph.microsoft.com/v1.0/';
            let request = {
                url: url,
                method: method,
                baseURL: baseURL,
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`
                },
                params: params,
                data: data
            };
    
            if (eventual) {
                request.headers['ConsistencyLevel'] = 'eventual';
            }
    
            if (json) {
                request.headers['Content-Type'] = 'application/json';
            }
    
            try {
                let response = await axios(request);
                let responsedata = [];
    
                if (response.data.value === undefined && response.data.length === undefined) {
                    throw {
                        message: 'No value returned in reponse and data was not iterable',
                        response: response
                    };
                }
    
                // add to our responsedata array
                if (response.data.value !== undefined) {
                    responsedata.push(...response.data.value);
                } else {
                    responsedata.push(...response.data);
                }
    
                // handle paged response
                while (isPaged(response)) {
                    response = await this.graphGet(nextData(response));
    
                    if (response.data.value === undefined && response.data.length === undefined) {
                        throw {
                            message: 'No value returned in next reponse and data was not iterable',
                            response: response
                        };
                    }
    
                    // add next reponse to responsedata array
                    if (response.data.value !== undefined) {
                        responsedata.push(...response.data.value);
                    } else {
                        responsedata.push(...response.data);
                    }
                }
    
                // set data to full unpaged response
                response.data = responsedata;
    
                return response;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    },
    notice(type, text, error = undefined) {
        if (this.notices[type] !== undefined) {
            this.notices[type].message = text;
            this.notices[type].active = true;

            let logmsg = error === undefined ? text : `${text}: ${error}`;
            console.log(`${dayjs().format()} - ${logmsg}`);
        }
    },
    clearnotice(type) {
        if (this.notices[type] !== undefined) {
            this.notices[type].active = false;
        }
    },
    notices: {
        error: {
            message: '',
            active: false
        },
        warning: {
            message: '',
            active: false
        },
        info: {
            message: '',
            active: false
        },
    },
    get error() {
        return this.notices.error;
    },
    get warning() {
        return this.notices.warning;
    },
    get info() {
        return this.notices.info;
    },
    initerror: false,
    search: '',
    interval: undefined,
    updateInterval: updateInterval,
    get filteredList() {
        let search = this.search.toLowerCase();

        return this.list.filter(
            i => i.displayName.toLowerCase().includes(search)
        );
    },
    async init() {
        try {
            let response = await this.msalClient.handleRedirectPromise();
    
            if (response === null) {
                // do sign in via redirect
                this.msalClient.loginRedirect(this.loginRequest);

                return;
            }

            // got a valid response
            this.accountId = response.account.homeAccountId;
    
            
        } catch (error) {
            this.notice('error', 'Error logging in', error);
            this.initerror = true;

            return;
        }

        try {
            // do update
            await this.updateList();

            // signal data is loaded and init is complete
            this.initdone = true;

            // dont show message if this is not the first update
            if (this.lastupdate > 0) {
                this.notice('info', 'Updating presence...');
            }

            // start presence udpates
            this.startPresenceUpdates();
        } catch (error) {
            // signal an error
            this.initerror = true;
            console.log(error);
        }
    },
    async updateList() {
        let url = '/users';
        var self = this;
        var params = {
            '$filter': 'mail ne null',
            '$count': 'true',
            '$select': 'id,displayName,userPrincipalName,businessPhones,jobTitle,mail,officeLocation',
        };

        // if group was set in config then do request for members
        let group = Alpine.store('config').group;
        if (group !== undefined) {
            url = `/groups/${group}/members`;
        }

        // do intial request
        if (this.lastupdate > 0) {
            let lastupdate = dayjs.unix(this.lastupdate);
            let msg = 'info';

            // check if last update is way out of date
            if (lastupdate.isBefore(dayjs().subtract(7, 'day'))) {
                msg = 'warning';
            }

            // do update in background as we should have a stored copy
            setTimeout(async function() {
                let lastupdate = dayjs.unix(self.lastupdate);

                // set a messge for the user
                self.notice(msg, `Using phone list from ${lastupdate.fromNow()}. Updating in background...`);

                try {
                    let response = await self.graphGet(url, params, true);
                    let list = response.data.sort(sortList);

                    // return sorted and filtered list
                    self.list = list.filter(filterList);
                    self.lastupdate = dayjs().unix();

                    // clear any message
                    self.clearnotice(msg);
                } catch (error) {
                    self.notice('warning', 'Problem retrieving current phone list', `Phone list may be out of date as data was updated ${lastupdate.fromNow()}`);
                    if (msg != 'warning') {
                        // clear any message
                        self.clearnotice(msg);
                    }
                        
                    throw error;
                }
            }, 0);
        } else {
            try {
                let response = await graphGet(url, params, true);
                let list = response.data.sort(sortList);

                // return sorted and filtered list
                this.list = list.filter(filterList);
                this.lastupdate = dayjs().unix();
            } catch (error) {
                this.notice('error', 'Error retrieving phone list.', error);

                throw error;
            }
        }

    },
    getPresenceById(id) {
        if (this.presence[id] !== undefined) {
            this.presence[id] = initPresence();
        }

        return this.presence[id];
    },
    // updates presence data
    async update() {
        let list = this.filteredList;

        let start = 0;
        let end = 0;
        let intervalAdjusted = false;

        console.log(`${dayjs().format()} - Starting scheduled presence update...`);

        while (end < list.length) {
            let ids = [];

            // set end based on maximum bath size
            if (list.length > presenceBatchMax) {
                end = end + presenceBatchMax;
                if (end > list.length) {
                    end = list.length;
                }
            } else {
                end = list.length;
            }

            for (let i = start; i < end; i++) {
                const item = list[i];
                
                ids.push(item.id);
            }

            // create data for Graph API POST
            let data = {
                ids: ids
            };

            try {
                // do request
                const response = await this.graphPost('/communications/getPresencesByUserId', data);

                // if no error then possibly reduce the interval of updates for next run, but only once
                if (this.updateInterval > updateInterval && ! intervalAdjusted) {
                    this.updateInterval = this.updateInterval / 1.5;

                    // don't go below smallest interval
                    if (this.updateInterval > updateInterval) {
                        this.updateInterval = updateInterval;
                    }

                    this.startPresenceUpdates(false);

                    // dont adjust again this run
                    intervalAdjusted = true;
                }

                // update presence from response
                for (let i = 0; i < response.data.length; i++) {
                    const item = response.data[i];

                    this.presence[item.id] = setPresence(this.presence[item.id], item.availability, item.activity);
                }
            } catch (error) {
                if (error.response) {
                    // handle if response was throttled
                    if (error.response.status == 429) {
                        // double the interval
                        this.interval = this.interval * 2;

                        console.log(`${dayjs().format()} - Request throttled...update interval increased to ${this.updateInterval} ms`);

                        // restart updates with new interval
                        this.startPresenceUpdates(false);

                        // break out of loop now
                        break;
                    }
                }
                
                // Some other error
                console.log(`${dayjs().format()} - ${error}`);

                // finish up with partial results
                break;
            }

            // start loop from end next
            start = end - 1;
        }

        // set lastupdate time
        this.presencelastupdate = dayjs().unix();

        // clear any outstanding message
        this.clearnotice('info');
    },
    has(item, property) {
        return item[property] !== undefined && item[property] !== null;
    },
    value(value, prefix = undefined) {
        let v = value.toLowerCase();

        if (prefix !== undefined) {
            return `${prefix}:${v}`;
        }

        return v;
    },
    callto(item) {
        return this.value(item.mail, 'callto');
    },
    mailto(item) {
        return this.value(item.mail, 'mailto');
    },
    hastel(item) {
        return item.businessPhones !== null && item.businessPhones !== undefined && item.businessPhones.length > 0;
    },
    tel(item, text = false) {
        if (this.hastel(item)) {
            if (text) {
                return `${item.businessPhones[0]}`;
            }
            
            return `tel:${item.businessPhones[0]}`;
        }

        return '';
    },
    telText(item) {
        return this.tel(item, true);
    },
    chat(item) {
        return `https://teams.microsoft.com/l/chat/0/0?users=${item.mail}`;
    },
    updates() {
        // skip this is we haven't started up fully yet
        if (!this.initdone) {
            return;
        }

        if (document.hidden) {
            this.stopPresenceUpdates();
        } else {
            this.startPresenceUpdates();
        }
    },
    startLock: false,
    startPresenceUpdates(doinitial = true) {
        let self = this;
        let presencelastupdate = dayjs.unix(this.presencelastupdate);
        let initialUpdateInterval = 0;
        
        // basic locking in case event is fired more than once
        if (this.startLock) {
            return;
        } else {
            this.startLock = true;
        }

        // stop updates just in case we have been fired twice
        this.stopPresenceUpdates();

        if (doinitial) {
            console.log(`${dayjs().format()} - Starting presence update interval...`);

            // set initial presence update interval to next update time if presence was updated recently
            if (presencelastupdate.isAfter(dayjs().subtract(self.updateInterval, 'ms'))) {
                let d = dayjs.duration(self.updateInterval).subtract(dayjs().unix() - this.presencelastupdate, 'seconds');
                
                // convert duration to milliseconds for setTimeout
                initialUpdateInterval = d.asMilliseconds();
            }

            // do initial presence update in background
            setTimeout(function() {
                self.update();

                // start update interval
                self.interval = setInterval(function() {
                    self.update();
                }, self.updateInterval);
            }, initialUpdateInterval);
        } else {
            console.log(`${dayjs().format()} - Starting presence update interval (no intial update)...`);

            // start update interval
            self.interval = setInterval(function() {
                self.update();
            }, self.updateInterval);
        }

        // release our lock
        this.startLock = false;
    },
    stopPresenceUpdates() {

        console.log(`${dayjs().format()} - Stopping presence update interval...`);

        // clear current interval
        clearInterval(this.interval);
    },
});
