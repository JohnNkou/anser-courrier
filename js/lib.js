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
	selected = [];

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

	function draw_view(){
		div_span.innerHTML = selected.map((data,index)=>{
			return '<span index="'+ index +'" class="text-nowrap cursor-pointer">'+data+'</span>';
		}).join('');

		Array.prototype.forEach.call(div_span.querySelectorAll('.text-nowrap'),(span)=>{
			let index = span.getAttribute('index'),
			data = selected[index];

			span.onchange = function(event){
				let value = span.textContent;

				if(value.length > data){
					event.preventDefault();
					event.stopImmediatePropagation();
				}
				else if(value.length < data){
					selected.splice(index,1);

					draw_view();
				}
			}
		})

		if(div_span.innerHTML.indexOf('span') == -1){
			div_span.innerHTML += '<span class="input"></span>';
		}
		else if(div_span.children.length > 1){
			let span_input = div_span.querySelector('.input');

			div_span.removeChild(span_input);
			div_span.appendChild(span_input);
		}
	}

	field.choices.forEach((choice,index)=>{
		let a = document.createElement('a'),
		option = document.createElement('option'),
		field_value = field.leaf_value || field.value;

		a.textContent = choice.text;
		a.setAttribute('value', choice.value);
		a.setAttribute('index',index);

		option.value = choice.value;

		div_dropdown.appendChild(a);
		select.appendChild(option);

		if(field_value instanceof Array){
			for(let i=0; i < field_value.length; i++){
				if(field_value[i] == choice.value){
					selected.push(choice.text);
					option.setAttribute('selected','true');
				}
			}
		}
		else if(field_value == choice.value){
			selected.push(choice.text);
			option.setAttribute('selected','true');
		}
	});

	div_span.onfocusin = function(){
		div_dropdown.classList.remove('hidden');
	}

	div_span.onfocusout = function(){
		div_dropdown.classList.add('hidden');
	}

	div_dropdown.onclick = function(event){
		event.preventDefault();

		let target = event.target,
		value = target.textContent,
		_index = target.getAttribute('index'),
		index = selected.indexOf(value);

		if(index == -1){
			selected.push(value);
			select.options[_index].selected = true;
		}
		else{
			selected.splice(index,1);
			delete select.options[_index].selected;
		}

		draw_view();
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