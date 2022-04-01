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

async function graphGet(token, url, params = undefined, eventual = false) {
    return await graph(token, url, 'get', undefined, params, eventual);
}

async function graphPost(token, url, data) {
    return await graph(token, url, 'post', data);
}

async function graph(token, url, method = 'get', data = undefined, params = undefined, eventual = false, json = false) {
    let request = {
        url: url,
        method: method,
        baseURL: 'https://graph.microsoft.com/v1.0/',
        headers: {
            'Authorization': `Bearer ${token}`
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
            response = await graphGet(token, nextData(response));

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
}

function isPaged(response) {
    return response.data['@odata.nextLink'] !== undefined;
}

function nextData(response) {
    return response.data['@odata.nextLink'];
}

function initPresence() {
    return {
        availability: ['Unknown', 'Unknown'],
        current: 0,
    };
}

function setAvailability(item, availability) {
    // skip any changes if current availability is the same
    if (item.availability[item.current] == availability) {
        return item;
    }

    // otherwise toggle availability
    if (item.current == 0) {
        item.availability[1] = availability;
        item.current = 1;
    } else {
        item.availability[0] = availability;
        item.current = 0;
    }

    return item;
}

function parseAvailability(availability = 'Unknown') {
    let iconBase = '/directory/img';

    switch (availability) {
        case 'Away':
        case 'Available':
        case 'Busy':
        case 'Offline':
        case 'Unknown':
            return {
                description: availability,
                icon: `${iconBase}/presence_${availability.toLowerCase()}.png`
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
        default:
            console.log(`Unhandled availability: ${availability}`);

            return {
                description: 'Unknown',
                icon: `${iconBase}/presence_unknown.png`
            };
    }
}

function initMsalClient(clientId) {
    const msalConfig = {
        auth: {
          clientId: clientId,
          redirectUri: `${window.location.protocol}//${window.location.host}/${window.location.pathname}`
        }
    };
    
    return new msal.PublicClientApplication(msalConfig);
}

function sortList(list) {
    return list.sort(function(a, b) {
        let asplit = a.displayName.split(' ');
        let bsplit = b.displayName.split(' ');

        let x = (asplit.length > 1) ? asplit.slice(1, asplit.length).join(" ").toLowerCase() : asplit[0].toLowerCase();
        let y = (bsplit.length > 1) ? bsplit.slice(1, bsplit.length).join(" ").toLowerCase() : bsplit[0].toLowerCase();

        if (x < y) { return -1; }
        if (x > y) { return 1; }

        return 0;
    });
}

export default () => ({
    initdone: false,
    msalClient: undefined,
    msalRequest: {
        scopes: [
            'groupmember.read.all',
            'presence.read.all',
            'user.read.all'
        ],
        authority: `https://login.microsoftonline.com/${Alpine.store('config').tenantid}`,
        redirectUri: window.location.href
    },
    list: Alpine.$persist([]),
    lastupdate: Alpine.$persist(0),
    get lastUpdateText() {
        let lastupdate = dayjs.unix(this.lastupdate);

        return lastupdate.format('LLL');
    },
    presence: Alpine.$persist({}),
    presencelastupdate: Alpine.$persist(0),
    showlocation: Alpine.store('config').showlocation,
    notice(type, text) {
        this[type].message = text;
        this[type].active = true;
    },
    clearnotice(type) {
        this[type].active = false;
    },
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
    initerror: false,
    token: undefined,
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
        this.msalClient = initMsalClient(Alpine.store('config').clientid);

        try {
            let authenticationResult = await this.msalClient.handleRedirectPromise();

            // set the active account if possible
            if (authenticationResult !== null) {
                this.msalClient.setActiveAccount(authenticationResult.account);
            } else {
                // No user signed in
                try {
                    // Use MSAL to login
                    await this.msalClient.loginRedirect(this.msalRequest);
                } catch (error) {
                    this.notice('error', `Error logging in: ${error}`);
                    this.initerror = true;

                    return;
                }
            }
        } catch (error) {
            this.notice('error', `Error logging in: ${error}`);
            this.initerror = true;

            return;
        }
        
        await this.msalClient.acquireTokenSilent(this.msalRequest).then(tokenResponse => {
            this.token = tokenResponse.accessToken;
        }).catch(async (error) => {
            if (error instanceof msal.InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                await this.msalClient.acquireTokenRedirect(this.msalRequest).then(tokenResponse => {
                    this.token = tokenResponse.accessToken;
                }).catch(async error => {
                    this.notice('error', `Error aquiring token: ${error}`);
                    this.initerror = true;
                });
            } else {
                this.notice('error', `Error aquiring token: ${error}`);
                this.initerror = true;
            }
        }).catch(async error => {
            this.notice('error', `Error aquiring token: ${error}`);
            this.initerror = true;
        });

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
                        let response = await graphGet(self.token, url, { '$filter': 'mail ne null', '$count': 'true'}, true);

                        // return sorted list
                        self.list = sortList(response.data);
                        self.lastupdate = dayjs().unix();

                        // clear any message
                        self.clearnotice(msg);
                    } catch (error) {
                        self.notice('warning', `Error retrieving current phone list. Phone list may be out of date as data was updated ${lastupdate.fromNow()}`);
                        if (msg != 'warning') {
                            // clear any message
                            self.clearnotice(msg);
                        }
                         
                        throw error;
                    }
                }, 0);
            } else {
                try {
                    let response = await graphGet(this.token, url, { '$filter': 'mail ne null', '$count': 'true'}, true);

                    // return sorted list
                    this.list = sortList(response.data);
                    this.lastupdate = dayjs().unix();
                } catch (error) {
                    this.notice('error', 'Error retrieving phone list.');

                    throw error;
                }
            }

    },
    getPresenceDescription(id, index = undefined) {
        return this.getPresence(id, index, true);
    },
    getPresenceIcon(id, index = undefined, description = false) {
        return this.getPresence(id, index, false);
    },
    getPresence(id, index = undefined, description = false) {
        // handle unknown presence
        if (this.presence[id] === undefined && index === undefined) {
            this.presence[id] = initPresence();
        }

        if (index === undefined) {
            index = this.getCurrentPresenceIndex(id);
        }

        let presence = this.presence[id];
        let availability = parseAvailability(presence.availability[index]);
        
        if (description) {
            return availability.description;
        }

        return availability.icon;
    },
    getCurrentPresenceIndex(id) {
        // handle unknown presence
        if (this.presence[id] === undefined) {
            this.presence[id] = initPresence();
        }

        let presence = this.presence[id];

        return presence.current;
    },
    async update() {
        let list = this.filteredList;

        let start = 0;
        let end = 0;
        let intervalAdjusted = false;

        while (end < list.length) {
            let ids = [];

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
                var self = this;

                // do request
                const response = await graphPost(this.token, '/communications/getPresencesByUserId', data);

                // if no error then possibly reduce the interval of updates for next run, but only once
                if (this.updateInterval > updateInterval && ! intervalAdjusted) {
                    this.updateInterval = this.updateInterval / 1.5;

                    // don't go below smallest interval
                    if (this.updateInterval > updateInterval) {
                        this.updateInterval = updateInterval;
                    }

                    // clear current interval
                    clearInterval(this.interval);

                    // start update interval again
                    this.interval = setInterval(function() {
                        self.update();
                    }, this.updateInterval);

                    // dont adjust again this run
                    intervalAdjusted = true;
                }

                // update presence from response
                for (let i = 0; i < response.data.length; i++) {
                    const item = response.data[i];

                    this.presence[item.id] = setAvailability(this.presence[item.id], item.availability);
                }
            } catch (error) {
                // handle if response was throttled
                if (error.response.status == 429) {
                    // clear current interval
                    clearInterval(this.interval);

                    // double the interval
                    this.interval = this.interval * 2;

                    // start over
                    this.interval = setInterval(function() {
                        self.update();
                    }, this.updateInterval);

                    // break out of loop now
                    break;
                }
                console.log(error);
            }

            // start loop from end next
            start = end;
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
    startPresenceUpdates() {
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

        // release our lock
        this.startLock = false;
    },
    stopPresenceUpdates() {
        // clear current interval
        clearInterval(this.interval);
    },
});
