function Anser_loader(offset = 0, page_size = 10, queries = {}) {
  let url = new URL(GravityAjax.ajax_url), searchParams = url.searchParams;
  searchParams.set("offset", offset);
  searchParams.set("limit", page_size);
  for (let name in queries) {
    searchParams.set(name, queries[name]);
  }
  return fetch(url, { method: "GET" });
}

function file_viewer_handler(node) {
  node.addEventListener("click", (event) => {
    let target = event.target;
    if (target.href && /\.(pdf|jpg|jpeg|png|gif)/.test(target.href)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      display_pdfviewer(target.href).catch((error) => {
        console.error(error);
        alert("Une erreur est survenue lors de l'affichage du pdf");
      });
    }
  });
}

function display_formCreator({ inbox, entry_data, onsuccess }){
  let fields =      inbox.gpfnfields,
  field_id =         inbox.id,
  title =           inbox.label,
  form_id =         inbox.gpfnfForm,
  parent_form_id =  entry_data.form_id,
  entry_id =        entry_data.entry_id,
  div = document.getElementById('formCreator'),
  form = div && div.querySelector('form'),
  titleNode = document.createElement('div'),
  contentNode = div && div.querySelector('.content'),
  button = div && div.querySelector('.close'),
  hidden_fields = [{ name:"gpnf_parent_form_id", value:parent_form_id },{ name:"gpnf_nested_form_field_id", value: field_id }, { name:"gform_submission_method",value:"iframe" }, { name:"gform_theme", value:"gravity-theme" }, { name:"is_submit_"+form_id, value:"1" }, { name:"gform_submit", value:form_id }];

  if(inbox.gform_ajax){
    hidden_fields.push({ name:'gform_ajax', value: inbox.gform_ajax });
  }

  if(!div){
    throw Error("No formCreator div found");
  }

  form.onsubmit = function(event){
    event.preventDefault();
    console.log("Ok submit happening");

    let url = new URL(location.href),
    searchParams = url.searchParams;

    searchParams.append('page','gravityflow-inbox');
    searchParams.append('view','entry');
    searchParams.append('id', parent_form_id);
    searchParams.append('lid', entry_id);
    searchParams.append('anser_ajax','true');

    toggle_loader("Mise à jour");

    fetch(url,{
      method:'POST',
      body: new FormData(event.target)
    }).then((response)=>{
      toggle_loader();
      if(response.status == 200){
        response.json().then((payload)=>{
          if(payload.success){
            display_information_modal("Mise à jour effectué avec succèss");
            if(onsuccess){
              onsuccess(payload.data);
            }
          }
          else{
            console.log("Odd data",data);
            display_information_modal("La mise à jour n'as pas pu aboutir");
          }
        }).catch((error)=>{
          console.error(error);
          display_information_modal("La mise à jour n'a pas pu aboutir");
        })
      }
      else{
        console.error("Bad repsonse");
      }
    }).catch((error)=>{
      toggle_loader();
      console.error(error);
      display_information_modal("Une erreur est survenue lors de la mise à jour");
    });
  }

  button.onclick = function(){
    console.log("CLOSING THE STUFF")
    contentNode.innerHTML = "";
    titleNode.textContent = "";
    div.classList.add('hidden');
  }

  titleNode.textContent = title;
  titleNode.classList.add('title');
  contentNode.appendChild(titleNode);

  fields.forEach((field)=>{
    let div = document.createElement('div'),
    label = document.createElement('label'),
    id = 'input_' + field.id,
    inputNode;

    div.classList.add('card');
    label.textContent = field.label;

    switch(field.type){
      case 'textarea':{
        inputNode = document.createElement('textarea');
        break;
      }
      case 'select':{
        inputNode = document.createElement('select');
        field.choices.forEach((choice)=>{
          let option = document.createElement('option');
          option.value = choice.value;
          option.textContent = choice.text;
          inputNode.appendChild(option);
        });
        inputNode.name = id;
        break;
      }
      case 'text':
      case 'date':
      case 'email':
      case 'hidden':
        inputNode = document.createElement('input');
        inputNode.type = field.type;
        inputNode.name = id;

        if(field.value){
          inputNode.value = field.value;
        }
        break;
      case 'fileupload':
        inputNode = document.createElement('input');
        inputNode.type = 'file';
        break;
      default:
        inputNode = document.createElement('span');
        label.textContent += " Unknown";
    }

    div.appendChild(label);
    div.appendChild(inputNode);

    contentNode.appendChild(div);
  })

  hidden_fields.forEach((hidden)=>{
    let input = document.createElement('input');
    input.name = hidden.name;
    input.value = hidden.value;
    input.type = 'hidden';

    contentNode.appendChild(input);
  })

  div.classList.remove('hidden');
}
  
