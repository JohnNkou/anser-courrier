// js/anser-worker/index.js
var APP_NAME = "anser-worker-v1.1.2";
self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("message", (event) => {
  let data = event.data, type = data.type, url = data.url, status = data.status || 200;
  console.log("RECEIVED MESSAGE", data);
  if (type == "REGISTER") {
    caches.open(APP_NAME).then((cache) => {
      cache.match(url).then((response) => {
        if (!response) {
          fetch(url).then((response2) => {
            if (response2.status == status) {
              cache.put(url, response2);
              event.source.postMessage("URL " + url + " successfully cached");
            } else {
              event.source.postMessage("Server return a status that was not expected. Expected status:" + status + ", Server status:response.status");
            }
          }).catch((error) => {
            console.error(error);
            event.source.postMessage("Error while trying to cache the resource");
          });
        } else {
          console.log("Resource already cached");
        }
      });
    });
  } else {
    console.warn("Unknwon message type", type);
  }
});
self.addEventListener("activate", (event) => {
  console.log("I'm activating");
  event.waitUntil(caches.keys().then((keys) => {
    return Promise.all(keys.map((key) => {
      if (key !== APP_NAME) {
        console.log("REMOVED KEY", key);
        return caches.delete(key);
      }
      return Promise.resolve(true);
    }));
  }).then(() => clients.claim()));
});
self.addEventListener("fetch", (event) => {
  let request = event.request, url = new URL(request.url);
  if (url.pathname.indexOf("/wp-admin") !== 0) {
    event.respondWith(caches.open(APP_NAME).then((cache) => {
      return cache.match(url.pathname).then((response) => {
        if (response) {
          console.log("Serving url", url.pathname);
          return response;
        }
        console.log("Retrieving data", request.url);
        return fetch(request);
      });
    }));
  }
});
