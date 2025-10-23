const { page_handler } = require('./anser_utily.js'),
{ result_handler, entry_click_handler } = require('./anser_flow_utils.js'),
table = document.querySelector('table'),
tbody = table.querySelector('tbody'),
myPage_handler = new page_handler((json_response)=>result_handler(json_response,tbody),table);

var search_form = document.querySelector('.search_block');

if(typeof _Page != "undefined"){
    myPage_handler.load_data().then((json_response)=> result_handler(json_response,table));
    entry_click_handler(table);

    search_form.addEventListener('submit',(event)=>{
        event.preventDefault();

        let form = event.target,
        input = form.elements.s;

        if(input.value.length){
            let limit = myPage_handler.limit,
            queries = { term: input.value }

            myPage_handler.load_data(queries,0,limit).then((json_response)=> result_handler(json_response,table));
            //this.load_data(0,this.limit,input.value).then(result_handler);
        }
        else{
            console.warn("Nothing to search for");
        }
    })
}
else{
    console.error("No _Page found");
}