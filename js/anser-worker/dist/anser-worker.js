// js/anser-worker/index.js
var APP_NAME = "anser-worker-v1.1.24";
var COOKIE_NAME = "u-e";
self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("message", (event) => {
  let data = event.data, type = data.type, url = data.url, cookie_name = COOKIE_NAME, status = data.status || 200;
  if (!(url instanceof URL)) {
    url = new URL(url);
  }
  console.log("RECEIVED MESSAGE", data);
  if (type == "REGISTER") {
    let sKeys = [];
    url.searchParams.forEach((value, key) => {
      if (key != cookie_name) {
        sKeys.push(key);
      }
    });
    sKeys.forEach((key) => url.searchParams.delete(key));
    cookieStore.get(cookie_name).then((data2) => {
      console.log("Finished verifing cookie information");
      if (data2) {
        url.searchParams.set(cookie_name, data2.value);
      }
    }).finally(() => {
      console.log("Going after the duck");
      caches.open(APP_NAME).then((cache) => {
        cache.match(url).then((response) => {
          if (!response) {
            fetch(url).then((response2) => {
              if (response2.status == status) {
                console.log("PUTTING URL TO CACHE", url);
                cache.put(url, response2);
                event.source.postMessage("URL " + url + " successfully cached");
              } else {
                console.log("STATUS DIFFERENT THEN THE GIVEN", response2, status);
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
  let request = event.request, url = new URL(request.url), local_url = new URL(request.url);
  if (!request.headers.get("no-cache")) {
    if (url.pathname.indexOf("/wp-admin") !== 0) {
      event.respondWith(cookieStore.get(COOKIE_NAME).then((data) => {
        if (data) {
          local_url.searchParams.set(COOKIE_NAME, data.value);
        }
        return caches.open(APP_NAME).then((cache) => {
          let sKeys = [];
          local_url.searchParams.forEach((value, key) => {
            if (key != COOKIE_NAME) {
              sKeys.push(key);
            }
          });
          sKeys.forEach((key) => local_url.searchParams.delete(key));
          return cache.match(local_url.href).then((response) => {
            if (response) {
              console.log("Serving url", url);
              return response;
            }
            console.log("Retrieving data", request.url);
            return fetch(request);
          });
        });
      }));
    }
  }
});
