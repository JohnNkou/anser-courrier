const { page_handler, display_information_modal, toggle_loader, display_pdfviewer, uploader, display_formCreator } = require('./anser_utily.js');
const { Attributes, is_object, guid, generateUniqueID } = require('./lib.js');

function result_handler(json_response, table) {
  let { entries, field_values } = json_response.data;
  build_elements(table, entries);
}

function build_elements(table, entries) {
  var html = "", tbody = table.querySelector("tbody");
  if (tbody) {
    entries.forEach((entry, i) => {
      html += "<tr numero='" + entry["numéro"] + "' id='" + entry.id + "' form_id='" + entry.form_id + "'>";
      html += "<td " + (i == 0 ? 'width="20%"' : "") + "'>            <div class='reception-info'>            <p class='creator'>" + (entry["expéditeur"] || "Inconnu") + "</p>            <p class='numero'>" + (entry["numéro"] || "") + "</p>            </div>  </td>";
      html += "<td " + (i == 0 ? 'width="50%"' : "") + ">" + (entry["objet"] || "") + "</td>";
      html += "<td class='text-center'><span class='step-status rounded'>" + entry["workflow_step"] + "</span></td>";
      html += "<td class='text-center'>" + (entry["date"] || "") + "</td>";
      html += "</tr>";
    });
    tbody.innerHTML = html;
  } 
  else {
    console.error("TBODY NOT FOUND");
  }
}

function setAttribute(node,atts){
	atts.forEach((values,attName)=>{
		values.forEach((value)=>{
			if(attName == 'class'){
				node.classList.add(value);
			}
			else{
				node.setAttribute(attName,value);
			}
		})
	})
}

function build_index_class(inbox_index){
	return 'i'+inbox_index;
}

