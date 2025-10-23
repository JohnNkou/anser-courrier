const { page_handler } = require('./anser_utily.js'),
{ result_handler, entry_click_handler } = require('./anser_flow_utils.js'),
table = document.querySelector('table'),
myPage_handler = new page_handler(result_handler,table);

var search_form = document.querySelector('.search_block');

if(typeof _Page != "undefined"){
    myPage_handler.load_data().then(result_handler);
    entry_click_handler();

    search_form.addEventListener('submit',(event)=>{
        event.preventDefault();

        let form = event.target,
        input = form.elements.s;

        if(input.value.length){
            let limit = myPage_handler.limit,
            queries = { term: input.value }

            myPage_handler.load_data(queries,0,limit).then(result_handler);
            this.load_data(0,this.limit,input.value).then(result_handler);
        }
        else{
            console.warn("Nothing to search for");
        }
    })
}
else{
    console.error("No _Page found");
}