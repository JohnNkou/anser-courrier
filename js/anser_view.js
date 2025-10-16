const { page_handler } = require('./anser_utily.js'),
{ result_handler } = require('./anser_view_util.js'),
myPage_handler = new page_handler(result_handler),
search_form = document.querySelector('.search_block');

search_form.addEventListener('submit',(event)=>{
	event.preventDefault();

	let input = search_form.elements.s,
	value = input.value,
	queries;

	if(value.length){
		queries = {
			term:value,
			filter_2:value,
			filter_5:value,
			filter_6:value,
			mode:'any'
		};

		myPage_handler.load_data(queries,0).then(result_handler);
	}
})

myPage_handler.load_data().then(result_handler);