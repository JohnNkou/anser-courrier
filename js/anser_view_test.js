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
      for (let name in queries) {
        delete with_queries[name];
      }
    };
    this.goTo = (newPage) => {
      toggle_disable(true);
      return this.load_data(with_queries, newPage * 10).then((json_response) => {
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
  exports2.result_handler = function(json_response) {
    let { entries, total } = json_response.data;
    display_data(entries);
  };
  function display_data(entries) {
    let trs = "", tbody = document.querySelector("tbody");
    if (tbody) {
      entries.forEach((entry) => {
        trs += "<tr>";
        for (let name in entry) {
          let value = entry[name];
          trs += "<td>";
          if (value.indexOf) {
            if (value.indexOf("http") == -1) {
              trs += value;
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
});

// js/anser_view.js
var { page_handler } = require_anser_utily();
var { result_handler } = require_anser_view_util();
var myPage_handler = new page_handler(result_handler);
var search_form = document.querySelector(".search_block");
if (typeof _Page != "undefined" && _Page.view_id) {
  myPage_handler.addQueries({ id: _Page.view_id });
  search_form.addEventListener("submit", (event) => {
    event.preventDefault();
    let input = search_form.elements.s, value = input.value, queries;
    if (value.length) {
      queries = {
        term: value,
        filter_2: value,
        filter_4: value,
        mode: "any"
      };
      myPage_handler.load_data(queries, 0).then(result_handler).then(() => {
        myPage_handler.addQueries(queries);
      });
    }
  });
  myPage_handler.load_data().then(result_handler);
} else {
  if (typeof _Page == "undefined") {
    alert("_Page is undefined");
  }
  if (!_Page.view_id) {
    alert("No view_id found");
  }
}
