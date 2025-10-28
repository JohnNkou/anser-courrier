const { page_handler } = require('./anser_utily.js'),
{ result_handler, entry_click_handler, onglet_handler } = require('./anser_flow_utils.js'),
{ result_handler:result_handler_2, entry_click_handler:entry_click_handler_2 } = require('./anser_view_util.js'),
table = document.querySelector('.main-table'),
second_table = document.querySelector('.second-table'),
tbody = table.querySelector('tbody'),
counts = document.querySelectorAll('.onglets .count'),
navigationHelper = document.querySelector('.navigationHelper p'),
myPage_handler = new page_handler((json_response)=>result_handler(json_response,table),table),
myPage_handler_2 = new page_handler((json_response)=> result_handler_2(json_response,second_table),second_table);

var search_form = document.querySelector('.search_block');

if(typeof _Page != "undefined"){
    myPage_handler.addQueries({ action: GravityAjax.flow_action, security:GravityAjax.flow_nonce });
    myPage_handler_2.addQueries({ id: _Page.view_id, secret: _Page.secret, action: GravityAjax.view_action, security:GravityAjax.view_nonce });
    myPage_handler.load_data().then((json_response)=> result_handler(json_response,table)).then(()=>{
        if(counts.length){
            counts[0].textContent = myPage_handler.total;

            navigationHelper.textContent = "1-"+ myPage_handler.limit + " de "+ myPage_handler.total;
        }
        else{
            console.error("NO COUNTS NODE FOUND");
        }
    });
    myPage_handler_2.load_data().then((json_response)=> result_handler_2(json_response,second_table)).then(()=>{
        if(counts.length){
            counts[1].textContent = myPage_handler_2.total;
        }
    });

    myPage_handler.onNavigation((offset, new_limit)=>{
        offset =  offset + 1;

        navigationHelper.textContent = offset + "-" + new_limit + " de "+ myPage_handler.total;
    });
    myPage_handler_2.onNavigation((offset, new_limit)=>{
        offset = offset + 1;

        navigationHelper.textContent = offset + "-" + new_limit + " de "+ myPage_handler_2.total;
    })

    entry_click_handler(table);
    entry_click_handler_2(second_table);
    onglet_handler([table,second_table]);

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