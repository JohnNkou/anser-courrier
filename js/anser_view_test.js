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
  function file_viewer_handler(node) {
    node.addEventListener("click", (event) => {
      let target = event.target;
      if (target.href && /\.(pdf|jpg|jpeg|png|gif)/.test(target.href)) {
        event.preventDefault();
        event.stopPropagation();
        display_pdfviewer(target.href).catch((error) => {
          console.error(error);
          alert("Une erreur est survenue lors de l'affichage du pdf");
        });
      }
    });
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
  exports2.page_handler = function page_handler(navigationHandler, body, default_queries = {}) {
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
  };
  exports2.file_viewer_handler = file_viewer_handler;
  exports2.display_information_modal = display_information_modal;
  exports2.toggle_loader = toggle_loader;
  exports2.display_pdfviewer = display_pdfviewer;
  exports2.uploader = uploader;
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
            action: GravityAjax.view_entry_action,
            nonce: GravityAjax.view_entry_nonce
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

// js/anser_view.js
var { page_handler, file_viewer_handler } = require_anser_utily();
var { result_handler, filter_handler, entry_click_handler } = require_anser_view_util();
var search_form = document.querySelector(".search_block");
var table = document.querySelector(".main-table");
var tbody = table.querySelector("tbody");
var myPage_handler = new page_handler(result_handler, table);
if (typeof _Page == "undefined" || !_Page.view_id) {
  console.error("_Page object should have a view_id property");
} else {
  let queries = { id: _Page.view_id, action: GravityAjax.view_action, security: GravityAjax.view_nonce };
  if (_Page.secret) {
    queries.secret = _Page.secret;
  }
  filter_handler(myPage_handler);
  entry_click_handler(table);
  file_viewer_handler(document.body);
  myPage_handler.addQueries(queries);
  if (_Page.filters) {
    search_form.addEventListener("submit", (event) => {
      event.preventDefault();
      let input = search_form.elements.s, value = input.value, queries2;
      if (value.length) {
        queries2 = {
          term: value,
          mode: "any"
        };
        _Page.filters.forEach((filter_name) => {
          queries2[filter_name] = value;
        });
        myPage_handler.removeQueries(["filter_workflow_final_status"]);
        myPage_handler.load_data(queries2, 0).then((json_response) => result_handler(json_response, table)).then(() => {
          myPage_handler.addQueries(queries2);
        });
      }
    });
  } else {
    console.error("No filter on _page constant");
  }
  myPage_handler.load_data().then((json_response) => result_handler(json_response, table));
}
