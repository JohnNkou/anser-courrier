function Attributes(){
	let attributes = {};

	this.append = function(name,value){
		if(value != undefined){
			let array = attributes[name];

			if(!array){
				array = attributes[name] = [];
			}

			if(array.indexOf(value) == -1){
				array.push(value);
			}
		}
		else{
			console.warn("VALUE PASSED TO APPEND IS UNDEFINED",arguments);
		}
	}

	this.get = function(name){
		return attributes[name];
	}

	this.forEach = function(fn){
		for(let name in attributes){
			fn(attributes[name],name);
		}
	}

	this.set = function(name,value){
		if(value != undefined){
			attributes[name] = [value];
		}
		else{
			console.warn("VALUE PASSED TO SET IS UNDEFINED",arguments);
		}
	}

	this.remove = function(name,value){
		if(value == undefined){
			delete attributes[name];
		}
		else{
			let array = attributes[name];

			if(array){
				let index = array.indexOf(value);

				if(index != -1){
					array.splice(index,1);
				}
			}
		}
	}

	this.toString = function(){
		let atts = [];

		for(let name in attributes){
			atts.push(name.toString() + '="' + (attributes[name].join(" ")) + '"');
		}

		return atts.join(" ");
	}
}

function guid(){
	for (var t = (new Date).getTime().toString(32), i = 0; i < 5; i++)
        t += Math.floor(65535 * Math.random()).toString(32);

    return t;
}

function generateUniqueID() {
	return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8;
		return v.toString(16);
	});
}

function Select(field,rootNode){
	let div = document.createElement('div'),
	div_span = document.createElement('div'),
	div_dropdown = document.createElement('div'),
	select = document.createElement('select'),
	selected = [],
	spans;

	div.classList.add('select');
	div_span.classList.add('select-viewer');
	div_dropdown.classList.add('select-dropdown');
	div_dropdown.classList.add('shadow-md');
	div_dropdown.classList.add('bg-white');
	div_dropdown.classList.add('hidden');
	select.classList.add('hidden');
	select.setAttribute('multiple','true');
	select.setAttribute('name','input_'+field.id);
	div_span.setAttribute('contenteditable','true');

	if(!field.leaf_value instanceof Array){
		field = {...field};
		field.leaf_value = [field.leaf_value];
	}

	selected = field.leaf_value.map((value)=> field.choices.filter((x)=> x.value == value)[0]);

	function draw_view(){
		div_span.innerHTML = selected.map((choice,index)=>{
			return '<span index="'+ index +'" class="text-nowrap cursor-pointer">'+ choice.text +'</span>';
		}).join('');

		spans = div_span.querySelectorAll('.text-nowrap');

		if(div_span.innerHTML.trim().length){
			if(!div_span.querySelector('.input')){
				div_span.innerHTML += '<span class="input"></span>';
			}
			else if(div_span.children.length > 1){
				let span_input = div_span.querySelector('.input');

				div_span.removeChild(span_input);
				div_span.appendChild(span_input);
			}
		}
	}


	function display_choices(choices){
		let optionLength = select.options.length,
		choiceLength = field.choices.length;

		div_dropdown.innerHTML = '';

		choices.forEach((choice,index)=>{
			let a,option;

			if(optionLength != choiceLength){
				option = document.createElement('option');
				option.value = choice.value;

				select.appendChild(option);

				optionLength++;
			}
			else{
				option = select.options[index];
			}


			if(selected.filter((s)=> s.value == choice.value)[0]){
				option.setAttribute('selected',true);
			}
			else{
				if(option.selected){
					option.removeAttribute('selected');
				}

				a = document.createElement('a');
				a.textContent = choice.text;
				a.setAttribute('value', choice.value);

				div_dropdown.appendChild(a);
			}
		});
	}

	display_choices(field.choices);

	div_span.onfocusin = function(){
		div_dropdown.classList.remove('hidden');
	}

	div_span.onfocusout = function(){
		div_dropdown.classList.add('hidden');
	}

	div_span.oninput = (event)=>{
		if(selected.length){
			let spans = div_span.querySelectorAll('.text-nowrap'),
			input_span = div_span.querySelector('.input'),
			length = spans.length;

			while(length--){
				let data = selected[length].text,
				span_data = spans[length].innerHTML;

				if(span_data == data){
					continue;
				}

				if(span_data.length < data.length){
					selected.splice(length,1);
					draw_view();
					break;
				}
				else{
					spans[length].textContent = data;
				}
			}

			if(!input_span){
				draw_view();
			}

			if(input_span && input_span.textContent.length){
				let value = input_span.textContent.toLowerCase(),
				choices = field.choices.filter((choice)=>{
					return choice.text.toLowerCase().indexOf(value) != -1
				});

				display_choices(choices);
			}
			else if(div_dropdown.children.length != field.choices.length){
				display_choices(field.choices);
			}
		}
		else{

			let value = div_span.textContent.toLowerCase(),
			choices;

			if(value.length){
				choices = field.choices.filter((choice)=>{
					return choice.text.toLowerCase().indexOf(value) != -1;
				});

				display_choices(choices);
			}
			else if(div_dropdown.children.length != field.choices.length){
				display_choices(field.choices);
			}
		}
	}

	div_dropdown.onclick = function(event){
		event.preventDefault();

		let target = event.target,
		value = target.getAttribute('value'),
		choice = field.choices.filter((choice)=> choice.value == value);

		if(choice){
			selected.push(choice);
			select.options[_index].selected = true;

			display_choices(field.choices);

			draw_view();
		}
		else{
			console.warn("MAJOR PROBLEME NO CHOICE FOUND");
		}
	}

	draw_view();

	div.appendChild(div_span);
	div.appendChild(div_dropdown);
	div.appendChild(select);

	rootNode.appendChild(div);
}

exports.Attributes = Attributes;
exports.guid = guid;
exports.generateUniqueID = generateUniqueID;
exports.Select = Select;
exports.is_object = function($data){
	return Object.prototype.toString.call($data) == Object.prototype.toString.call({})
}