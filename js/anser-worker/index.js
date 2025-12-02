self.addEventListener('message',(event)=>{
	let data = event.data;

	console.log("THE DATA SENT IS",data);

	event.source.postMessage("Received your message cuttie");
})