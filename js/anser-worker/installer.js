if("serviceWorker" in navigator){
	navigator.serviceWorker.register('/anser-worker.js').then((registration)=>{
		if(registration.active){
			console.log("Service worker is active");
		}

		if(registration.installing){
			console.log("Service worker is installing");
		}
	}).catch(console.error);
}