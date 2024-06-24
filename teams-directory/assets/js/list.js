import Alpine from 'alpinejs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import duration from 'dayjs/plugin/duration';
import { initPresence, initProfilePicture, initGraphClient, setPresence, sortList } from './functions';
import { ResponseType } from '@microsoft/microsoft-graph-client';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const updateInterval = 30000;
const presenceBatchMax = 650;

export default ({ tenantid = '', clientid = '', group = '', skipusers = [], showlocation = false, useworker = false, locations = {}, defaultlocation, mapservice = 'openstreetmap', mapsapikey = '' }) => ({
    // init steps
    async init() {
        // set up client
        try {
            const client = await initGraphClient(tenantid, clientid);
            this.client = client;
        } catch (error) {
            // signal an error
            this.initerror = true;

            this.notice('error', 'Error during init', error);

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

    client: undefined,

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
    client: undefined,
    accountId: '',

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
                    let response = await self.client
                        .api(url)
                        .select(['id', 'displayName', 'userPrincipalName', 'businessPhones', 'jobTitle', 'mail', 'officeLocation'])
                        .filter('mail ne null')
                        .headers({'ConsistencyLevel':'eventual'})
                        .count(true)
                        .get();
                    
                    let responsedata = response.value;

                    // check if data is paged
                    while (true) {
                        console.log(response);
                        if (response['@odata.nextLink'] === undefined) {
                            break;
                        }
    
                        // do another call
                        response = await self.client
                            .api(response['@odata.nextLink'])
                            .headers({'ConsistencyLevel':'eventual'})
                            .get();
    
                        // add to data
                        responsedata.push(...response.value)
                    }
                    let list = responsedata.sort(sortList);

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
                let response = await self.client
                    .api(url)
                    .select('id', 'displayName', 'userPrincipalName', 'businessPhones', 'jobTitle', 'mail', 'officeLocation')
                    .filter('mail ne null')
                    .headers({'ConsistencyLevel':'eventual'})
                    .count(true)
                    .get();

                let responsedata = response.value;

                // check if data is paged
                while (true) {
                    if (response['@odata.nextLink'] === undefined) {
                        break;
                    }

                    // do another call
                    response = await self.client
                        .api(response['@odata.nextLink'])
                        .headers({'ConsistencyLevel':'eventual'})
                        .get();

                    // add to data
                    responsedata.push(...response.value)
                }
                let list = responsedata.sort(sortList);

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
                const response = await self.client
                        .api('/communications/getPresencesByUserId')
                        .post(data);

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
                for (let i = 0; i < response.value.length; i++) {
                    const item = response.value[i];

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

            //const response = await this.graphGetBlob(`/users/${id}/photo/$value`);
            const response = await this.client
                        .api(`/users/${id}/photo/$value`)
                        .responseType(ResponseType.BLOB)
                        .get();

            let src = URL.createObjectURL(response);
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
