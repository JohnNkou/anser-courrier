function data_loader(){
	var url = new URL(GravityFlowAjax.ajax_url);
	url.searchParams.set('action', GravityFlowAjax.action);
	url.searchParams.set('nonce', GravityFlowAjax.nonce);

	return fetch(url,{ method:'GET' })
}