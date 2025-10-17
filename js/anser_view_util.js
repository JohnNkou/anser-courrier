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
			trs += "<tr>";

			for(let name in entry){
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

exports.result_handler = result_handler;

exports.filter_handler = filter_handler;