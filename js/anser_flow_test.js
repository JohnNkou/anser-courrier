var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// js/anser_utily.js
var require_anser_utily = __commonJS((exports2) => {
  function Anser_loader(offset = 0, page_size = 10, search_term = "") {
    let url = new URL(GravityFlowAjax.ajax_url), searchParams = url.searchParams;
    searchParams.set("action", GravityFlowAjax.action);
    searchParams.set("security", GravityFlowAjax.nonce);
    searchParams.set("offset", offset);
    searchParams.set("limit", page_size);
    if (search_term) {
      searchParams.set("term", search_term);
    }
    return fetch(url, { method: "POST" });
  }
  exports2.page_handler = function page_handler(navigationHandler) {
    let nextPage = document.querySelector(".nextPage"), prevPage = document.querySelector(".previousPage"), loader = document.querySelector("#loader");
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
    this.goTo = (newPage) => {
      toggle_disable(true);
      return this.load_data(newPage * 10).then((json_response) => {
        this.page = newPage;
        console.log("THE NEW PAGE IS", this.page);
        display_nativation_handler(newPage, this.total_page);
        return json_response;
      }).finally(() => {
        toggle_disable(false);
      });
    };
    this.load_data = function(offset = this.page, limit = this.limit, search_term = "") {
      display("Chargements des données...");
      return Anser_loader(offset, limit, search_term).then((response) => response.json()).then((response) => {
        this.total_page = Math.ceil(response.data.total / this.limit);
        this.page = offset;
        display_nativation_handler(offset, this.total_page);
        return response;
      }).finally(() => {
        display("");
      });
    };
    function display_nativation_handler(page, total) {
      if (page == 0) {
        prevPage.style.display = "none";
      } else {
        prevPage.style.display = "inline";
      }
      if (page >= total - 1) {
        nextPage.style.display = "none";
      } else {
        nextPage.style.display = "inline";
      }
    }
    function display(text) {
      loader.textContent = text;
    }
  };
});

// js/anser_flow_utils.js
var require_anser_flow_utils = __commonJS((exports2) => {
  exports2.result_handler = function result_handler(json_response) {
    let { entries, field_values } = json_response.data;
    update_entries_ids(entries, field_values);
    build_elements(entries);
  };
  function update_entries_ids(entries, field_values) {
    entries.forEach((entry) => {
      let form_id = entry.form_id, form = field_values[form_id];
      if (form) {
        Object.keys(form).forEach((key) => {
          let field_id = form[key];
          entry[key] = entry[field_id];
          delete entry[field_id];
        });
      } else {
        console.error("No form_id " + form_id + " found in field_values");
      }
    });
  }
  function build_elements(entries) {
    var html = "", tbody = document.querySelector("tbody");
    if (tbody) {
      entries.forEach((entry) => {
        html += "<tr>";
        html += "<td>" + entry.created_by + "</td>";
        html += "<td>" + entry.workflow_step + "</td>";
        html += "<td>" + entry["numéro"] + "</td>";
        html += "<td>" + entry["objet"] + "</td>";
        html += "<td>" + entry["référence"] + "</td>";
        html += "</tr>";
      });
      tbody.innerHTML = html;
    } else {
      console.error("TBODY NOT FOUND");
    }
  }
});

// js/anser_gravity.js
var { page_handler } = require_anser_utily();
var { result_handler } = require_anser_flow_utils();
var myPage_handler = new page_handler(result_handler);
var search_form = document.querySelector(".search_block");
search_form.addEventListener("submit", (event) => {
  event.preventDefault();
  let form = event.target, input = form.elements.s;
  if (input.value.length) {
    let limit = myPage_handler.limit;
    myPage_handler.load_data(0, limit, input.value).then(result_handler);
    exports.load_data(0, exports.limit, input.value).then(result_handler);
  } else {
    console.warn("Nothing to search for");
  }
});
myPage_handler.load_data().then(result_handler);