function build_entry_element({ inbox, inputAtts, atts, failedAtts, inbox_index, entry_data }){
	switch(inbox.type){
		case 'section':{
			console.log('I am IN A SECTION BEAUTY');
			let section = document.createElement('section'),
			h5 = document.createElement('h5'),
			div_content = document.createElement('div');
			h5.className = 'title';
			h5.textContent = inbox.label;

			setAttribute(section,atts);
			section.appendChild(h5);
			section.appendChild(div_content);
			return section;
			break;
		}
		case "html":{
			let div = document.createElement('div'),
			label = document.createElement('label');

			label.textContent = inbox.label;

			atts.append('class','card');
			div.appendChild(label);
			setAttribute(div,atts);
			return div;
			break;
		}
		case "text":{
			let div = document.createElement('div'),
			label = document.createElement('label'),
			p = document.createElement('p');

			label.textContent = inbox.label;

			if(inbox.value.indexOf('<') == -1){
				p.textContent = inbox.value;
			}
			else{
				p.innerHTML = inbox.value;
			}

			atts.append('class','card');
			atts.append('class', inbox_index);
			setAttribute(div,atts);
			div.appendChild(label); div.appendChild(p);
			return div;
			break;
		}
		case "hidden":{
			let div = document.createElement('div'),
			input = document.createElement('input');

			input.type = 'hidden';

			atts.append('class','hidden');
			inputAtts.set('index', inbox_index);
			setAttribute(div,atts);
			setAttribute(input,inputAtts);
			div.appendChild(input);

			return div;
			break;
		}
		case 'button':{
			let div = document.createElement('div'),
			button = document.createElement('button');

			button.textContent = inbox.label;

			atts.append('class','card');
			inputAtts.set('index', inbox_index);
			inputAtts.set('type', inbox.buttonType);
			inputAtts.append('class', inbox.class);
			setAttribute(div,atts);
			setAttribute(button,inputAtts);
			div.appendChild(button);

			return div;
			break;
		}
		case 'radio':{
			let div = document.createElement('div'),
			label = document.createElement('label'),
			input = document.createElement('input');

			label.textContent = inbox.label;
			label.setAttribute('for', inbox.name);

			if(inbox.checked){
				inputAtts.set('checked','checked');
			}

			atts.append('class','card');
			inputAtts.set('type','radio');
			setAttribute(div,atts);
			setAttribute(input, inputAtts);
			div.appendChild(label);
			div.appendChild(input);

			return div;
			break;
		}
		case 'submit':{
			let div = document.createElement('div'),
			button = document.createElement('button');

			button.textContent = inbox.value;

			atts.append('class','card');
			inputAtts.set('index', inbox_index);
			inputAtts.append('class','btn-success');
			inputAtts.set('type','submit');
			setAttribute(div,atts);
			setAttribute(button,inputAtts);
			div.appendChild(button);

			return div;
			break;
		}
		case "edit":
      value = get_field_value(inbox);
      inputAtts.set("value", value);
      inputAtts.set("placeholder", inbox.placeholder);
      switch (inbox.fieldType) {
        case "text":
        case "product":
        case 'date':{
        	let div = document.createElement('div'),
        	div_error = document.createElement('div'),
        	input = document.createElement('input'),
        	label = document.createElement('label'),
        	p = document.createElement('p');

        	label.textContent = inbox.label;

        	atts.append("class", "card");
        	atts.append('class', build_index_class(inbox_index));
          inputAtts.set("type", inbox.fieldType);
          inputAtts.set("placeholder", inbox.placeholder);

          if(inbox.fieldType == 'product'){
          	inputAtts.set('type','text');
          }

          setAttribute(div,atts);
          setAttribute(input, inputAtts);
          setAttribute(div_error, failedAtts);
          p.appendChild(input);
          div.appendChild(label);
          div.appendChild(p);
          div.appendChild(div_error);

          return div;
          break;
        }
        case "textarea":{
        	let div = document.createElement('div'),
        	label = document.createElement('label'),
        	p = document.createElement('p'),
        	textarea = document.createElement('textarea'),
        	div_error = document.createElement('div');

        	label.textContent = inbox.label;
        	textarea.textContent = value;

        	atts.append("class", "card");
        	atts.append('class', 'span_textarea');
        	atts.append('class', build_index_class(inbox_index));
          inputAtts.remove("value");
          setAttribute(div,atts);
          setAttribute(textarea, inputAtts);
          setAttribute(div_error, failedAtts);
          p.appendChild(textarea);
          div.appendChild(label);
          div.appendChild(p);
          div.appendChild(div_error);

          return div;
          break;
        }
        case "radio":{
        	let div = document.createElement('div'),
        	label = document.createElement('label'),
        	p = document.createElement('p'),
        	div_error = document.createElement('div');

        	inbox.choices.forEach((choice) => {
        		let span = document.createElement('span'),
        		label = document.createElement('label'),
        		input = document.createElement('input');

            if (choice.value == value) {
              input.setAttribute('checked','checked')
            }

            label.textContent = choice.text;
            input.type = 'radio';
            input.name = 'input_' + inbox.id;
            input.value = choice.value;
            
            span.appendChild(label);
            span.appendChild(input);
            p.appendChild(span);
          });

          label.textContent = inbox.label;

        	atts.append("class", "card");
        	atts.append('class', inbox_index);
        	setAttribute(div,atts);
        	setAttribute(div_error, failedAtts);
        	div.appendChild(label);
        	div.appendChild(p);
        	div.appendChild(div_error);

          return div;
          break;
        }
        case "checkbox":{
        	let div = document.createElement('div'),
        	label = document.createElement('label')
        	div_2 = document.createElement('div'),
        	div_error = document.createElement('div');

        	inbox.choices.forEach((choice) => {
        		let p = document.createElement('p'),
        		label = document.createElement('label'),
        		input  = document.createElement('input'),
            checked = value.indexOf(choice.value) != -1, 
            id = inbox.inputs.filter((input) => {
              return input.label == choice.value;
            })[0]["id"];

            if (checked) {
            	input.setAttribute('checked','checked');
            }

            input.setAttribute('id',inbox.id);

            label.textContent = choice.text;
            input.name = "input_" + id;
            input.value  = choice.value;
            input.type = 'checkbox';

            p.appendChild(label);
            p.appendChild(input);
            div_2.appendChild(p);
          });

          label.textContent = inbox.label;

        	atts.append("class", "card");
        	atts.append('class', build_index_class(inbox_index));
        	setAttribute(div,atts);
        	setAttribute(div_error,atts);
        	div.appendChild(label);
        	div.appendChild(div_2);
        	div.appendChild(div_error);

          return div;
          break;
        }
        case "select":{
        	let div = document.createElement('div'),
        	label = document.createElement('label'),
        	select = document.createElement('select'),
        	div_error = document.createElement('div');

        	label.textContent = inbox.label;

        	[{ value:'', text:'---' }].concat(inbox.choices).forEach((choice) => {
            let option = document.createElement('option'),
            selected = choice.value == value;

            if (selected) {
            	option.setAttribute('selected','selected');
            }
            option.value = choice.value;
            option.textContent = choice.text;

            select.appendChild(option);
          });

        	atts.append("class", "card");
        	atts.append('class', build_index_class(inbox_index));
          inputAtts.remove("value");
          inputAtts.remove("placeholder");
          setAttribute(div,atts);
          setAttribute(select,inputAtts);
          setAttribute(div_error,failedAtts);
          div.appendChild(label);
          div.appendChild(select);
          div.appendChild(div_error);

          return div;
          break;
        }
        case "workflow_assignee_select":{
        	let div = document.createElement('div'),
        	label = document.createElement('label'),
        	select = document.createElement('select'),
        	div_error = document.createElement('div');

        	label.textContent = inbox.label;
        	select.innerHTML = inbox.value;

        	atts.append("class", "card");
        	atts.append('class', build_index_class(inbox_index));
          inputAtts.remove("value");
          inputAtts.remove("placeholder");
          setAttribute(div,atts);
          setAttribute(select,inputAtts);
          setAttribute(div_error,failedAtts);
          div.appendChild(label);
          div.appendChild(select);
          div.appendChild(div_error);

          return div;
          break;
        }
        case "workflow_multi_user":{
        	let div = document.createElement('div'),
        	label = document.createElement('label'),
        	select = document.createElement('select'),
        	div_error = document.createElement('div_error');

        	label.textContent = inbox.label;
        	select.setAttribute('multiple','true');

        	inputAtts.set('name', 'input_'+inbox.id+'[]');

        	try {
            inbox.leaf_value = JSON.parse(inbox.leaf_value);
          } 
          catch (error) {
            inbox.leaf_value = [];
          }
          
          inbox.choices.forEach((choice) => {
            let option = document.createElement('option'),
            selected = inbox.leaf_value.indexOf(choice.value) != -1 ? "selected" : "";

            if(selected){
            	option.setAttribute('selected','true');
            }
            option.value = choice.value;
            option.textContent = choice.text;

            select.appendChild(option);
          });

        	atts.append("class", "card");
        	atts.append('class', build_index_class(inbox_index));
          inputAtts.remove("value");
          inputAtts.remove("placeholder");
          setAttribute(div,atts);
          setAttribute(select, inputAtts);
          setAttribute(div_error,failedAtts);
          div.appendChild(label);
          div.appendChild(select);
          div.appendChild(div_error);

          return div;
          break;
        }
        case "fileupload":{
        	let div = document.createElement('div'),
        	label = document.createElement('label'),
        	input = document.createElement('input'),
        	div_input = document.createElement('div'),
        	div_container = document.createElement('div'),
        	div_2 = document.createElement('div'),
        	div_list = document.createElement('div'),
        	div_error = document.createElement('div'),
        	fileDivAtts = new Attributes();

        	label.textContent = inbox.label;
        	div_2.innerHTML = inbox.value;

        	console.log("I'm OKAY GOMAN");

        	atts.append("class", "card");
        	atts.append('class', build_index_class(inbox_index));
          inputAtts.remove("value");
          inputAtts.remove("placeholder");
          inputAtts.set("type", "file");
          inputAtts.set("class","cursor-pointer");
          fileDivAtts.append('class','file_detail_'+inbox.id);
          setAttribute(div,atts);
          setAttribute(input, inputAtts);
          setAttribute(div_list, fileDivAtts);
          setAttribute(div_error,failedAtts);
          div.appendChild(label);
          div_input.appendChild(input);
          div_container.appendChild(div_input);
          div_container.appendChild(div_2);
          div_container.appendChild(div_list);
          div.appendChild(div_container);

          return div;
          break;
        }
        case "date":{
        	let div = document.createElement('div'),
        	label = document.createElement('label'),
        	input = document.createElement('input');

        	label.textContent = inbox.label;

        	atts.append("class", "card");
        	atts.append('class', build_index_class(inbox_index));
        	setAttribute(div,atts);
        	setAttribute(input,inputAtts);
        	div.appendChild(label);
        	div.appendChild(input);

        	return div;
          break;
        }
	      case 'form':{
	      	let div = document.createElement('div'),
	      	label = document.createElement('label'),
	      	button = document.createElement('button'),
	      	table = document.createElement('table'),
	      	thead = document.createElement('thead'),
	      	tbody = document.createElement('tbody'),
	      	input = document.createElement('input'),
	      	tr = document.createElement('tr'),
	      	innerField = inbox.gpfnfields;

	      	innerField.forEach((field)=>{
	      		if(parseInt(field.id)){
	      			let th = document.createElement('th');
		      		th.textContent = field.label;

		      		tr.appendChild(th);
	      		}
	      	})

	      	tr.appendChild(document.createElement("th"));

	      	label.textContent = inbox.label;
	      	button.textContent = "Ajouter";
	      	input.type = 'hidden';
	      	input.name = 'input_' + inbox.id;

	      	atts.append('class','card');
	      	atts.append('class','span_table');
	      	atts.append('class', build_index_class(inbox_index));

	      	setAttribute(div,atts);
	      	thead.appendChild(tr);
	      	table.appendChild(thead);
	      	table.appendChild(tbody);
	      	div.appendChild(table);
	      	div.appendChild(label);
	      	div.appendChild(button);
	      	div.appendChild(input);

	      	tbody.onclick = function(event){
	      		event.preventDefault();

	      		let target = event.target,
	      		action = target.getAttribute('data-action'),
	      		entryId = target.getAttribute('entryId');

	      		if(action == 'delete'){
	      			let f = new FormData();

	      			f.append('action','gpnf_delete_entry');
	      			f.append('nonce', inbox.delete_nonce);
	      			f.append('gpnf_entry_id', entryId);
	      			f.append('gpnf_nested_form_field_id',inbox.gpfnfForm);
	      			console.log("Received delete action. Cool");
	      			console.log("EntryId",entryId);

	      			toggle_loader("Suppression en cour");

	      			fetch(inbox.action_url,{
	      				method:'POST',
	      				body: f
	      			}).then((response)=>{
	      				if(response.status == 200){
	      					response.json().then((data)=>{
	      						if(data.success){
	      							let parent;
	      							display_information_modal("Suppression effectué");

	      							while(parent = target.parentNode){
	      								if(parent.tagName.toLowerCase() == "tr"){
	      									tbody.removeChild(parent);
	      									break;
	      								}
	      							}
	      						}
	      						else{
	      							display_information_modal("La suppression n'a pas pu être effectuée");
	      						}
	      					}).catch((error)=>{
	      						display_information_modal("La suppression n'a pas pu être effectuée");
	      					})
	      				}
	      				else{
	      					console.error("Bad status code",response.status);
	      					display_information_modal("La suppression n'a pas pu être effectuée");

	      					response.json().then(console.warn).catch(console.error);
	      				}
	      			}).catch((error)=>{
	      				console.error("Error",error);

	      				display_information_modal("Une erreur est survenue lors de la suppression");
	      			}).finally(()=>{
	      				toggle_loader();
	      			})
	      		}
	      	}

	      	if(inbox.entries && inbox.entries.forEach){
	      		let ids = [];

	      		inbox.entries.forEach((entry)=>{
	      			let id = entry.id,
	      			tr = document.createElement('tr'),
	      			delete_link = document.createElement('a');

	      			ids.push(id);
	      			delete_link.setAttribute('entryId',id);
	      			delete_link.setAttribute('data-action','delete');
	      			delete_link.href = "#";
	      			delete_link.textContent = "Supprimer";

	      			tr.setAttribute('entryId',id);

	      			inbox.gpfnfields.forEach(build_inner_table(tr, entry));
	      			tr.appendChild(delete_link);

	      			tbody.appendChild(tr);
	      		})

	      		input.value = ids.join(',');
	      	}

	      	function build_inner_table(tr,fieldValues){
	      		return function(field){
	      			let fieldValue = fieldValues[field.id],
	      			td = document.createElement('td'),
	      			value = fieldValue && fieldValue.label,
	      			method = 'textContent';

	      			if(value != undefined){
	      				if(value.indexOf('<') != -1){
	      					method = 'innerHTML';
	      				}
	      					
	      				td[method] = value;

	      				tr.appendChild(td);
	      			}
	      		}
	      	}

	      	button.onclick = function(event){
	      		event.preventDefault();

	      		display_formCreator({ inbox:inbox, entry_data , onsuccess:(data)=>{
	      			let id = data.entryId,
	      			fieldValues = data.fieldValues,
	      			tr = document.createElement('tr'),
	      			td_delete = document.createElement('td'),
	      			delete_link = document.createElement('a');

	      			input.value += "," + id;

	      			tr.setAttribute('entryId',id);
	      			delete_link.setAttribute('entryId',id);
	      			delete_link.setAttribute('data-action','delete');
	      			delete_link.href = "#";
	      			delete_link.textContent = "Supprimer";

	      			inbox.gpfnfields.forEach(build_inner_table(tr, fieldValues));

	      			td_delete.appendChild(delete_link);
	      			tr.appendChild(td_delete);
	      			tbody.appendChild(tr);
	      		}});
	      	}

	      	return div;
	      }
        default:{
        	let div = document.createElement('div'),
        	label = document.createElement('label'),
        	div_2 = document.createElement('div');

        	label.textContent = "In- " + inbox.label;
        	div_2.innerHTML = inbox.value;

        	atts.append('class','card');
        	setAttribute(div,atts);
        	div.appendChild(label);
        	div.appendChild(div_2);

          console.error("unknwon inbox fieldType", inbox);
          return div;
        }
      }
    break;
  	default:
    	console.error("Unknwon inbox type", inbox);
	}
}

