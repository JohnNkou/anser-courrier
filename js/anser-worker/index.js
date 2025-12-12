const APP_NAME = 'anser-worker-v1.1.1';

self.addEventListener('message',(event)=>{
	let data = event.data,
	type = data.type,
	url = data.url,
	status = data.status || 200;

	if(type == 'REGISTER'){
		caches.open(APP_NAME).then((cache)=>{
			cache.match(url).then((response)=>{
				if(!response){
					fetch(url).then((response)=>{
						if(response.status == status){
							cache.put(url,response);

							event.source.postMessage("URL "+url + " successfully cached");
						}
						else{
							event.source.postMessage("Server return a status that was not expected. Expected status:"+status+", Server status:response.status");
						}
					}).catch((error)=>{
						console.error(error);
						event.source.postMessage("Error while trying to cache the resource");
					})
				}
				else{
					console.log("Resource already cached");
				}
			})
		})
	}
	else{
		console.warn("Unknwon message type",type);
	}
})

self.addEventListener('fetch',(event)=>{
	let request = event.request,
	url = new URL(request.url);

	event.respondWith(caches.open(APP_NAME).then((cache)=>{
		return cache.match(url.pathname).then((response)=>{
			if(response){
				console.log("Serving url",url.pathname);
				return response;
			}

			console.log("Retrieving data",request.url);

			return fetch(request.url).then((response)=>{
				return new Response(response.body,{
					status: response.status,
					statusText: response.statusText,
					headers: response.headers
				})
			});
		})
	}))
})