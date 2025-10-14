function Anser_loader(offset=0,page_size=10, search_term=''){
    let url = new URL(GravityFlowAjax.ajax_url),
    searchParams = url.searchParams;
    
    searchParams.set('action', 'load_gravityflow_inbox');
    searchParams.set('security', GravityFlowAjax.nonce);
    searchParams.set('offset', offset);
    searchParams.set('page_size', page_size);
    
    if(search_term){
        searchParams.set('term', search_term);
    }
    
    return fetch(url, { method:'POST'});
}

var loader = document.querySelector('#loader'),
nextPage = document.querySelector('.nextPage'),
prevPage = document.querySelector('.previousPage'),
search_form = document.querySelector('.search_block');

function display_nativation_handler(page,total){
    if(page == 0){
        prevPage.style.display = 'none';
    }
    else{
        prevPage.style.display = 'inline';
    }
    
    if(page >= (total -1)){
        nextPage.style.display = 'none';
    }
    else{
        nextPage.style.display = 'inline';
    }
}

function page_handler(){
	this.page = 0;
	this.total_page = 0;
	this.limit = 15;

	nextPage.addEventListener('click',(event)=>{
		this.goTo(this.page + 1);
	})

	prevPage.addEventListener('click',(event)=>{
		this.goTo(this.page - 1);
	})

	search_form.addEventListener('submit',(event)=>{
		event.preventDefault();

		let form = event.target,
		input = form.elements.s;

		if(input.value.length){
			this.load_data(0,this.limit,input.value).then(()=>{
				this.page = 0;
				display_nativation_handler(this.page, this.total_page);
			})
		}
		else{
			console.warn("Nothing to search for");
		}
	})

	function toggle_disable(value){
		nextPage.disabled = prevPage.disabled = value;
	}

	this.goTo = (newPage)=>{
		toggle_disable(true);

		this.load_data(newPage * 10).then(()=>{
			this.page = newPage;

			console.log("THE NEW PAGE IS",this.page);

			display_nativation_handler(newPage, this.total_page);
		}).finally(()=>{
			toggle_disable(false);
		})
	}


	this.load_data = function(offset=this.page,limit=this.limit, search_term=''){
		display("Chargements des données...");
		return Anser_loader(offset,limit, search_term).then((response)=> response.json()).then((response)=>{
			this.update_entries_ids(response.data.entries, response.data.field_values);
			this.build_elements(response.data.entries);
			this.total_page = Math.ceil(response.data.total / this.limit);
		}).finally(()=>{
			display("");
		})
	}

	this.update_entries_ids = (entries,field_values)=>{
		entries.forEach((entry)=>{
			let form_id = entry.form_id,
			form = field_values[form_id];

			if(form){
				Object.keys(form).forEach((key)=>{
					let field_id = form[key];
					entry[key] = entry[field_id];
					delete entry[field_id];
				})
			}
			else{
				console.error("No form_id "+ form_id +" found in field_values")
			}
		})
	}

	this.build_elements = (entries)=>{
		var html = "",
		tbody = document.querySelector('tbody');

		if(tbody){
			entries.forEach((entry)=>{
				html += "<tr>";
				html += "<td>" + entry.created_by + "</td>";
				html += "<td>" + entry.workflow_step + "</td>";
				html += "<td>" + entry['numéro'] + "</td>";
				html += "<td>" + entry['objet'] + "</td>";
				html += "<td>" + entry['référence'] + "</td>";
				html += "</tr>";
			})

			tbody.innerHTML = html;
		}
		else{
			console.error("TBODY NOT FOUND");
		}
	}
}

function display(text){
	loader.textContent = text;
}