function update_file_to_send(input, file_to_sends) {
  let files = input.files, id = input.getAttribute("id"), evolution_div = document.querySelector(".file_detail_" + id);
  if (!id) {
    console.warn("No id find for file input");
  }
  for (let i = 0, file = files[i];i < files.length; i++) {
    let p = document.createElement("p"), span = document.createElement("span"), span_2 = document.createElement("span");
    span_2.classList.add("percent");
    span.textContent = file.name;
    p.appendChild(span);
    p.appendChild(span_2);
    evolution_div.append(p);
    if (!file_to_sends[id]) {
      file_to_sends[id] = [];
    }
    file_to_sends[id].push(file);
  }
  console.log("new file_to_sends", file_to_sends);
}

function handle_file_upload(file_to_sends, field_ids, inboxes, updatePercent) {
  	let totalBytes = 0, totalLoaded = 0, not_uploaded = 0, waiting_progress = null, uploads = {};
	return new Promise((resolve, reject) => {
	    for (let id in file_to_sends) {
	      	let files = file_to_sends[id];
	      	uploads[id] = [];
	      	if (files.length) {
	        	for (let i = 0, file = files[i];i < files.length; i++) {
		          	let form = new FormData, name = "o_" + guid(), field = get_field_by_location(field_ids[id], inboxes), settings = field["data-settings"], received_data = false, xhr = new XMLHttpRequest;
		          	if (!field) {
			            console.warn("No field found for id");
			            continue;
		          	}
		          
		          	not_uploaded++;
		          	xhr.open("POST", settings["url"], true);
		          	xhr.upload.onprogress = (event) => {
		            	let { total, loaded } = event;
		            	if (event.lengthComputable) {
		              		if (!received_data) {
			                	waiting_progress--;
			                	totalBytes += total;
			                	received_data = true;
		              		}

		              		totalLoaded += total - loaded;

		              		if (!waiting_progress) {
		                		updatePercent(Math.ceil(totalLoaded / totalBytes * 100) + "%");
		              		}
		            	}
		          	};

		          	xhr.onload = function(event) {
		            	not_uploaded--;
		            	let text = xhr.response || xhr.responseText;
		            	try {
		              		text = JSON.parse(text);
		              		uploads[id].push(text);
		              		console.log("Success for id", id);
		            	} 
		            	catch (error) {
		              		uploads[id].push({ status: "error", error: { message: "Erreur lors du parsing" } });
		              		console.warn("Error parsing text ", error);
		            	}

		            	if (not_uploaded <= 0) {
		              		resolve(uploads);
		            	}
		          	};

		          	xhr.onerror = function(event) {
		            	alert("Une erreur est survenue lors de la transmission du fichier " + file.name);
		            	not_uploaded--;
		            	uploads[id].push({ status: "error", messgae: "une erreur est survenue" });
		            	if (not_uploaded <= 0) {
		              		resolve(uploads);
		            	}
		          	};

		          	if (file.name.lastIndexOf(".") != -1) {
		            	name += file.name.slice(file.name.lastIndexOf("."));
		          	}

		          	form.append("name", name);

		          	for (let input_name in settings["multipart_params"]) {
		            	form.append(input_name, settings["multipart_params"][input_name]);
		          	}

		          	form.append("gform_unique_id", generateUniqueID());
		          	form.append("original_filename", file.name);
		          	form.append("file", file);

		          	xhr.send(form);

		          	if (waiting_progress === null) {
		            	waiting_progress = 1;
		          	} 
		          	else {
		            	waiting_progress++;
		          	}
	        	}
	      	} 
	      	else {
	        	reject(new Error("Input field doesn't have an id"));
	      	}
	    }
  	});
}

