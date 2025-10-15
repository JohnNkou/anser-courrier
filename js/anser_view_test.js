function data_loader(limit=10,offset=0){
	var url = new URL(GravityViewAjax.ajax_url);
	url.searchParams.set('action', GravityViewAjax.action);
	url.searchParams.set('nonce', GravityViewAjax.nonce);
	url.searchParams.set('limit',limit);
	url.searchParams.set('offset',offset);

	return fetch(url,{ method:'GET' })
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

				if(value.indexOf('http') == -1){
					trs += value;
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