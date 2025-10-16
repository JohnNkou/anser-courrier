exports.result_handler = function(json_response){
	let { entries, total } = json_response.data;

	display_data(entries);
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