function get_entry_ids(node, repeat) {
	if (repeat && node) {
    	let form_id = node.getAttribute("form_id"), entry_id = node.getAttribute("id"), entry_numero = node.getAttribute("numero");
    	if (form_id && entry_id) {
      		return { form_id, entry_id, numero: entry_numero };
    	}

    	return get_entry_ids(node.parentNode, repeat--);
  	} 
  	else {
    	return null;
  	}
}

function create_table_entry_toggler() {
  	let table = document.querySelector("table"), entry_viewer = document.querySelector(".entry-detail");
  	if (!table || !entry_viewer) {
    	throw Error("table or entry_viewer not found");
  	}

  	return () => {
    	table.classList.toggle("hidden");
    	entry_viewer.classList.toggle("hidden");
  	};
}

function get_field_value(field) {
  	let value = field.leaf_value || field.value;

  	if (value) {
    	if (is_object(value)) {
      		let values = [];

      		for (let id in value) {
        		values.push(value[id]);
      		}
      	return values;
    	} 
    	else {
      		return value;
    	}
  	} 
  	else {
    	return "";
  	}
}

function should_display_field(field, field_ids, inboxes) {
  	if (field.rules) {
    	let method = "every";

    	if (field.logicType != "all") {
      		method = "some";
    	}

    	if (field.rules[method](ruleChecker)) {
      		return field.actionType == "show";
    	}

    	return field.actionType == "hide";
  	} 
  	else {
    	return true;
  	}

  	function ruleChecker(rule) {
    	let { fieldId, operator, value: ruleValue } = rule, field_location = field_ids[fieldId], validated = true,
    	operators = {
	  		is: function(value,data){
	  			if(!(value instanceof Array)){
	  				return value == data;
	  			}

	  			return value.indexOf(data) != -1
	  		}
	  	};

    	if (field_location) {
      		let _field = get_field_by_location(field_location, inboxes);

      		if (_field) {
        		let value = get_field_value(_field);

        		if(operators[operator](value,ruleValue)){
        			console.warn("CAN DISPLAY FIELD", field.label, "BECAUSE RULE DON'T SATISFY");
          		console.warn("rule", field.rules);
          		console.log("_field", _field);
          		console.log("VALUE", value);
          		validated = false;
        		}
      		} 
      		else {
        		console.error("Couldn't find dependent field", field_location);
        		validated = false;
      		}
    	} 
    	else {
      		console.error("FIELD in fieldId not found", fieldId);
      		validated = false;
    	}

    	return validated;
  	}
}

