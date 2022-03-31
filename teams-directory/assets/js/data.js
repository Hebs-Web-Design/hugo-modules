import Alpine from 'alpinejs';
import axios from 'axios';
import * as msal from '@azure/msal-browser';

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
        availability: 'Unknown'
    };
}

function parseAvailability(availability = 'Unknown') {
    switch (availability) {
        case 'Away':
        case 'Available':
        case 'Busy':
        case 'Offline':
        case 'Unknown':
            return {
                description: availability,
                icon: `/img/presence_${availability.toLowerCase()}.png`
            };
        case 'AvailableIdle':
            return {
                description: 'Available',
                icon: `/img/presence_available.png`
            };
        case 'BeRightBack':
            return {
                description: 'Be Right Back',
                icon: `/img/presence_away.png`
            };
        case 'BusyIdle':
            return {
                description: 'Busy',
                icon: `/img/presence_busy.png`
            };
        case 'DoNotDisturb':
            return {
                description: 'Do Not Disturb',
                icon: `/img/presence_dnd.png`
            };
        case 'OutOfOffice':
            return {
                description: 'Out Of Office',
                icon: `/img/presence_oof.png`
            };
        default:
            console.log(`Unhandled availability: ${availability}`);

            return {
                description: 'Unknown',
                icon: `/img/presence_unknown.png`
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
    list: [],
    presence: {},
    message: "",
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
                    this.message = `Error logging in: ${error}`;
                    this.initerror = true;

                    return;
                }
            }
        } catch (error) {
            this.message = `Error logging in: ${error}`;
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
                    this.message = `Error aquiring token: ${error}`;
                    this.initerror = true;
                });
            } else {
                this.message = `Error aquiring token: ${error}`;
                this.initerror = true;
            }
        }).catch(async error => {
            this.message = `Error aquiring token: ${error}`;
            this.initerror = true;
        });

        try {
            let url = '/users';

            // if group was set in config then do request for members
            let group = Alpine.store('config').group;
            if (group !== undefined) {
                url = `/groups/${group}/members`;
            }

            // do intial request
            let response = await graphGet(this.token, url, { '$filter': 'mail ne null', '$count': 'true'}, true);

            // return sorted list
            this.list = sortList(response.data);

            // do initial update
            await this.update();

            // signal data is loaded and init is complete
            this.initdone = true;

            // start update interval
            var self = this;

            this.interval = setInterval(function() {
                self.update();
            }, this.updateInterval);

        } catch (error) {
            this.message = `Error grabbing phone list.`;
            this.initerror = true;
            console.log(error);
        }
    },
    getPresenceDescription(id) {
        return this.getPresence(id, true);
    },
    getPresence(id, description = false) {
        // handle unknown presence
        if (this.presence[id] === undefined) {
            this.presence[id] = initPresence();
        }

        let presence = parseAvailability(this.presence[id].availability);
        
        if (description) {
            return presence.description;
        }

        return presence.icon;
    },
    async update() {
        let list = this.filteredList;

        let start = 0;
        let end = 0;
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
                // do request
                const response = await graphPost(this.token, '/communications/getPresencesByUserId', data);

                // if no error then possibly reduce the interval of updates
                if (this.updateInterval > updateInterval) {
                    this.updateInterval = this.updateInterval / 1.5;

                    // don't go below smallest interval
                    if (this.updateInterval > updateInterval) {
                        this.updateInterval = updateInterval;
                    }

                    // clear current interval
                    clearInterval(this.interval);

                    // start update interval again
                    var self = this;
                    this.interval = setInterval(function() {
                        self.update();
                    }, this.updateInterval);
                }

                // update presence from response
                for (let i = 0; i < response.data.length; i++) {
                    const item = response.data[i];

                    this.presence[item.id].availability = item.availability;
                }
            } catch (error) {
                // handle if response was throttled
                if (error.response.status == 429) {
                    // clear current interval
                    clearInterval(this.interval);

                    // double the interval
                    this.interval = this.interval * 2;

                    // start over
                    var self = this;
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
});
