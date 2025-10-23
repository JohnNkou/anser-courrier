const { page_handler } = require('./anser_utily.js'),
{ result_handler, filter_handler, entry_click_handler } = require('./anser_view_util.js'),
search_form = document.querySelector('.search_block'),
table = document.querySelector('table'),
tbody = table.querySelector('tbody'),
myPage_handler = new page_handler(result_handler,table);

if(typeof _Page == "undefined" || !_Page.view_id){
	console.error("_Page object should have a view_id property");
}
else{
	let queries = { id: _Page.view_id };

	if(_Page.secret){
		queries.secret = _Page.secret;
	}

	filter_handler(myPage_handler);
	entry_click_handler();

	myPage_handler.addQueries(queries);

	if(_Page.filters){
		search_form.addEventListener('submit',(event)=>{
			event.preventDefault();

			let input = search_form.elements.s,
			value = input.value,
			queries;

			if(value.length){
				queries = {
					term:value,
					mode:'any'
				};

				_Page.filters.forEach((filter_name)=>{ queries[filter_name] = value });

				myPage_handler.removeQueries(['filter_workflow_final_status']);
				myPage_handler.load_data(queries,0).then((json_response)=> result_handler(json_response,table)).then(()=>{
					myPage_handler.addQueries(queries);
				});
			}
		})
	}
	else{
		console.error("No filter on _page constant");
	}

	myPage_handler.load_data().then((json_response)=> result_handler(json_response,table));
}