function build_dependent_classe(rules) {
  	return rules.map((rule) => "dependent_" + rule.fieldId).join(" ");
}

function get_field_by_location(location2, inboxes) {
  	let indexes = location2.split("_"), field = indexes.length == 2 && inboxes[indexes[0]][indexes[1]];
  	return field;
}

function check_validity({ form, field_ids, inboxes, required }) {
  	for (let fieldId in required) {
    	let field_location = field_ids[fieldId], field = get_field_by_location(field_location, inboxes), field_value;

    	if (field) {
      		field_value = form.get("input_" + fieldId);
      		if (should_display_field(field, field_ids, inboxes)) {
        		if (!field_value) {
          			return false;
        		}
      		}
    	}
  	}
  	return true;
}

function purge_error_nodes(nodes) {
  	let length = nodes.length;

  	while (length--) {
    	let node = nodes[length];
    	node.textContent = "";

    	if (!node.classList.contains("hidden")) {
      		node.classList.add("hidden");
    	}
  	}
}

function display_entry(payloads, entry_data) {
  	let inboxes = payloads.inbox, entry_id = entry_data.entry_id, numero = entry_data.numero, form_title = payloads.form_title, main_node = document.querySelector(".entry-detail"), span_title = document.querySelector(".form_name"), span_entry_number = document.querySelector(".entry-id"), content_node = document.querySelector(".entry-detail .content"), back = document.querySelector(".entry-detail .back"), actionNodes = {}, bodyHtml = "", field_ids = {}, dependents = {}, required = {}, uploads = {}, file_to_sends = {};

  	if (!content_node) {
    	return console.error("Content node not found");
  	}

  	if (!span_title || !span_entry_number) {
    	return console.error("No span_title or span entry_number found");
  	}

  	if (!back) {
    	return console.error("Back button not found");
  	}

  	back.onclick = (event) => {
	    event.preventDefault();
	    content_node.innerHTML = "";
	    span_title.textContent = "";
	    span_entry_number.textContent = "";
	    create_table_entry_toggler()();
  	};

  	span_title.textContent = form_title;
  	span_entry_number.textContent = numero;

  	inboxes.forEach((_inboxes, index) => {
    	let inSection = false, section_with_rules = false, currentSection;
    	_inboxes.forEach((inbox, _index) => {

	      	try {
	        	field_ids[inbox.id] = index + "_" + _index;
	        	let inbox_index = field_ids[inbox.id], 
	        	atts = new Attributes, 
	        	inputAtts = new Attributes, 
	        	failedAtts = new Attributes, 
	        	value;

	        	inputAtts.set("id", inbox.id);
	        	inputAtts.append("name", "input_" + inbox.id);
	        	inputAtts.append("value", inbox.value || "");
	        	failedAtts.append("class", "hidden");
	        	failedAtts.append("class", "error-field");
	        	failedAtts.append("class", "invalid-" + inbox.id);

	        	if (inbox.name) {
	          		inputAtts.set("name", inbox.name);
	        	}
	        	if (inbox.required) {
	          		required[inbox.id] = true;
	          		inputAtts.set("required", "true");
	        	}

	        	if (inbox.rules) {
	          		if (!section_with_rules) {
	            		atts.append("class", build_dependent_classe(inbox.rules));
	            		if (!should_display_field(inbox, field_ids, inboxes)) {
	              			atts.append("class", "hidden");
	            		}
	          		}

	          		inbox.rules.forEach((rule) => {
	          			if(!dependents[rule.fieldId]){
	          				dependents[rule.fieldId] = [];
	          			}

	            		dependents[rule.fieldId].push(inbox.id);
	          		});
	        	} 
	        	else {
	          		if (inbox.display == false) {
	            		atts.append("class", "hidden");
	          		}
	        	}

	        	let node = build_entry_element({ inbox, inputAtts, atts, failedAtts, inbox_index, entry_data });

	        	if(!node){
	        		console.log("Missing node for inbox",inbox);
	        		throw Error("Missing node");
	        	}

	        	if(inbox.type == 'section'){
	        		currentSection = node.querySelector('div');
	        		inSection = true;
	        		content_node.appendChild(node);
	        	}
	        	else{
	        		if(inSection){
	        			currentSection.appendChild(node);
	        		}
	        		else{
	        			content_node.appendChild(node);
	        		}
	        	}

	        	/*switch (inbox.type) {
	          		case "section":
	            		if (!should_display_field(inbox, field_ids, inboxes)) {
	              			atts.append("class", "hidden");
	            		}

	            		if (inbox.rules) {
	              			section_with_rules = true;
	            		}

	            		bodyHtml += "<section " + atts.toString() + ">";
	            		bodyHtml += "<h5 class='title'>" + inbox.label + "</h5>";
	            		bodyHtml += "<div>";
	            		inSection = true;
	            	break;
	          		case "html":
	            		atts.append("class", "card");
	            		bodyHtml += "<div " + atts.toString() + ">" + inbox.value + "</div>";
	            	break;
	          		case "text":
	            		atts.append("class", "card");
	            		bodyHtml += "<div " + atts.toString() + "><label>" + inbox.label + "</label><p>" + inbox.value + "</p></div>";
	            	break;
	          		case "hidden":
			            atts.append("class", "hidden");
			            inputAtts.set("index", inbox_index);
			            inputAtts.set("type", "hidden");
			            bodyHtml += "<div " + atts.toString() + "><input " + inputAtts.toString() + " /></div>";
		            break;
	          		case "button":
			            atts.append("class", "card");
			            inputAtts.set("index", inbox_index);
			            inputAtts.set("type", inbox.buttonType);
			            inputAtts.append("class", inbox.class);
			            bodyHtml += "<div " + atts.toString() + "><button " + inputAtts.toString() + ">" + inbox.label + "</button></div>";
	            	break;
	          		case "radio":
			            atts.append("class", "card");
			            if (inbox.checked) {
			              inputAtts.set("checked", "checked");
			            }
			            inputAtts.set("type", "radio");
			            bodyHtml += "<div " + atts.toString() + "><label for='" + inbox.name + "'>" + inbox.label + "</label><input " + inputAtts.toString() + " /></div>";
	            	break;
	          		case "submit":
			            atts.append("class", "card");
			            inputAtts.set("index", inbox_index);
			            inputAtts.append("class", "btn-success");
			            inputAtts.set("type", "submit");
			            bodyHtml += "<div " + atts.toString() + "><button " + inputAtts.toString() + ">" + inbox.value + "</button></div>";
	            	break;
	          		case "edit":
			            value = get_field_value(inbox);
			            inputAtts.set("value", value);
			            inputAtts.set("placeholder", inbox.placeholder);
			            switch (inbox.fieldType) {
			              case "text":
			              case "product":
			                atts.append("class", "card");
			                inputAtts.set("type", "text");
			                inputAtts.set("placeholder", inbox.placeholder);
			                bodyHtml += "<div " + atts.toString() + " ><label>" + inbox.label + "</label><p><input " + inputAtts.toString() + " /></p><div " + failedAtts.toString() + "></div></div>";
			                break;
			              case "textarea":
			                atts.append("class", "card");
			                inputAtts.remove("value");
			                bodyHtml += "<div " + atts.toString() + "><label>" + inbox.label + "</label><p><textarea " + inputAtts.toString() + ">" + value + "</textarea></p><div " + failedAtts.toString() + "></div></div>";
			                break;
			              case "radio":
			                atts.append("class", "card");
			                bodyHtml += "<div " + atts.toString() + "><label>" + inbox.label + "</label><p>";
			                inbox.choices.forEach((choice) => {
			                  if (choice.value == value) {
			                    inputAtts.set("checked", "checked");
			                  } else {
			                    inputAtts.remove("checked");
			                  }
			                  inputAtts.set("type", "radio");
			                  inputAtts.set("value", choice.value);
			                  bodyHtml += "<span><label>" + choice.text + "</label><input " + inputAtts.toString() + " /></span>";
			                });
			                bodyHtml += "</p><div " + failedAtts.toString() + "></div></div>";
			                break;
			              case "checkbox":
			                atts.append("class", "card");
			                bodyHtml += "<div " + atts.toString() + "><label>" + inbox.label + "</label><div>";
			                inbox.choices.forEach((choice) => {
			                  let checked = value.indexOf(choice.value) != -1, id = inbox.inputs.filter((input) => {
			                    return input.label == choice.value;
			                  })[0]["id"];
			                  if (checked) {
			                    inputAtts.set("checked", "checked");
			                  } else {
			                    inputAtts.remove("checked");
			                  }
			                  inputAtts.set("name", "input_" + id);
			                  inputAtts.set("value", choice.value);
			                  inputAtts.set("type", "checkbox");
			                  bodyHtml += "<p><label>" + choice.text + "</label><input " + inputAtts.toString() + " /></p>";
			                });
			                bodyHtml += "</div><div " + failedAtts.toString() + "></div></div>";
			                break;
			              case "select":
			                atts.append("class", "card");
			                inputAtts.remove("value");
			                inputAtts.remove("placeholder");
			                bodyHtml += "<div " + atts.toString() + "><label>" + inbox.label + "</label><select " + inputAtts.toString() + "><option>Selectionner</option>";
			                inbox.choices.forEach((choice) => {
			                  let selected = choice.value == value, atts2 = new Attributes;
			                  if (selected) {
			                    atts2.set("selected", "selected");
			                  }
			                  atts2.set("value", choice.value);
			                  bodyHtml += "<option " + atts2.toString() + ">" + choice.text + "</option>";
			                });
			                bodyHtml += "</select><div " + failedAtts.toString() + "></div></div>";
			                break;
			              case "workflow_assignee_select":
			                atts.append("class", "card");
			                inputAtts.remove("value");
			                inputAtts.remove("placeholder");
			                bodyHtml += "<div " + atts.toString() + "><label>" + inbox.label + "</label><select " + inputAtts.toString() + ">" + inbox.value + "</select></div>";
			                break;
			              case "workflow_multi_user":
			                atts.append("class", "card");
			                inputAtts.remove("value");
			                inputAtts.remove("placeholder");
			                bodyHtml += "<div " + atts.toString() + "><label>" + inbox.label + "</label><select multiple " + inputAtts.toString() + ">";
			                try {
			                  inbox.leaf_value = JSON.parse(inbox.leaf_value);
			                } catch (error) {
			                  inbox.leaf_value = [];
			                }
			                inbox.choices.forEach((choice) => {
			                  let selected = inbox.leaf_value.indexOf(choice.value) != -1 ? "selected" : "";
			                  bodyHtml += "<option " + selected + " value='" + choice.value + "'>" + choice.text + "</option>";
			                });
			                bodyHtml += "</select>";
			                bodyHtml += "</div>";
			                break;
			              case "fileupload":
			                atts.append("class", "card");
			                inputAtts.remove("value");
			                inputAtts.remove("placeholder");
			                inputAtts.set("type", "file");
			                bodyHtml += "<div " + atts.toString() + "><label>" + inbox.label + "</label>";
			                bodyHtml += "<div><div><input " + inputAtts.toString() + " /></div><div>" + inbox.value + "</div><div class='file_detail_" + inbox.id + "'></div></div>";
			                bodyHtml += "</div>";
			                break;
			              case "date":
			                atts.append("class", "card");
			                bodyHtml += "<div " + atts.toString() + "><label>" + inbox.label + "</label><input "+ inputAtts.toString() +" />";
			                break;
			              default:
			              	atts.append('class','card');
			              	bodyHtml += "<div " + atts.toString() + "><label>In- "+inbox.label + "</label><div>"+ inbox.value +"</div></div>";
			                console.error("unknwon inbox fieldType", inbox);
			            }
	            	break;
	          		default:
	            		console.error("Unknwon inbox type", inbox);
	        	}*/



	        	if (inbox.action) {
	          		actionNodes[inbox_index] = inbox.action;
	        	}
	      	} 
	      	catch (error) {
	        	console.error("GREAT ERROR");
	        	console.error(error);
	      	}
    	});

    	/*if (inSection) {
      		bodyHtml += "</div></section>";
    	}*/
  	});

  	content_node.onsubmit = (event) => {
    	event.preventDefault();

    	let form = event.target, fData = new FormData(form), url = new URL(GravityAjax.ajax_url), searchParams = url.searchParams, error_fields = document.querySelectorAll(".error-field"), upload_form = false;

    	purge_error_nodes(error_fields);

    	if (!check_validity({ form: fData, required, field_ids, inboxes })) {
      		console.warn("Form is not valid");
      		if (form.checkValidity) {
        		form.checkValidity();
        		return form.reportValidity();
      		} 
      		else {
        		display_information_modal("Veuillez completez les champs requis du formulaire").catch((error) => {
          			console.error("Error whie", error);
        		});
      		}
      		return;
    	}

    	let up = new uploader, 
    	p;

    	up.show();

    	if (Object.keys(file_to_sends).length) {
      		up.updatePercent("0%");
      		up.updateText("Transmission des fichiers");

      		p = handle_file_upload(file_to_sends, field_ids, inboxes, up.updatePercent).then((_uploads) => {
        		let failed = Object.keys(_uploads).reduce((x, y) => {
          			let upload = _uploads[y], 
          			bad_uploads = upload.filter((text) => !text || text.status != "ok");
          			if (bad_uploads.length) {
            			x.push(...bad_uploads);
          			} 
          			else {
            			_uploads["input_" + y] = upload.map((x2) => x2.data);
            			fData.set("input_" + y, JSON.stringify([]));
            			delete _uploads[y];
          			}
          			return x;
        		}, []);

        		if (failed.length) {
          			up.close();
          			return display_information_modal("Le transmission de certain fichiers ont echoué").catch((error) => {
            			console.error(error);
          			});
        		}

        		fData.append("gform_uploaded_files", JSON.stringify(_uploads));
        		upload_form = true;
      		}).catch((error) => {
        		console.error(error);
      		});
    	} 
    	else {
      		upload_form = true;
      		p = Promise.resolve(true);
    	}

    	p.finally(() => {
      		if (upload_form) {
        		up.updateText("Traitement du formulaire").updatePercent("");
		        searchParams.set("action", GravityAjax.flow_entry);
		        searchParams.set("nonce", GravityAjax.flow_nonce);
		        searchParams.set("id", entry_data.form_id);
		        searchParams.set("entry_id", entry_data.entry_id);

        		fetch(url, { method: "POST", body: fData }).then((response) => response.json()).then((json_response) => {
          			up.close();

          			let { success, data } = json_response, message = data && data.message;

          			if (success) {
            			let msg = message || "<h5>L'Operation a été effectué avec success</h5>";
            			display_information_modal(msg).then(() => {
              				toggle_loader("");
              				location.href = location.href;
            			}).catch((error) => {
	              			alert("Une erreur est survenue");
	              			console.error(error);
            			});
          			} 
          			else {
            			if (data.invalid_field) {
              				data.invalid_field.forEach((invalid) => {
                				let error_node = document.querySelector(".invalid-" + invalid.id);
                				if (error_node) {
                  					error_node.textContent = invalid.message;
                  					error_node.classList.remove("hidden");
                				} 
                				else {
                  					console.error("NO ERROR NODE FOUND FOR FIELD", invalid);
                				}
              				});
              
              				display_information_modal("<h5>Veuillez vous assurez que tous les champs sont correctement rempli. Certain champs sont invalide</h5>").catch((error) => {
                				alert("Une erreur est survenue");
                				console.error(error);
             				 });
            			} 
            			else {
              				let msg = message || "<h5>L'operation n'a pas pu etre effectué</h5>";
              				display_information_modal(msg).catch((error) => {
                				alert("Une erreur est survenue");
                				console.error(error);
              				});
            			}
          			}
        		}).catch((error) => {
          			up.close();
          			alert("Une erreur est survenue");
          			console.error(error);
          			display_information_modal("Une erreur est survenue lors du traitement du formulaire");
        		});
      		}
    	});
  	};

  	content_node.onchange = (event) => {
    	let target = event.target, 
    	id = target.getAttribute("id"),
    	value = target.value;
    	
    	if (id) {
      		if (dependents[id]) {

        		let inbox_index = field_ids[id],
        		t_field = get_field_by_location(inbox_index,inboxes),
        		classes = build_dependent_classe([{ fieldId: id }]), deps = document.querySelectorAll("." + classes), length = deps.length;

        		t_field.leaf_value = value;

        		/*while (length--) {
          			deps[length].classList.toggle("hidden");
        		}*/
      		}

      		dependents[id] && dependents[id].forEach((field_id)=>{
      				let inbox_index = field_ids[field_id],
      				field = get_field_by_location(inbox_index, inboxes),
      				node = document.querySelector('.' + build_index_class(inbox_index));

      				if(should_display_field(field, field_ids, inboxes)){

      					if(node.classList.contains('hidden')){
      						node.classList.toggle('hidden');
      					}
      				}
      				else{
      					if(!node.classList.contains('hidden')){
      						node.classList.toggle('hidden');
      					}
      				}
      			})

      		let field_location = field_ids[id];

      		if (field_location) {
        		let field = get_field_by_location(field_location, inboxes);

        		if (field) {
          			if (field.fieldType != "fileupload") {
            			field.leaf_value = target.value;
         		 	} 
         		 	else {
            			if (target.files.length) {
              				update_file_to_send(target, file_to_sends);
            			} 
            			else {
              				console.error("Input length is empty", field.label);
            			}
          			}
        		}
      		}
    	}
  	};

  	content_node.onclick = (event) => {
    	let target = event.target, index = target.getAttribute("index");

    	if (index !== null) {
      		let actionHandler = actionNodes[index];
      		if (!actionHandler) {
        		return console.error("Received click from an element with index " + index + " but with no actionHandler", actionNodes);
      		}

      		actionHandler.forEach((action) => {
        		let id_node = document.getElementById(action.set_id);
        		if (!id_node) {
          			return console.error("No element with id", action.set_id, "found");
        		}

        		if (action.to) {
          			console.log("Seeting node with id", action.set_id, "to value", action.to);
          			id_node.value = action.to;
        		}
      		});

      		if (target.type != "submit") {
        		event.preventDefault();
      		}
    	}
  	};

  	//content_node.innerHTML = bodyHtml;
}

