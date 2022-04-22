import Alpine from 'alpinejs';
import axios from 'axios';
import * as msal from '@azure/msal-browser';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import duration from 'dayjs/plugin/duration';
import { nextData, isPaged, initPresence, initProfilePicture, initMsalClient, setPresence, sortList } from './functions';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const updateInterval = 30000;
const presenceBatchMax = 650;

export default ({ tenantid = '', clientid = '', group = '', skipusers = [], showlocation = false, useworker = false, locations = {}, defaultlocation, mapservice = 'openstreetmap', mapsapikey = '' }) => ({
    // init steps
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
            this.startPresenceUpdates(true);
        } catch (error) {
            // signal an error
            this.initerror = true;

            this.notice('error', 'Error during init', error);
        }
    },
    initdone: false,
    initerror: false,

    // list stuff
    list: Alpine.$persist([]),
    filterList(item) {
        // do nothing if setting is not defined or empty
        if (skipusers === undefined || skipusers.length == 0) {
            return true;
        }

        // ensure attribute exists and is a string
        let userPrincipalName = item.userPrincipalName === undefined || item.userPrincipalName === null ? '' : `${item.userPrincipalName}`;
    
        // skip items that are in the lisst
        return !skipusers.includes(userPrincipalName);
    },
    lastupdate: Alpine.$persist(0),
    get lastUpdateText() {
        let lastupdate = dayjs.unix(this.lastupdate);

        return lastupdate.format('LLL');
    },
    presence: Alpine.$persist({}),
    getPresenceById(id) {
        if (this.presence[id] === undefined) {
            this.presence[id] = initPresence();
        }

        return this.presence[id];
    },
    presencelastupdate: Alpine.$persist(0),
    get presenceLastUpdateText() {
        let lastupdate = dayjs.unix(this.presencelastupdate);

        return lastupdate.format('LLL');
    },
    showlocation: showlocation,
    msalClient: initMsalClient(clientid),
    loginRequest: {
        scopes: ['user.read'],
        authority: `https://login.microsoftonline.com/${tenantid}`,
        redirectUri: `${window.location.protocol}//${window.location.host}${window.location.pathname}`
    },
    tokenRequest: {
        scopes: [
            'groupmember.read.all',
            'presence.read.all',
            'user.read.all'
        ],
        authority: `https://login.microsoftonline.com/${tenantid}`,
        redirectUri: `${window.location.protocol}//${window.location.host}${window.location.pathname}`
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
    async graphGetBlob(url, params = undefined) {
        return await this.graph(url, 'get', undefined, params, false, false, 'blob');
    },
    async graphPost(url, data) {
        return await this.graph(url, 'post', data);
    },
    async graph(url, method = 'get', data = undefined, params = undefined, eventual = false, json = false, responseType = 'json') {
        try {
            // get access token
            const response = await this.getToken(this.tokenRequest);

            let baseURL = useworker ? `${window.location.protocol}//${window.location.host}/v1.0/` : 'https://graph.microsoft.com/v1.0/';
            let request = {
                url: url,
                method: method,
                baseURL: baseURL,
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`
                },
                params: params,
                data: data,
                responseType: responseType,
            };
    
            if (eventual) {
                request.headers['ConsistencyLevel'] = 'eventual';
            }
    
            if (json) {
                request.headers['Content-Type'] = 'application/json';
            }
    
            try {
                let response = await axios(request);

                // return immediately if reponse is not JSON
                if (!response.headers['content-type'].startsWith('application/json')) {
                    return response;
                }

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

    // messages and errors
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
    search: '',
    timeout: 0,
    updateInterval: updateInterval,
    async updateList() {
        let url = '/users';
        var self = this;
        var params = {
            '$filter': 'mail ne null',
            '$count': 'true',
            '$select': 'id,displayName,userPrincipalName,businessPhones,jobTitle,mail,officeLocation',
        };

        // if group was set in config then do request for members
        if (group !== undefined && group !== '') {
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
                    self.list = list.filter(self.filterList);
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
                let response = await this.graphGet(url, params, true);
                let list = response.data.sort(sortList);

                // return sorted and filtered list
                this.list = list.filter(this.filterList);
                this.lastupdate = dayjs().unix();
            } catch (error) {
                this.notice('error', 'Error retrieving phone list.', error);

                throw error;
            }
        }

    },
    // updates presence data
    async update() {
        var self = this;
        let list = this.list;
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
                        this.updateInterval = this.updateInterval * 2;

                        console.log(`${dayjs().format()} - Request throttled...update interval increased to ${this.updateInterval} ms`);

                        // break out of loop now
                        break;
                    }
                }
                
                // Some other error
                this.notice('warning', 'Error updating presence', error);

                // finish up with partial results
                break;
            }

            // start loop from end next
            start = end - 1;
        }

        // set lastupdate time
        this.presencelastupdate = dayjs().unix();

        // clear any outstanding message(s)
        this.clearnotice('info');
        this.clearnotice('warning');

        // set up next update as long as we visible
        if (!document.hidden) {
            console.log(`${dayjs().format()} - Next presence update in ${this.updateInterval} ms...`);
            this.timeout = setTimeout(function() {
                self.update();
            }, this.updateInterval);
        } else {
            console.log(`${dayjs().format()} - Skipping next presence update.`);
        }
    },
    updates() {
        // skip this is we haven't started up fully yet
        if (!this.initdone) {
            return;
        }

        // stop/start updates depending on visiblity of page 
        if (!document.hidden) {
            this.startPresenceUpdates();
        }
    },
    startLock: false,
    startPresenceUpdates() {
        var self = this;
        let presencelastupdate = dayjs.unix(this.presencelastupdate);
        let intialUpdateInterval = this.updateInterval;
        
        // basic locking in case event is fired more than once
        if (this.startLock) {
            console.log(`${dayjs().format()} - Start presence already requested...skpping...`);
            return;
        }
        
        // take lock
        this.startLock = true;

        // stop any pending updates just in case
        this.stopPresenceUpdates();

        // set initial presence update interval to next update time if presence was updated recently
        if (presencelastupdate.isAfter(dayjs().subtract(intialUpdateInterval, 'ms'))) {
            let d = dayjs.duration(intialUpdateInterval).subtract(dayjs().unix() - this.presencelastupdate, 'seconds');
            
            // convert duration to milliseconds for setTimeout
            intialUpdateInterval = d.asMilliseconds();
        } else {
            // update overdue
            intialUpdateInterval = 0;
        }

        console.log(`${dayjs().format()} - Starting presence update in ${intialUpdateInterval} ms...`);

        // do initial update
        setTimeout(function() {
            self.update();
        }, intialUpdateInterval);

        // release our lock
        this.startLock = false;
    },
    stopPresenceUpdates() {
        // clear any timeouts
        console.log(`${dayjs().format()} - Stopping pending presence update...`);

        clearTimeout(this.timeout);
    },

    // profile image handling
    profileImage: {},
    async getProfileImageById(id) {
        if (this.profileImage[id] === undefined) {
            this.profileImage[id] = initProfilePicture();
        }

        if (this.profileImage[id].loaded) {
            return;
        }

        try {
            this.profileImage[id].loading = true;

            const response = await this.graphGetBlob(`/users/${id}/photo/$value`);

            let src = URL.createObjectURL(response.data);
            this.profileImage[id] = {
                src: src,
                loaded: true,
            };
        } catch (error) {
            // don't try again if there was an error in the response
            if (error.response) {
                this.profileImage[id].loaded = true;
                console.log(`${dayjs().format()} - ${error}`);
            }
        }
    },
    getProfileImageSrcById(id) {
        if (this.profileImage[id] === undefined) {
            this.profileImage[id] = initProfilePicture();
        }

        return this.profileImage[id].src;
    },
    isProfileImageLoadedById(id) {
        if (this.profileImage[id] === undefined) {
            this.profileImage[id] = initProfilePicture();
        }

        return this.profileImage[id].loaded;
    },

    // item passing
    getItem({ id = '', displayName = '', jobTitle = '', officeLocation = '', businessPhones = [], mail = '' }) {
        return {
            id: id,
            displayName: displayName,
            jobTitle: jobTitle,
            officeLocation: officeLocation,
            businessPhones: businessPhones,
            mail: mail,
            presence: this.getPresenceById(id),
            locations: locations,
            defaultlocation: defaultlocation,
            mapservice: mapservice,
            mapsapikey: mapsapikey,
        };
    },
});
