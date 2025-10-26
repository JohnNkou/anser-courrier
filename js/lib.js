function Attributes(){
	let attributes = {};

	this.append = (name,value)=>{
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
			console.error("VALUE PASSED TO APPEND IS UNDEFINED",arguments);
		}
	}

	this.set = (name,value)=>{
		if(value != undefined){
			attributes[name] = [value];
		}
		else{
			console.error("VALUE PASSED TO SET IS UNDEFINED",arguments);
		}
	}

	this.remove = (name,value)=>{
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
			atts.push(name.toString() + "='" + (attributes[name].join(" ")) + "'");
		}

		return atts.join(" ");
	}
}

exports.Attributes = Attributes;