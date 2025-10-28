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
			atts.push(name.toString() + "='" + (attributes[name].join(" ")) + "'");
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

exports.Attributes = Attributes;
exports.guid = guid;
exports.generateUniqueID = generateUniqueID;
exports.is_object = function($data){
	return Object.prototype.toString.call($data) == Object.prototype.toString.call({})
}