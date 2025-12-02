// js/anser-worker/index.js
var APP_NAME = "anser-worker-v1.3";
self.addEventListener("message", (event) => {
  let data = event.data;
  console.log("THE DATA SENT IS", data);
  console.log("FROM APP_NAME", APP_NAME);
  event.source.postMessage("Received your message cuttie");
});