function onglet_handler(contents) {
  	let onglets = document.querySelector(".onglets");
  	onglets.addEventListener("click", (event) => {
    	event.preventDefault();

    	let target = event.target, index = target.getAttribute("index");
    	
    	console.log("SHIFFI");

    	if (index != null) {
      		if (!target.classList.contains("active")) {
        		contents.forEach((content, _index) => {
          			if (_index == index) {
            			content.classList.remove("hidden");
          			} 
          			else {
            			content.classList.add("hidden");
          			}
        		});

        		Array.prototype.forEach.call(onglets.children, (child, _index) => {
          			if (index == _index) {
            			child.classList.add("active");
          			} 
          			else {
            			child.classList.remove("active");
          			}
        		});
      		}
    	}
  	});
}

function entry_click_handler(table) {
  	let tbody = table.querySelector("tbody"), entry_toggler = create_table_entry_toggler();
  	if (!tbody) {
    	return console.error("Couldn't load Entry_click_handler because no tbody element was found");
  	}

  	tbody.addEventListener("click", (event) => {
    	let target = event.target, payloads = get_entry_ids(target, 5);
    	if (payloads) {
      		let queries = {
        		entry_id: payloads.entry_id,
        		id: payloads.form_id,
        		action: GravityAjax.flow_entry,
        		nonce: GravityAjax.flow_nonce
      		}, 
      		myPage_handler = new page_handler(null, table, queries);

      		entry_toggler();

      		myPage_handler.load_data().then((json_response) => {
        		if (json_response.success) {
          			display_entry(json_response.data, payloads);
        		} 
        		else {
          			let msg = json_response.data && json_response.data.msg || "La recherche de l'entrée n'a pas pu être effectuée";
          			return display_information_modal(msg).finally(() => {
            			entry_toggler();
          			});
        		}
      		}).catch((error) => {
        		let msg = error.message || "Une erreur est survenue";
        		display_information_modal(msg);
      		});
    	} 
    	else {
      		console.error("No entry_id and form_id found");
    	}
  	});
}

exports.result_handler = result_handler;
exports.entry_click_handler = entry_click_handler;
exports.onglet_handler = onglet_handler;