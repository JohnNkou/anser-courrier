function data_loader(){
	var url = new URL(GravityViewAjax.ajax_url);
	url.searchParams.set('action', GravityViewAjax.action);
	url.searchParams.set('nonce', GravityViewAjax.nonce);

	return fetch(url,{ method:'GET' })
}