const { page_handler, file_viewer_handler } = require('./anser_utily.js'),
{ result_handler, filter_handler, entry_click_handler } = require('./anser_view_util.js'),
search_form = document.querySelector('.search_block'),
table = document.querySelector('.main-table'),
tbody = table.querySelector('tbody'),
myPage_handler = new page_handler(result_handler,table);

if(typeof _Page == "undefined" || !_Page.view_id){
	console.error("_Page object should have a view_id property");
}
else{
	let queries = { id: _Page.view_id, action:GravityAjax.view_action, security: GravityAjax.view_nonce };

	if(_Page.secret){
		queries.secret = _Page.secret;
	}

	filter_handler(myPage_handler, table);
	file_viewer_handler(tbody);
	entry_click_handler(table);

	myPage_handler.addQueries(queries);

	if(_Page.filters){
		search_form.addEventListener('submit',(event)=>{
			event.preventDefault();

			let input = search_form.elements.s,
			value = input.value,
			search_mode = input.getAttribute('data-search-mode'),
			search_fields = input.getAttribute('data-search-fields'),
			queries;

			if(value.length){
				if(search_fields && search_mode){
					queries = { mode: search_mode };

					search_fields = search_fields.split(' ');

					if(search_fields.length){
						if(search_fields.indexOf('search_all') != -1){
							queries['gv_search'] = value;
						}
						else{
							search_fields.forEach((key)=>{
								queries[key] = value;
							})
						}
					}
					else{
						return console.error("Search_Fileds is empty",search_fields);
					}

					myPage_handler.removeQueries(['filter_workflow_final_status']);
					myPage_handler.load_data(queries,0).then((json_response)=> result_handler(json_response,table)).then(()=>{
						myPage_handler.addQueries(queries);
					});
				}
				else{
					console.error("Attribute search_fields or search_mode should be set in the input element");
				}
			}
		})
	}
	else{
		console.error("No filter on _page constant");
	}

	myPage_handler.load_data().then((json_response)=> result_handler(json_response,table));
}