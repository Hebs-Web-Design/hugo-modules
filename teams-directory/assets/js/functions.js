import { PublicClientApplication, InteractionType } from "@azure/msal-browser";
import { AuthCodeMSALBrowserAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";
import { Client } from "@microsoft/microsoft-graph-client";

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

function initProfilePicture() {
    return {
        loaded: false,
        src: '/directory/img/profile_placeholder.png',
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

async function initGraphClient(tenantid, clientId) {
    const scopes = [
        'user.read',
        'groupmember.read.all',
        'presence.read.all',
        'user.read.all'
    ];
    const msalClient = initMsalClient(tenantid, clientId);

    // try to get account from cache
    const authResult = await msalClient.acquireTokenSilent({
        scopes: scopes,
    });

    // redirect to get account
    if (!authResult.account) {
        authProvider.acquireTokenRedirect({
            scopes: scopes,
        })
    }
    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(msalClient, {
        account: authResult.account,
        interactionType: InteractionType.Redirect,
        scopes: scopes,
    });

    return Client.initWithMiddleware({authProvider});
}

function initMsalClient(tenantid, clientId) {
    const msalConfig = {
        auth: {
          clientId: clientId,
          authority: `https://login.microsoftonline.com/${tenantid}`,
          redirectUri: `${window.location.protocol}//${window.location.host}${window.location.pathname}`
        },
        cache: {
            cacheLocation: 'sessionStorage',
        },
    };
    
    const msalClient = new PublicClientApplication(msalConfig);
    msalClient.initialize();
    return msalClient;
}

function sortList(a, b) {
    let name = 'displayName';
    let asplit = [''];
    let bsplit = [''];

    // handle missing data and split appropriately
    if (a[name] !== undefined && a[name] !== null) {
        asplit = a[name].split(' ');
    }
    if (b[name] !== undefined & b[name] !== null) {
        bsplit = b[name].split(' ');
    }

    // compare values
    let x = (asplit.length > 1) ? asplit.slice(1, asplit.length).join(' ').toLowerCase() : asplit[0].toLowerCase();
    let y = (bsplit.length > 1) ? bsplit.slice(1, bsplit.length).join(' ').toLowerCase() : bsplit[0].toLowerCase();

    // return results
    if (x < y) { return -1; }
    if (x > y) { return 1; }
    return 0;
}

export { nextData, isPaged, initPresence, initProfilePicture, initGraphClient, setPresence, sortList };