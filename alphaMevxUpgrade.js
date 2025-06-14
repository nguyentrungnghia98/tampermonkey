// ==UserScript==
// @name         alphaMevxUpgrade
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description
// @author       You
// @match        https://alpha.mevx.io/*
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
      bottom: 8px;
      right: 0;
      box-sizing: border-box;
      border-radius: 8px;
      padding-right: 16px;
      display: flex;
      flex-direction: column;
      align-items: end;
      color: black;
      font-size: 13px;
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
      height: 350px;
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
function setNativeValue(element, value) {
  const { set: valueSetter } =
    Object.getOwnPropertyDescriptor(element, "value") || {};
  const prototype = Object.getPrototypeOf(element);
  const { set: prototypeValueSetter } =
    Object.getOwnPropertyDescriptor(prototype, "value") || {};

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    throw new Error("Could not set value");
  }

  element.dispatchEvent(new Event("input", { bubbles: true }));
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findElementWithDirectText(text) {
  const elements = document.querySelectorAll("*");
  return Array.from(elements).find((el) => {
    // Lấy text node con trực tiếp của element
    for (let node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(text)) {
        return true;
      }
    }
    return false;
  });
}

function realClick(el) {
  if (!el) return;
  const event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(event);
}
// Example usage

function initClick(element) {
  let success = false;
  const interval = setInterval(async () => {
    if (success) {
      clearInterval(interval);
      return;
    }

    try {
      const elementValue = typeof element === "function" ? element() : element;
      if (elementValue) {
        realClick(elementValue);
      } else {
        throw new Error("not found");
      }
      success = true;
    } catch (error) {
      console.log("error 1", error);
    }
  }, 1000);
}

(function () {
  //////////////////
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
  if (message && message.trim() !== 'undefined') {
    try {
      document.body.insertAdjacentHTML(
        "beforeend",
        `
<div class="bullx-message bullx-message--open">
    <div class="bullx-message--config">${message.trim()}</div>
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

  if (location.href.includes("mevx.io/solana/")) {
      setTimeout(() => {
      initClick(() => {
      const matched = findElementWithDirectText("Auto TPSL");
      if (matched) {
        return matched.parentNode.querySelector("button");
      }
    });
    initClick(() => findElementWithDirectText("Holders"));
    initClick(() => findElementWithDirectText("5m"));
      },2000)
    
  }

  // dex info
  function getChain() {
    if (location.href.includes("/bsc/")) return "bsc";
    if (location.href.includes("/solana/")) return "solana";
    if (location.href.includes("/base/")) return "base";
    if (location.href.includes("/eth/")) return "eth";
  }

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
    try {
      const refLink =
        findElementWithDirectText("REF link").parentNode.querySelector(
          "span"
        ).textContent;
      return refLink.split("/").slice(-1)[0].split("?")[0];
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
        "main div.flex.flex-row.gap-4.overflow-x-auto.px-1.py-2.lg\\:px-3"
      );
      let dexPaid = document.getElementById("custom-dex-paid");
      let dexBoost = document.getElementById("custom-dex-boost");
      if (!dexPaid || !dexBoost) {
        box.innerHTML = `${box.innerHTML}<div class="hidden flex-col gap-1 md:flex" id="custom-dex-paid"></div><div class="hidden flex-col gap-1 md:flex" style="" id="custom-dex-boost"></div>`;
        dexPaid = document.getElementById("custom-dex-paid");
        dexBoost = document.getElementById("custom-dex-boost");
      }

      const { paids, boost } = await getDexInfo(address);

      dexPaid.innerHTML = `<p class="text-xs leading-[18px] font-medium text-gray-300">Dex paid${
        paids.length ? "✅" : ""
      }</p>${
        paids.length
          ? paids.map((item) => `<h1 class="text-[11px]">${item}</h1>`).join("")
          : "❌"
      }`;

      dexBoost.innerHTML = `<p class="text-xs leading-[18px] font-medium text-gray-300">Dex boost ${
        boost > 0 ? "⚡️" : ""
      }</p>
     <h1 class="text-[14px] uppercase font-bold" style="color: #f0b90b;">${
       boost || "❌"
     }</h1>`;
    } catch (error) {
      console.log("insertDexInfo error", error);
    }
  }

  sleep(2000).then(() => insertDexInfo());
  setInterval(() => {
    insertDexInfo();
  }, 10000);
})();
