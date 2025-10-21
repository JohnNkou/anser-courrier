const { page_handler } = require('./anser_utily.js'),
{ result_handler, filter_handler, entry_click_handler } = require('./anser_view_util.js'),
myPage_handler = new page_handler(result_handler),
search_form = document.querySelector('.search_block');

if(typeof _Page != 'undefined' && _Page.view_id){
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
				myPage_handler.load_data(queries,0).then(result_handler).then(()=>{
					myPage_handler.addQueries(queries);
				});
			}
		})
	}
	else{
		console.error("No filter on _page constant");
	}

	myPage_handler.load_data().then(result_handler);
}
else{
	if(typeof _Page == "undefined"){
		alert("_Page is undefined");
	}
	if(!_Page.view_id){
		alert("No view_id found");
	}
}