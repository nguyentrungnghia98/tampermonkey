// ==UserScript==
// @name         bt4gprx2
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  auto retweet, follow, comment
// @author       You
// @match        https://bt4gprx.com/search*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        none
// ==/UserScript==

function addGlobalStyle(css) {
  var head, style;
  head = document.getElementsByTagName("head")[0];
  if (!head) {
    return;
  }
  style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = css.replace(/;/g, " !important;");
  head.appendChild(style);
}

const css = `
 .toast-container1 {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
  }

  .toast1 {
    position: relative;
    background-color: #187b47 ;
    color: #fff;
    padding: 12px 20px;
    margin-top: 10px;
    border-radius: 8px;
    font-size: 15px;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }

  .toast1.show1 {
    opacity: 1;
    transform: translateY(0);
  }

  .toast1 .close-btn1 {
    position: absolute;
    top: 8px;
    right: 4px;
    font-weight: bold;
    font-size: 20px;
    color: #aaa;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .toast1:hover .close-btn1 {
    opacity: 1;
  }

  .toast1 .close-btn1:hover {
    color: #fff;
  }

#copy-magnet {
    position: fixed;
    z-index: 99999999999999999;
}
`;
function toast(message) {
    let container = document.querySelector(".toast-container1");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container1";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast1";

    const closeBtn = document.createElement("span");
    closeBtn.className = "close-btn1";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => {
      toast.classList.remove("show1");
      setTimeout(() => toast.remove(), 300);
    };

    toast.textContent = message;
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    // Force reflow to trigger animation
    void toast.offsetWidth;
    toast.classList.add("show1");

    const noti = new Notification(document.title, {
      body: message,
    });
    noti.addEventListener("click", async (e) => {
      window.focus();
    });
  }
(function () {
  "use strict";
  addGlobalStyle(css);



 setTimeout(() => {
try {
    document.querySelector(".navbar  .container .navbar-brand").insertAdjacentHTML("afterend", `<button id="search-magnet">Search</button>`)

    document.querySelector("#search-magnet").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        window.open(`https://google.com/search?q=fc2 ppv ${document.querySelector("#search").value}`)
})
    document.querySelector(".navbar  .container .navbar-brand").insertAdjacentHTML("afterend", `<button id="search-magnet">Search fc2ppvdb</button>`)

    document.querySelector("#search-magnet").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        window.open(`https://fc2ppvdb.com/articles/${document.querySelector("#search").value}`)
})
} catch(error){
console.log(error)
}
 }, 1000)

})();
