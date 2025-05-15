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

  .bullx-message {
      z-index: 999999999999;
      position: absolute;
      bottom: 38px;
      left: 0;
      box-sizing: border-box;
      border-radius: 8px;
      padding-left: 10px;
      display: flex;
      flex-direction: column;
      color: black;
    }
   .bullx-message--config {
      height: 0px;
      transition: height 0.1s;
      box-shadow: rgb(0 0 0 / 24%) 0px 3px 8px;
      background: white;
      position: relative;
      display: flex;
      overflow: hidden;
    }
    .bullx-message--open .bullx-message--config {
      height: 460px;
      width: 300px;
      display: flex;
      padding: 16px 0px 0px 16px;
      border-radius: 8px;
      overflow-y: auto;
          white-space: pre-wrap;
    }
      .bullx-message--toggle {
      background: white;
      border: 1px solid #d9d9d9;
      padding: 4px 10px;
      border-radius: 4px;
      position: relative;
      cursor: pointer;
      font-weight: bold;
    }
    .bullx-message--close {
      background: white;
      border: 1px solid #d9d9d9;
      padding: 0px 4px;
      border-radius: 4px;
      position: relative;
      cursor: pointer;
      font-weight: bold;
      margin-left: 4px;
    }
`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
(function () {
  addGlobalStyle(css);

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
  const urlParams = new URLSearchParams(window.location.search);

  const message = urlParams.get("message");
  if (message) {
    const content = message
      .trim()
      .split("\n")
      .filter(
        (item) => !item.startsWith("MCap:") && !item.includes("Dex Paid:")
      )
      .join("\n");
    try {
      document.body.insertAdjacentHTML(
        "beforeend",
        `
<div class="bullx-message bullx-message--open">
    <div class="bullx-message--config">${content}</div>
    <div style="display: flex;">
      <button class="bullx-message--toggle">Message</button>
       <button class="bullx-message--close">x</button>
    </div>
    </div>
`
      );
      document.querySelector(".bullx-message--toggle").onclick = (e) => {
        document
          .querySelector(".bullx-message")
          .classList.toggle("bullx-message--open");
      };

      document.querySelector(".bullx-message--close").onclick = () => {
        const elementToRemove = document.querySelector(".bullx-message"); // Replace '.my-element' with your actual selector

        if (elementToRemove) {
          elementToRemove.remove();
        }
      };
    } catch (error) {
      console.log("show message error", error);
    }
  }

  /////////

  let savePaids = [];
  let saveBoost = 0;
  let init = false;
  async function getDexInfo(address) {
    let paids = [];
    try {
      const resp = await fetch(
        `https://api.dexscreener.com/orders/v1/${getChain()}/${address}`
      );
      const json = await resp.json();
      paids = json
        .filter((item) => item.status === "approved")
        .map((item) => item.type);
    } catch (error) {
      console.log("error", error);
    }

    let boost = 0;

    try {
      const resp = await fetch(
        `https://api.dexscreener.com/token-pairs/v1/${getChain()}/${address}`
      );
      const json = await resp.json();
      boost = json[0].boosts.active;
    } catch (error) {
      console.log("error", error);
    }

    if (init) {
      if (savePaids.length === 0 && paids.length !== 0) {
        toast(`Dex paid. ${new Date().toLocaleTimeString()}`);
      } else if (saveBoost === 0 && boost !== 0) {
        toast(`Dex boost ${boost}. ${new Date().toLocaleTimeString()}`);
      }
    }
    savePaids = paids;
    saveBoost = boost;

    init = true;
    return { paids, boost };
  }

  function getAddress() {
    if (!location.href.startsWith("https://gmgn.ai/sol/token/")) return "";
    try {
      return location.pathname.split("/").slice(-1)[0];
    } catch (error) {
      console.log("getAddress error", error);
    }
  }
  async function insertDexInfo() {
    console.log("----insertDexInfo");
    try {
      const address = getAddress();
      if (!address) throw new Error("address not found!");
      const box = document.querySelector(
        "#GlobalScrollDomId  div.flex.justify-between.items-center.px-16px.overflow-auto.gap-10px.border-b-line-100 > div.flex.items-end"
      );
      let dexPaid = document.getElementById("custom-dex-paid");
      let dexBoost = document.getElementById("custom-dex-boost");
      if (!dexPaid || !dexBoost) {
        box.innerHTML = `<div class="flex flex-col text-sm leading-[16px] font-medium" style="    margin-right: 16px;" id="custom-dex-paid"></div><div class="flex flex-col text-sm leading-[16px] font-medium" style="    margin-right: 16px;" id="custom-dex-boost"></div>${box.innerHTML}`;
        dexPaid = document.getElementById("custom-dex-paid");
        dexBoost = document.getElementById("custom-dex-boost");
      }

      const { paids, boost } = await getDexInfo(address);

      dexPaid.innerHTML = `<div class="flex items-center text-text-300 font-normal whitespace-nowrap gap-x-2px"><span>Dex paid${
        paids.length ? "✅" : ""
      }</span></div><div>${
        paids.length
          ? paids.map((item) => `<h1 class="text-[11px]">${item}</h1>`).join("")
          : "❌"
      }</div>`;

      dexBoost.innerHTML = `<div class="flex items-center text-text-300 font-normal whitespace-nowrap gap-x-2px"><span>Dex boost ${
        boost > 0 ? "⚡️" : ""
      }</span></div><div>
     <h1 class="text-[14px] uppercase font-bold" style="color: #f0b90b;">${
       boost || "❌"
     }</h1></div>`;
    } catch (error) {
      console.log("insertDexInfo error", error);
    }
  }

  sleep(2000).then(() => insertDexInfo());
  setInterval(() => {
    insertDexInfo();
  }, 10000);

  ////////

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
            }&maker=${
              location.href.split("/").slice(-1)[0].split("_").slice(-1)[0]
            }`;
            a.href = href;
            a.childNodes[1].href = href;
          }
        });
      }
      if (location.href.includes("base/address")) {
        const rows = document.querySelectorAll(
          "#tabs-leftTabs--tabpanel-0 .g-table-tbody .g-table-row"
        );
        rows.forEach((row) => {
          const a = row.querySelector("a");
          if (!a.href.includes("maker")) {
            const href = `https://gmgn.ai/base/token/${
              a.href.split("/").slice(-1)[0]
            }?maker1=${
              location.href.split("/").slice(-1)[0].split("_").slice(-1)[0]
            }`;
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
