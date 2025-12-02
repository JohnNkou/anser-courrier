import SWN from 'swn'
import { NETWORK } from 'swn/src/constant.js'

let APP_NAME = 'anser-app-v1',
urls = [
	{ pathname: '/boite-de-reception-5', network_instruction: NETWORK.CUSTOM, handler: (event)=>{
		let request = event.request,
		url = new URL(request.url),
		pathname = url.pathname;

		return caches.open(APP_NAME).then((cache)=> cache.match(pathname)).then((response)=>{
			if(response){
				return response;
			}

			return fetch(event.request).then((response)=>{
				if(response.status == 200){
					return cache.put(response);
				}
				else{
					console.warn("Couldn't cache file because of non 200 status code");

					return response;
				}
			})
		})
	} }
],
myCache = new SWN(APP_NAME,urls);