function toggle_loader(text = "Chargement") {
  var loader = document.querySelector("#loader"), text_node = loader.querySelector(".text");
  if (loader) {
    text_node.textContent = text;
    loader.classList.toggle("hidden");
  }
}
  
function display_pdfviewer(src) {
  let pdfview_node = document.getElementById("pdfviewer"), iframe = pdfview_node && pdfview_node.querySelector("iframe");
  if (!pdfview_node && !iframe) {
    return Promise.reject(new Error("pdfview and iframe should be node element"));
  }
  pdfview_node.classList.remove("hidden");
  iframe.src = src;
  return new Promise((resolve, reject) => {
    pdfview_node.onclick = function(event) {
      event.preventDefault();
      let target = event.target;
      if (target.classList.contains("close")) {
        pdfview_node.classList.add("hidden");
        iframe.src = "";
        resolve(true);
      }
    };
  });
}

function display_information_modal(text) {
  let div = document.querySelector(".informationModal"), text_node = div && div.querySelector(".text");
  if (!div || !text_node) {
    return Promise.reject("div with class informationModal and div with class text should be found");
  }
  
  text_node.innerHTML = text;
  div.classList.remove("hidden");
  return new Promise((resolve, reject) => {
    div.onclick = function(event) {
      event.preventDefault();
      let target = event.target;
      if (target.classList.contains("close")) {
        div.classList.add("hidden");
        resolve(true);
      }
    };
  });
}
  
function uploader() {
  let node = document.getElementById("uploader"), text = node.querySelector(".text"), percent = node.querySelector(".percent"), button = node.querySelector("button");
  button.onclick = () => {
    text.textContent = "";
    percent.textContent = "";
    node.classList.add("hidden");
  };
  this.show = () => {
    node.classList.remove("hidden");
    return this;
  };
  this.updateText = (new_text) => {
    text.textContent = new_text;
    return this;
  };
  this.updatePercent = (_percent) => {
    percent.textContent = _percent;
    return this;
  };
  this.close = () => {
    button.click();
  };
}

function page_handler(navigationHandler, body, default_queries = {}) {
  let nextPage = body.querySelector(".nextPage"), prevPage = body.querySelector(".previousPage"), with_queries = default_queries, navigation_waiters = [];
  this.page = 0;
  this.total_page = 0;
  this.total = 0;
  this.limit = 15;
  this.onNavigation = function(fn) {
    navigation_waiters.push(fn);
  };

  if (nextPage && prevPage) {
    nextPage.addEventListener("click", (event) => {
      this.goTo(this.page + 1).then((json_response) => {
        if (navigationHandler) {
          navigationHandler(json_response, body);
        }
      });
    });
    prevPage.addEventListener("click", (event) => {
      this.goTo(this.page - 1).then((json_response) => {
        if (navigationHandler) {
          navigationHandler(json_response, body);
        }
      });
    });
  } 
  else {
    console.error("NAVIGATION ELEMENT WERE NOT FOUND");
  }

  function toggle_disable(value) {
    nextPage.disabled = prevPage.disabled = value;
  }

  this.addQueries = (queries) => {
    with_queries = { ...with_queries, ...queries };
  };

  this.removeQueries = (queries) => {
    queries.forEach((querie_name) => {
      delete with_queries[querie_name];
    });
  };

  this.goTo = (newPage) => {
    toggle_disable(true);
    let offset = newPage * this.limit;
    return this.load_data(with_queries, offset).then((json_response) => {
      this.page = newPage;
      navigation_waiters.forEach((fn) => {
        fn(offset, offset + this.limit);
      });
      console.log("THE NEW PAGE IS", this.page);
      display_nativation_handler(newPage, this.total_page);
      return json_response;
    }).finally(() => {
      toggle_disable(false);
    });
  };

  this.load_data = function(queries = {}, offset = this.page, limit = this.limit) {
    toggle_loader();
    return Anser_loader(offset, limit, { ...with_queries, ...queries }).then((response) => response.json()).then((response) => {
      this.total_page = Math.ceil(response.data.total / this.limit);
      this.total = response.data.total;
      this.page = offset;
      display_nativation_handler(offset, this.total_page);
      return response;
    }).finally(() => {
      toggle_loader();
    });
  };

  function display_nativation_handler(page, total) {
    if (navigationHandler) {
      if (page == 0) {
        prevPage.classList.add("hidden");
      } else {
        prevPage.classList.remove("hidden");
      }
      if (page >= total - 1) {
        nextPage.classList.add("hidden");
      } else {
        nextPage.classList.remove("hidden");
      }
    }
  }
}

exports.page_handler =              page_handler;
exports.file_viewer_handler =       file_viewer_handler;
exports.display_information_modal = display_information_modal;
exports.toggle_loader =             toggle_loader;
exports.display_pdfviewer =         display_pdfviewer;
exports.uploader =                  uploader;
exports.display_formCreator =       display_formCreator;