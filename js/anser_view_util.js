const { page_handler }  = require('./anser_utily.js');

function result_handler(json_response){
	let { entries, total } = json_response.data;

	display_data(entries);
}

function filter_handler(page_handler){
	let filter_root = document.querySelector('.status_filter'),
	links = filter_root.querySelectorAll('a');


	function reset_link_style(){
		links.forEach((link)=>{
			link.classList.remove('active');
		})
	}

	filter_root.onclick = function(event){
		event.preventDefault();

		let target = event.target,
		value = target.getAttribute('data-value');

		if(target.tagName.toLowerCase() == 'a'){
			if(!target.classList.contains('active')){
				reset_link_style();
				target.classList.add('active');
				if(value){
					page_handler.removeQueries([..._Page.filters,'term']);
					page_handler.addQueries({ filter_workflow_final_status: value, mode:'all' });
				}
				else{
					page_handler.removeQueries(["filter_workflow_final_status"]);
				}

				page_handler.load_data({},0).then(result_handler);
			}
		}
	}
}

function display_data(entries){
	let trs = "",
	tbody = document.querySelector('tbody');

	if(tbody){
		entries.forEach((entry)=>{
			let id = entry.id;
			trs += "<tr entry_id='" + id +"'>";

			for(let name in entry){
				if(name == 'id'){
					continue;
				}
				let value = entry[name];
				trs += "<td>";

				if(value.indexOf){
					if(value.indexOf('http') == -1){
						if(name == 'État'){
							let className = "p-1 rounded text-white shadow-md";

							switch(value){
							case 'pending':
								className += " bg-blue-500";
								break;
							case 'rejected':
								className += ' bg-red-500';
								break;
							default:
								className += ' bg-green-500';
							}
							
							trs += "<span class='" + className + "'> "+ value + "</span>";
						}
						else{
							trs += value;
						}
					}
					else{
						let values = JSON.parse(value);
						values.forEach((value)=>{
							trs += "<a href='"+value+"'>";
							let name = value.slice(value.lastIndexOf('/') + 1);
							trs += name;

							trs += "</a>";
						})
					}
				}
				else{
					trs += value.toString();
				}

				trs += "</td>";
			}
			trs += "</tr>";
		})

		tbody.innerHTML = trs;
	}
	else{
		console.error("No tbody found");
	}
}

function display_entry_data(entries,entry_id){
	let modal = document.querySelector('.modal'),
	span_number_node = modal.querySelector('.courrier_number'),
	container = modal.querySelector('classMan'),
	datas = "";

	modal.classList.toggle('hidden');

	modal.onclick = function(event){
		event.preventDefault();

		let target = event.target;

		if(target.classList.contains('close')){
			modal.classList.toggle('hidden');
		}
	}

	entries.forEach((entry)=>{
		datas += "<div>";
		for(let name in entry){
			let value = entry[name];
			datas += "<p>" + name + "</p>";

			if(value.push){
				datas += "<p>";
				value.forEach((v)=>{
					datas += "<span>"+v+"</span>";
				})
				datas += "</p>";
			}
		}

		data += "</div>";
	})

	container.innerHTML = data;
}

function get_entry_id(node,deep){
	let entry_id = node.getAttribute('entry_id');

	if(deep == 0){
		return null;
	}
	if(entry_id){
		return entry_id;
	}
	else{
		return get_entry_id(node.parentNode,deep - 1);
	}
}

function entry_click_handler(){
	let tbody = document.querySelector('tbody');

	if(tbody){
		tbody.addEventListener('click',(event)=>{
			let target = event.target,
			entry_id = get_entry_id(target,5);

			if(entry_id){
				let queries = {
					view_id: 	_Page.view_id,
					entry_id: 	entry_id,
					action: 	GravityAjax.entry,
					nonce: 		GravityAjax.nonce
				},
				myPage_handler = new page_handler(null,queries);


				myPage_handler.load_data().then((json_response)=>{
					let { entries } = json_response;

					display_entry_data(entries);
				})
			}
			else{
				console.log("No entry id found");
			}
		})
	}
	else{
		console.error("No tbody found for registering entry_click_handler");
	}
}

exports.result_handler = result_handler;
exports.filter_handler = filter_handler;
exports.entry_click_handler = entry_click_handler;