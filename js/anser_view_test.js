var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// js/anser_utily.js
var require_anser_utily = __commonJS((exports2) => {
  function Anser_loader(offset = 0, page_size = 10, search_term = "") {
    let url = new URL(GravityAjax.ajax_url), searchParams = url.searchParams;
    searchParams.set("action", GravityAjax.action);
    searchParams.set("security", GravityAjax.nonce);
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
      return this.load_data("", newPage * 10).then((json_response) => {
        this.page = newPage;
        console.log("THE NEW PAGE IS", this.page);
        display_nativation_handler(newPage, this.total_page);
        return json_response;
      }).finally(() => {
        toggle_disable(false);
      });
    };
    this.load_data = function(search_term = "", offset = this.page, limit = this.limit) {
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
search_form.addEventListener("submit", (event) => {
  event.preventDefault();
  let input = search_form.elements.s, value = input.value;
  if (value.length) {
    myPage_handler.load_data(value, 0).then(result_handler);
  }
});
myPage_handler.load_data().then(result_handler);
