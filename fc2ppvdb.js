// ==UserScript==
// @name         gmgnUpdate
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description
// @author       You
// @match        https://gmgn.ai/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        none
// ==/UserScript==

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
(function () {
  setTimeout(() => {
    if (location.href.includes("sol/address"))
      document.getElementById("tabs-leftTabs--tab-0").click();
  }, 1000);
  setInterval(() => {
    try {
      if (location.href.includes("sol/address")) {
        const rows = document.querySelectorAll(
          "#tabs-leftTabs--tabpanel-0 .g-table-tbody .g-table-row"
        );
        rows.forEach((row) => {
          const a = row.querySelector("a");
          if (!a.href.includes("bullx")) {
            const href = `https://neo.bullx.io/terminal?chainId=1399811149&address=${
              a.href.split("/").slice(-1)[0]
            }&maker=${location.href.split("/").slice(-1)[0]}`;
            a.href = href;
            a.childNodes[1].href = href;
          }
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  }, 100);
})();
