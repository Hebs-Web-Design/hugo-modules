export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        
        if (url.pathname.startsWith('/v1.0/')) {
            // handle api reequests
            let response;
            let cache = caches.default;
            let cacheKey;
            
            if (request.method == 'POST') {
                let url = new URL(request.url);
                let body = await request.clone().text();
                let hash = await sha256(body);

                // append hash for caching
                url.pathname = url.pathname + hash;

                // Convert to a GET to be able to cache
                cacheKey = new Request(url, {
                    headers: request.headers,
                    method: 'GET'
                });

                // try to find item in cache
                response = await cache.match(cacheKey);
            } else if (request.method == 'GET') {
                response = await cache.match(request);

                cacheKey = request;
            }

            // make request to origin and attempt to cache
            if (!response) {
                let url = new URL(request.url);
                url.hostname = 'graph.microsoft.com';

                response = await fetch(url, request);
                
                try {
                    // tweak response headers to allow caching for 30 seconds
                    let cacheResponse = response.clone();
                    cacheResponse.headers.set('cache-control', 'max-age=30');

                    // save to cache if possible
                    context.waitUntil(cache.put(cacheKey, cacheResponse));
                } catch (error) {
                    console.log(error);
                }
            }

            // return back to browser
            return response;
        }

        // Otherwise, serve the static assets.
        // Without this, the Worker will error and no assets will be served.
        return env.ASSETS.fetch(request);
    },
};

async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);
  
    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
  
    // convert bytes to hex string
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    
    return hashHex;
  }
