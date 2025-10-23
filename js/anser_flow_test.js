var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// js/anser_utily.js
var require_anser_utily = __commonJS((exports2) => {
  function Anser_loader(offset = 0, page_size = 10, queries = {}) {
    let url = new URL(GravityAjax.ajax_url), searchParams = url.searchParams;
    searchParams.set("action", GravityAjax.action);
    searchParams.set("security", GravityAjax.nonce);
    searchParams.set("offset", offset);
    searchParams.set("limit", page_size);
    for (let name in queries) {
      searchParams.set(name, queries[name]);
    }
    return fetch(url, { method: "POST" });
  }
  exports2.page_handler = function page_handler(navigationHandler, body, default_queries = {}) {
    let nextPage = body.querySelector(".nextPage"), prevPage = body.querySelector(".previousPage"), loader = document.querySelector("#loader"), with_queries = default_queries;
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
    function toggle_loader() {
      loader.classList.toggle("hidden");
    }
  };
});

// js/anser_flow_utils.js
var require_anser_flow_utils = __commonJS((exports2) => {
  var { page_handler } = require_anser_utily();
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
  function get_entry_ids(node, repeat) {
    if (repeat && node) {
      let form_id = node.getAttribute("form_id"), entry_id = node.getAttribute("id"), entry_numero = node.getAttribute("numero");
      if (form_id && entry_id) {
        return { form_id, entry_id };
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
  function display_entry(payloads, entry_id, numero) {
    let { inbox: inboxes, form_title } = payloads, main_node = document.querySelector(".entry-detail"), span_title = document.querySelector(".form_name"), span_entry_number = document.querySelector(".entry-id"), content_node = document.querySelector(".entry-detail .content"), back = document.querySelector(".entry-detail .back"), bodyHtml = "";
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
    inboxes.forEach((_inboxes) => {
      let inSection = false;
      _inboxes.forEach((inbox) => {
        switch (inbox.type) {
          case "section":
            bodyHtml += "<section>";
            bodyHtml += "<h5 class='title'>" + inbox.value + "</h5>";
            bodyHtml += "<div>";
            inSection = true;
            break;
          case "html":
            bodyHtml += "<div class='card'>" + inbox.value + "</div>";
            break;
          case "text":
            bodyHtml += "<div class='card'><p>" + inbox.label + "</p><p>" + inbox.value + "</p></div>";
            break;
          default:
            console.error("Unknwon inbox type", inbox);
        }
      });
      if (inSection) {
        bodyHtml += "</div></section>";
      }
    });
    content_node.innerHTML = bodyHtml;
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
          action: GravityAjax.entry,
          nonce: GravityAjax.nonce
        }, myPage_handler = new page_handler(null, queries);
        entry_toggler();
        myPage_handler.load_data().then((json_response) => {
          display_entry(json_response.data, payloads.entry_id, payloads.numero);
        });
      } else {
        console.error("No entry_id and form_id found");
      }
    });
  }
  exports2.result_handler = result_handler;
  exports2.entry_click_handler = entry_click_handler;
});

// js/anser_flow.js
var { page_handler } = require_anser_utily();
var { result_handler, entry_click_handler } = require_anser_flow_utils();
var table = document.querySelector("table");
var tbody = table.querySelector("tbody");
var myPage_handler = new page_handler((json_response) => result_handler(json_response, tbody), table);
var search_form = document.querySelector(".search_block");
if (typeof _Page != "undefined") {
  myPage_handler.load_data().then((json_response) => result_handler(json_response, table));
  entry_click_handler(table);
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
