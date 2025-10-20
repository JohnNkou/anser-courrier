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
  exports2.page_handler = function page_handler(navigationHandler, default_queries = {}) {
    let nextPage = document.querySelector(".nextPage"), prevPage = document.querySelector(".previousPage"), loader = document.querySelector("#loader"), with_queries = default_queries;
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
    function toggle_loader() {
      loader.classList.toggle("hidden");
    }
  };
});

// js/anser_view_util.js
var require_anser_view_util = __commonJS((exports2) => {
  var { page_handler } = require_anser_utily();
  function result_handler(json_response) {
    let { entries, total } = json_response.data;
    display_data(entries);
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
  function display_data(entries) {
    let trs = "", tbody = document.querySelector("tbody");
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
  function display_entry_data(entries, entry_id) {
    let modal = document.querySelector(".modal"), span_number_node = modal.querySelector(".courrier_number"), container = modal.querySelector("classMan"), datas = "";
    modal.classList.toggle("hidden");
    modal.onclick = function(event) {
      event.preventDefault();
      let target = event.target;
      if (target.classList.contains("close")) {
        modal.classList.toggle("hidden");
      }
    };
    entries.forEach((entry) => {
      datas += "<div>";
      for (let name in entry) {
        let value = entry[name];
        datas += "<p>" + name + "</p>";
        if (value.push) {
          datas += "<p>";
          value.forEach((v) => {
            datas += "<span>" + v + "</span>";
          });
          datas += "</p>";
        }
      }
      data += "</div>";
    });
    container.innerHTML = data;
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
  function entry_click_handler() {
    let tbody = document.querySelector("tbody");
    if (tbody) {
      tbody.addEventListener("click", (event) => {
        let target = event.target, entry_id = get_entry_id(target, 5);
        if (entry_id) {
          let queries = {
            view_id: _Page.view_id,
            entry_id,
            action: GravityAjax.entry,
            nonce: GravityAjax.nonce
          }, myPage_handler = new page_handler(null, queries);
          myPage_handler.load_data().then((json_response) => {
            let { entries } = json_response;
            display_entry_data(entries);
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
var { page_handler } = require_anser_utily();
var { result_handler, filter_handler, entry_click_handler } = require_anser_view_util();
var myPage_handler = new page_handler(result_handler);
var search_form = document.querySelector(".search_block");
if (typeof _Page != "undefined" && _Page.view_id) {
  filter_handler(myPage_handler);
  entry_click_handler();
  myPage_handler.addQueries({ id: _Page.view_id });
  if (_Page.filters) {
    search_form.addEventListener("submit", (event) => {
      event.preventDefault();
      let input = search_form.elements.s, value = input.value, queries;
      if (value.length) {
        queries = {
          term: value,
          mode: "any"
        };
        _Page.filters.forEach((filter_name) => {
          queries[filter_name] = value;
        });
        myPage_handler.removeQueries(["filter_workflow_final_status"]);
        myPage_handler.load_data(queries, 0).then(result_handler).then(() => {
          myPage_handler.addQueries(queries);
        });
      }
    });
  } else {
    console.error("No filter on _page constant");
  }
  myPage_handler.load_data().then(result_handler);
} else {
  if (typeof _Page == "undefined") {
    alert("_Page is undefined");
  }
  if (!_Page.view_id) {
    alert("No view_id found");
  }
}
