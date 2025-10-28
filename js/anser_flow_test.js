var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// js/anser_utily.js
var require_anser_utily = __commonJS((exports2) => {
  function Anser_loader(offset = 0, page_size = 10, queries = {}) {
    let url = new URL(GravityAjax.ajax_url), searchParams = url.searchParams;
    searchParams.set("offset", offset);
    searchParams.set("limit", page_size);
    for (let name in queries) {
      searchParams.set(name, queries[name]);
    }
    return fetch(url, { method: "GET" });
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
  exports2.page_handler = function page_handler(navigationHandler, body, default_queries = {}) {
    let nextPage = body.querySelector(".nextPage"), prevPage = body.querySelector(".previousPage"), with_queries = default_queries;
    this.page = 0;
    this.total_page = 0;
    this.limit = 15;
    if (nextPage && prevPage) {
      nextPage.addEventListener("click", (event) => {
        this.goTo(this.page + 1).then((json_response) => {
          if (navigationHandler) {
            navigationHandler(json_response);
          }
        });
      });
      prevPage.addEventListener("click", (event) => {
        this.goTo(this.page - 1).then((json_response) => {
          if (navigationHandler) {
            navigationHandler(json_response);
          }
        });
      });
    } else {
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
      return this.load_data(with_queries, newPage * this.limit).then((json_response) => {
        this.page = newPage;
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
  };
  exports2.display_information_modal = display_information_modal;
  exports2.toggle_loader = toggle_loader;
  exports2.display_pdfviewer = display_pdfviewer;
});

// js/lib.js
var require_lib = __commonJS((exports2) => {
  function Attributes() {
    let attributes = {};
    this.append = function(name, value) {
      if (value != null) {
        let array = attributes[name];
        if (!array) {
          array = attributes[name] = [];
        }
        if (array.indexOf(value) == -1) {
          array.push(value);
        }
      } else {
        console.warn("VALUE PASSED TO APPEND IS UNDEFINED", arguments);
      }
    };
    this.set = function(name, value) {
      if (value != null) {
        attributes[name] = [value];
      } else {
        console.warn("VALUE PASSED TO SET IS UNDEFINED", arguments);
      }
    };
    this.remove = function(name, value) {
      if (value == undefined) {
        delete attributes[name];
      } else {
        let array = attributes[name];
        if (array) {
          let index = array.indexOf(value);
          if (index != -1) {
            array.splice(index, 1);
          }
        }
      }
    };
    this.toString = function() {
      let atts = [];
      for (let name in attributes) {
        atts.push(name.toString() + "='" + attributes[name].join(" ") + "'");
      }
      return atts.join(" ");
    };
  }
  function guid() {
    for (var t = new Date().getTime().toString(32), i = 0;i < 5; i++)
      t += Math.floor(65535 * Math.random()).toString(32);
    return t;
  }
  function generateUniqueID() {
    return "xxxxxxxx".replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  exports2.Attributes = Attributes;
  exports2.guid = guid;
  exports2.generateUniqueID = generateUniqueID;
  exports2.is_object = function($data) {
    return Object.prototype.toString.call($data) == Object.prototype.toString.call({});
  };
});

// js/anser_flow_utils.js
var require_anser_flow_utils = __commonJS((exports2) => {
  var { page_handler, display_information_modal, toggle_loader, display_pdfviewer } = require_anser_utily();
  var { Attributes, is_object, guid, generateUniqueID } = require_lib();
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
    } else {
      console.error("TBODY NOT FOUND");
    }
  }
  function handle_file_upload(input, field_ids, inboxes) {
    let files = input.files, id = input.getAttribute("id"), evolution_div = document.querySelector(".file_detail_" + id);
    if (id) {
      for (let _id in files) {
        let form = new FormData, file = files[_id], name = "o_" + guid(), field = get_field_by_location(field_ids[id], inboxes), settings = field["data-settings"], xhr = new XMLHttpRequest, p = document.createElement("p"), span = document.createElement("span"), span_2 = document.createElement("span");
        span_2.classList.add("percent");
        p.appendChild(span);
        p.appendChild(span_2);
        evolution_div.append(p);
        if (!field) {
          console.warn("No field found for id");
          continue;
        }
        xhr.open("POST", settings["url"], true);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            let { total, loaded } = event, percent = Math.ceil(loaded / total * 100) + "%";
            if (span_2.textContent == percent) {
              span_2.textContent = "Traitement...";
            } else {
              span_2.textContent = percent;
            }
          }
        };
        xhr.onload = function(event) {
          let text = xhr.response || xhr.responseText;
          try {
            text = JSON.parse(text);
            if (text.status) {
              if (text.status == "ok") {
                console.log("File", file.name, "uploading correctly");
                if (!field.uploads) {
                  field.uploads = [];
                }
                field.uploads.push([text.data]);
              }
            } else {
              console.error("Odd response returned from the server", text);
              alert("Fichier non transmis");
            }
          } catch (error) {
            console.warn("Error parsing text ", error);
          }
          span_2.textContent = "";
        };
        xhr.onerror = function(event) {
          alert("Une erreur est survenue lors de la transmission du fichier " + file.name);
        };
        form.append("name", name);
        for (let input_name in settings["multipart_params"]) {
          form.append(input_name, settings["multipart_params"][input_name]);
        }
        if (file.name.lastIndexOf(".") != -1) {
          name += file.name.slice(file.name.lastIndexOf("."));
        }
        form.append("gform_unique_id", generateUniqueID());
        form.append("original_filename", file.name);
        form.append("file", file);
        xhr.send(form);
      }
    } else {
      console.warn("Input field doesn't have an id");
    }
  }
  function get_entry_ids(node, repeat) {
    if (repeat && node) {
      let form_id = node.getAttribute("form_id"), entry_id = node.getAttribute("id"), entry_numero = node.getAttribute("numero");
      if (form_id && entry_id) {
        return { form_id, entry_id, numero: entry_numero };
      }
      return get_entry_ids(node.parentNode, repeat--);
    } else {
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
      } else {
        return value;
      }
    } else {
      return "";
    }
  }
  function should_display_field(field, field_ids, inboxes) {
    let display = true;
    if (field.rules) {
      field.rules.forEach((rule) => {
        let { fieldId, operator, value: ruleValue } = rule, field_location = field_ids[fieldId];
        if (field_location) {
          let _field = get_field_by_location(field_location, inboxes);
          if (_field) {
            let value = get_field_value(_field);
            if (value.push) {
              if (value.indexOf(ruleValue) == -1) {
                console.warn("CAN DISPLAY FIELD", field.label, "BECAUSE RULE DON'T SATISFY");
                console.warn("rule", field.rules);
                console.log("_field", _field);
                console.log("VALUE", value);
                display = false;
              }
            } else if (value != ruleValue) {
              console.warn("CAN DISPLAY FIELD", field.label, "BECAUSE RULE DON'T SATISFY");
              console.warn("rule", field.rules);
              console.log("_field", _field);
              console.log("VALUE", value);
              display = false;
            }
            return;
          }
        } else {
          console.error("FIELD in fieldId not found", fieldId);
          display = false;
          return;
        }
      });
    }
    return display;
  }
  function build_dependent_classe(rules) {
    return rules.map((rule) => "dependent_" + rule.fieldId).join(" ");
  }
  function get_field_by_location(location2, inboxes) {
    let indexes = location2.split(","), field = indexes.length == 2 && inboxes[indexes[0]][indexes[1]];
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
    let inboxes = payloads.inbox, entry_id = entry_data.entry_id, numero = entry_data.numero, form_title = payloads.form_title, main_node = document.querySelector(".entry-detail"), span_title = document.querySelector(".form_name"), span_entry_number = document.querySelector(".entry-id"), content_node = document.querySelector(".entry-detail .content"), back = document.querySelector(".entry-detail .back"), actionNodes = {}, bodyHtml = "", field_ids = {}, dependents = {}, required = {};
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
      let inSection = false, section_with_rules = false;
      _inboxes.forEach((inbox, _index) => {
        try {
          field_ids[inbox.id] = index + "," + _index;
          let inbox_index = index.toString() + "_" + _index, atts = new Attributes, inputAtts = new Attributes, failedAtts = new Attributes, value;
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
              dependents[rule.fieldId] = true;
            });
          } else {
            if (inbox.display == false) {
              atts.append("class", "hidden");
            }
          }
          switch (inbox.type) {
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
              bodyHtml += "<div " + atts.toString() + "><p>" + inbox.label + "</p><p>" + inbox.value + "</p></div>";
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
                  bodyHtml += "<div " + atts.toString() + " ><p>" + inbox.label + "</p><p><input " + inputAtts.toString() + " /></p><div " + failedAtts.toString() + "></div></div>";
                  break;
                case "textarea":
                  atts.append("class", "card");
                  inputAtts.remove("value");
                  bodyHtml += "<div " + atts.toString() + "><p>" + inbox.label + "</p><p><textarea " + inputAtts.toString() + ">" + value + "</textarea></p><div " + failedAtts.toString() + "></div></div>";
                  break;
                case "radio":
                  atts.append("class", "card");
                  bodyHtml += "<div " + atts.toString() + "><p>" + inbox.label + "</p><p>";
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
                  bodyHtml += "<div " + atts.toString() + "><p>" + inbox.label + "</p><div>";
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
                  bodyHtml += "<div " + atts.toString() + "><p>" + inbox.label + "</p><select " + inputAtts.toString() + "><option>Selectionner</option>";
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
                case "fileupload":
                  atts.append("class", "card");
                  inputAtts.remove("value");
                  inputAtts.remove("placeholder");
                  inputAtts.set("type", "file");
                  bodyHtml += "<div " + atts.toString() + "><p>" + inbox.label + "</p>";
                  bodyHtml += "<div><div><input " + inputAtts.toString() + " /></div><div>" + inbox.value + "</div><div class='file_detail_" + inbox.id + "'></div></div>";
                  bodyHtml += "</div>";
                  break;
                default:
                  console.error("unknwon inbox fieldType", inbox);
              }
              break;
            default:
              console.error("Unknwon inbox type", inbox);
          }
          if (inbox.action) {
            actionNodes[inbox_index] = inbox.action;
          }
        } catch (error) {
          console.error("GREAT ERROR");
          console.error(error);
        }
      });
      if (inSection) {
        bodyHtml += "</div></section>";
      }
    });
    content_node.onsubmit = (event) => {
      event.preventDefault();
      let form = event.target, fData = new FormData(form), url = new URL(GravityAjax.ajax_url), searchParams = url.searchParams, error_fields = document.querySelectorAll(".error-field");
      purge_error_nodes(error_fields);
      if (!check_validity({ form: fData, required, field_ids, inboxes })) {
        console.warn("Form is not valid");
        if (form.checkValidity) {
          form.checkValidity();
          return form.reportValidity();
        } else {
          display_information_modal("Veuillez completez les champs requis du formulaire").catch((error) => {
            console.error("Error whie", error);
          });
        }
        return;
      }
      searchParams.set("action", GravityAjax.flow_entry);
      searchParams.set("nonce", GravityAjax.flow_nonce);
      searchParams.set("id", entry_data.form_id);
      searchParams.set("entry_id", entry_data.entry_id);
      toggle_loader("Traitement");
      fetch(url, { method: "POST", body: fData }).then((response) => response.json()).then((json_response) => {
        let { success, data } = json_response, message = data && data.message;
        if (success) {
          let msg = message || "<h5>L'Operation a été effectué avec success</h5>";
          display_information_modal(msg).then(() => {
            toggle_loader("");
            location.reload();
          }).catch((error) => {
            alert("Une erreur est survenue");
            console.error(error);
          });
        } else {
          if (data.invalid_field) {
            data.invalid_field.forEach((invalid) => {
              let error_node = document.querySelector(".invalid-" + invalid.id);
              if (error_node) {
                error_node.textContent = invalid.message;
                error_node.classList.remove("hidden");
              } else {
                console.error("NO ERROR NODE FOUND FOR FIELD", invalid);
              }
            });
            display_information_modal("<h5>Veuillez vous assurez que tous les champs sont correctement rempli. Certain champs sont invalide</h5>").catch((error) => {
              alert("Une erreur est survenue");
              console.error(error);
            });
          } else {
            let msg = message || "<h5>L'operation n'a pas pu etre effectué</h5>";
            display_information_modal(msg).catch((error) => {
              alert("Une erreur est survenue");
              console.error(error);
            });
          }
        }
      }).catch((error) => {
        alert("Une erreur est survenue");
        console.error(error);
      }).finally(() => {
        toggle_loader();
      });
    };
    content_node.onchange = (event) => {
      let target = event.target, id = target.getAttribute("id");
      if (id) {
        if (dependents[id]) {
          let classes = build_dependent_classe([{ fieldId: id }]), deps = document.querySelectorAll("." + classes), length = deps.length;
          while (length--) {
            deps[length].classList.toggle("hidden");
          }
        }
        let field_location = field_ids[id];
        if (field_location) {
          let field = get_field_by_location(field_location, inboxes);
          if (field) {
            if (field.fieldType != "fileupload") {
              field.leaf_value = target.value;
            } else {
              if (target.files.length) {
                handle_file_upload(target, field_ids, inboxes);
              } else {
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
      } else if (target.href && target.href.toLowerCase().indexOf(".pdf") != -1) {
        event.preventDefault();
        display_pdfviewer(target.href).catch((error) => {
          console.error(error);
          alert("Une erreur est survenue lors de l'affichage du pdf");
        });
      }
    };
    content_node.innerHTML = bodyHtml;
  }
  function onglet_handler(contents) {
    let onglets = document.querySelector(".onglets");
    onglets.addEventListener("click", (event) => {
      event.preventDefault();
      let target = event.target, index = target.getAttribute("index");
      if (index != null) {
        if (!target.classList.contains("active")) {
          contents.forEach((content, _index) => {
            if (_index == index) {
              content.classList.remove("hidden");
            } else {
              content.classList.add("hidden");
            }
          });
          Array.prototype.forEach.call(onglets.children, (child, _index) => {
            if (index == _index) {
              child.classList.add("active");
            } else {
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
        }, myPage_handler = new page_handler(null, table, queries);
        entry_toggler();
        myPage_handler.load_data().then((json_response) => {
          display_entry(json_response.data, payloads);
        });
      } else {
        console.error("No entry_id and form_id found");
      }
    });
  }
  exports2.result_handler = result_handler;
  exports2.entry_click_handler = entry_click_handler;
  exports2.onglet_handler = onglet_handler;
});

// js/anser_view_util.js
var require_anser_view_util = __commonJS((exports2) => {
  var { page_handler } = require_anser_utily();
  function result_handler(json_response, table) {
    let { entries, total } = json_response.data;
    display_data(entries, table);
  }
  function filter_handler(page_handler2) {
    let filter_root = document.querySelector(".status_filter"), links = filter_root.querySelectorAll("a");
    function reset_link_style() {
      links.forEach((link) => {
        link.classList.remove("active");
      });
    }
    filter_root.onclick = function(event) {
      event.preventDefault();
      let target = event.target, value = target.getAttribute("data-value");
      if (target.tagName.toLowerCase() == "a") {
        if (!target.classList.contains("active")) {
          reset_link_style();
          target.classList.add("active");
          if (value) {
            page_handler2.removeQueries([..._Page.filters, "term"]);
            page_handler2.addQueries({ filter_workflow_final_status: value, mode: "all" });
          } else {
            page_handler2.removeQueries(["filter_workflow_final_status"]);
          }
          page_handler2.load_data({}, 0).then(result_handler);
        }
      }
    };
  }
  function display_data(entries, table) {
    let trs = "", tbody = table.querySelector("tbody");
    if (tbody) {
      entries.forEach((entry) => {
        let id = entry.id;
        trs += "<tr entry_id='" + id + "'>";
        for (let name in entry) {
          if (name == "id") {
            continue;
          }
          let value = entry[name];
          trs += "<td>";
          if (value.indexOf) {
            if (value.indexOf("http") == -1) {
              if (name == "État") {
                let className = "p-1 rounded text-white shadow-md";
                switch (value) {
                  case "pending":
                    className += " bg-blue-500";
                    break;
                  case "rejected":
                    className += " bg-red-500";
                    break;
                  default:
                    className += " bg-green-500";
                }
                trs += "<span class='" + className + "'> " + value + "</span>";
              } else {
                trs += value;
              }
            } else {
              let values = JSON.parse(value);
              values.forEach((value2) => {
                trs += "<a href='" + value2 + "'>";
                let name2 = value2.slice(value2.lastIndexOf("/") + 1);
                trs += name2;
                trs += "</a>";
              });
            }
          } else {
            trs += value.toString();
          }
          trs += "</td>";
        }
        trs += "</tr>";
      });
      tbody.innerHTML = trs;
    } else {
      console.error("No tbody found");
    }
  }
  function build_link(src) {
    let resource_name = src.slice(src.lastIndexOf("/") + 1), a = "<a target='_blank' href='" + src + "'>" + resource_name + "</a>";
    return a;
  }
  function has_index(keys, name) {
    let length = keys.length;
    while (length--) {
      if (name.toLowerCase().indexOf(keys[length]) != -1) {
        return true;
      }
    }
    return false;
  }
  function is_header(name) {
    let keys = ["soumis", "date", "heure"];
    return has_index(keys, name);
  }
  function is_contact(name) {
    let keys = ["téléphone", "e-mail", "adresse"];
    return has_index(keys, name);
  }
  function is_information(name) {
    let keys = ["numéro", "référence", "expéditeur", "objet", "commentaire"];
    return has_index(keys, name);
  }
  function is_documents(name) {
    let keys = ["scanné", "jointe"];
    return has_index(keys, name);
  }
  function display_entry_data(entry, entry_id) {
    let modal = document.querySelector(".modal"), span_number_node = modal.querySelector(".courrier_number"), container = modal.querySelector(".classMan"), headers = [], informations = [], contacts = [], documents = [], autres = [], datas = "";
    modal.classList.toggle("hidden");
    span_number_node.textContent = entry_id;
    modal.onclick = function(event) {
      let target = event.target;
      if (target.classList.contains("close")) {
        modal.classList.toggle("hidden");
        event.preventDefault();
      }
    };
    for (let entry_name in entry) {
      let value = entry[entry_name], current_slot;
      if (is_information(entry_name)) {
        current_slot = informations;
      } else if (is_header(entry_name)) {
        current_slot = headers;
      } else if (is_contact(entry_name)) {
        current_slot = contacts;
      } else if (is_documents(entry_name)) {
        current_slot = documents;
      } else {
        current_slot = autres;
      }
      current_slot.push("<div><p>" + entry_name + "</p>");
      if (value.push || Object.prototype.toString.call(value) == Object.prototype.toString.call({})) {
        current_slot.push("<p>");
        if (value.push) {
          value.forEach((v) => {
            if (v.indexOf("http") != -1) {
              v = build_link(v);
              current_slot.push(v);
            } else {
              current_slot.push("<span>" + v + "</span>");
            }
          });
        } else {
          for (let name in value) {
            let _value = value[name];
            if (_value) {
              if (_value.indexOf("http") != -1) {
                _value = build_link(value);
              }
              current_slot.push("<span>" + _value + "</span>");
            }
          }
        }
        current_slot.push("</p>");
      } else {
        current_slot.push("<p>" + value + "</p>");
      }
      current_slot.push("</div>");
    }
    if (headers.length) {
      datas += "<div class='information'>" + headers.join("") + "</div>";
    }
    if (informations.length) {
      datas += "<div class='card'>" + informations.join("") + "</div>";
    }
    if (contacts.length) {
      datas += "<div class='card'>" + contacts.join("") + "</div>";
    }
    if (documents.length) {
      datas += "<div class='card'>" + documents.join("") + "</div>";
    }
    if (autres.length) {
      datas += "<div class='card'>" + autres.join("") + "</div>";
    }
    container.innerHTML = datas;
  }
  function get_entry_id(node, deep) {
    let entry_id = node.getAttribute("entry_id");
    if (deep == 0) {
      return null;
    }
    if (entry_id) {
      return entry_id;
    } else {
      return get_entry_id(node.parentNode, deep - 1);
    }
  }
  function entry_click_handler(table) {
    let tbody = table.querySelector("tbody");
    if (tbody) {
      tbody.addEventListener("click", (event) => {
        let target = event.target, entry_id = get_entry_id(target, 5);
        if (entry_id) {
          let queries = {
            view_id: _Page.view_id,
            entry_id,
            action: GravityAjax.view_entry,
            nonce: GravityAjax.view_nonce
          }, myPage_handler;
          if (_Page.secret) {
            queries.secret = _Page.secret;
          }
          myPage_handler = new page_handler(null, table, queries);
          myPage_handler.load_data().then((json_response) => {
            let { entry } = json_response.data;
            display_entry_data(entry, entry_id);
          });
        } else {
          console.log("No entry id found");
        }
      });
    } else {
      console.error("No tbody found for registering entry_click_handler");
    }
  }
  exports2.result_handler = result_handler;
  exports2.filter_handler = filter_handler;
  exports2.entry_click_handler = entry_click_handler;
});

// js/anser_flow.js
var { page_handler } = require_anser_utily();
var { result_handler, entry_click_handler, onglet_handler } = require_anser_flow_utils();
var { result_handler: result_handler_2, entry_click_handler: entry_click_handler_2 } = require_anser_view_util();
var table = document.querySelector(".main-table");
var second_table = document.querySelector(".second-table");
var tbody = table.querySelector("tbody");
var myPage_handler = new page_handler((json_response) => result_handler(json_response, table), table);
var myPage_handler_2 = new page_handler((json_response) => result_handler_2(json_response, second_table), second_table);
var search_form = document.querySelector(".search_block");
if (typeof _Page != "undefined") {
  myPage_handler.addQueries({ action: GravityAjax.flow_action, security: GravityAjax.flow_nonce });
  myPage_handler_2.addQueries({ id: _Page.view_id, secret: _Page.secret, action: GravityAjax.view_action, security: GravityAjax.view_nonce });
  myPage_handler.load_data().then((json_response) => result_handler(json_response, table));
  myPage_handler_2.load_data().then((json_response) => result_handler_2(json_response, second_table));
  entry_click_handler(table);
  entry_click_handler_2(second_table);
  onglet_handler([table, second_table]);
  search_form.addEventListener("submit", (event) => {
    event.preventDefault();
    let form = event.target, input = form.elements.s;
    if (input.value.length) {
      let limit = myPage_handler.limit, queries = { term: input.value };
      myPage_handler.load_data(queries, 0, limit).then((json_response) => result_handler(json_response, table));
    } else {
      console.warn("Nothing to search for");
    }
  });
} else {
  console.error("No _Page found");
}
