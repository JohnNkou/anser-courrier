const { page_handler } = require('./anser_utily.js'),
{ result_handler, filter_handler } = require('./anser_view_util.js'),
myPage_handler = new page_handler(result_handler),
search_form = document.querySelector('.search_block');

if(typeof _Page != 'undefined' && _Page.view_id){
	filter_handler();
	myPage_handler.addQueries({ id: _Page.view_id });

	search_form.addEventListener('submit',(event)=>{
		event.preventDefault();

		let input = search_form.elements.s,
		value = input.value,
		queries;

		if(value.length){
			queries = {
				term:value,
				filter_2:value,
				filter_4:value,
				mode:'any'
			};

			myPage_handler.load_data(queries,0).then(result_handler).then(()=>{
				myPage_handler.addQueries(queries);
			});
		}
	})

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