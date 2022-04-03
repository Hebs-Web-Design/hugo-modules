export async function onRequest(context) {
    const {
        request, // same as existing Worker API
        env, // same as existing Worker API
        params, // if filename includes [id] or [[path]]
        waitUntil, // same as ctx.waitUntil in existing Worker API
        next, // used for middleware or to fetch assets
        data, // arbitrary space for passing data between middlewares
      } = context;

      // take existing url and modify it
      var url = new URL(request.url);
      url.hostname = "graph.microsoft.com";

      // perform response
      let response = await fetch(url, request);
      return response;
}
