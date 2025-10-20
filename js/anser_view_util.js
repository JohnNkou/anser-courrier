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

function build_link(src){
	let resource_name = src.slice(src.lastIndexOf('/') + 1),
	a = "<a src='" + src + "'>" + resource_name + "</a>";

	return a;
}

function has_index(keys,name){
	let length = keys.length;

	while(length--){
		if(name.toLowerCase().indexOf(keys[length]) != -1){
			return true;
		}
	}

	return false;
}

function is_header(name){
	let keys = ["saumis","date","heure"];

	return has_index(keys,name);
}

function is_contact(name){
	let keys = ["téléphone","e-mail","adresse"];

	return has_index(keys,name);
}

function is_information(name){
	let keys = ["numéro","référence","expéditeur","objet","commentaire"];

	return has_index(keys,name);
}

function is_documents(name){
	let keys = ["scanné","jointe"];

	return has_index(keys,name);
}

function display_entry_data(entry,entry_id){
	let modal = document.querySelector('.modal'),
	span_number_node = modal.querySelector('.courrier_number'),
	container = modal.querySelector('.classMan'),
	headers = [],
	informations = [],
	contacts = [],
	documents = [],
	autres = [],
	datas = "";

	span_number_node.textContent = entry_id;

	modal.classList.toggle('hidden');

	modal.onclick = function(event){
		event.preventDefault();

		let target = event.target;

		if(target.classList.contains('close')){
			modal.classList.toggle('hidden');
		}
	}

	for(let entry_name in entry){
		let value = entry[entry_name],
		current_slot;

		if(is_information(entry_name)){
			current_slot = informations;
		}
		else if(is_header(entry_name)){
			current_slot = headers;
		}
		else if(is_contact(entry_name)){
			current_slot = contacts;
		}
		else if(is_documents(entry_name)){
			current_slot = documents;
		}
		else{
			current_slot = autres;
		}

		current_slot.push("<div><p>" + entry_name + "</p>");

		if(value.push || Object.prototype.toString.call(value) == Object.prototype.toString.call({})){
			current_slot.push("<p>");
			if(value.push){
				value.forEach((v)=>{
					if(v.indexOf('http') != -1){
						v = build_link(v);
					}

					current_slot.push("<span>" + v + "</span>");
				})
			}
			else{
				for(let name in value){
					if(value.indexOf('http') != -1){
						value = build_link(value);
					}

					current_slot.push("<span>" + value + "</span>");
				}
			}

			current_slot.push("</p></div>");
		}
		else{
			current_slot.push("<p>" + value + "</p>");
		}
	}

	container.innerHTML += "<div class='information'>" + headers.join("") + "</div>";
	container.innerHTML += "<div class='card'>" + informations.join("") + "</div>";
	container.innerHTML += "<div class='card'>" + contacts.join("") + "</div>";
	container.innerHTML += "<div class='card'>" + documents.join("") + "</div>";
	container.innerHTML += "<div class='card'>" + autres.join("") + "</div>";
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
					let { entry } = json_response.data;

					display_entry_data(entry, entry_id);
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