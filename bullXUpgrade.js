// ==UserScript==
// @name         bullXUpgrade
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description
// @author       You
// @match        https://neo.bullx.io/*
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
      bottom: 90px;
      right: 0;
      box-sizing: border-box;
      border-radius: 8px;
      padding-right: 16px;
      display: flex;
      flex-direction: column;
      align-items: end;
    }
   .bullx-message--config {
      height: 0px;
      box-shadow: rgb(0 0 0 / 24%) 0px 3px 8px;
      background: white;
      position: relative;
      display: flex;
      overflow: hidden;
    }
    .bullx-message--open .bullx-message--config {
      height: 525px;
      width: 500px;
      display: flex;
      padding: 16px 0px 0px 16px;
      border-radius: 8px;
      overflow-y: auto;
          white-space: pre-wrap;
    }
      .bullx-message--toggle {
      background: white;
      border: 1px solid #d9d9d9;
      padding: 8px 20px;
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

  //////////////////
  const twitters = [
    "binance",
    "MeteoraAG",
    "grok",
    "Tesla",
    "XData",
    "moonshotdotcc",
    "phantom",
    "pumpdotfun",
    "0xzerebro",
    "griffaindotcom",

    "shawmakesmagic",
    "aeyakovenko",
    "VitalikButerin",
    "elonmusk",
    "cz_binance",
    "realDonaldTrump",
    "blknoiz06",
    "wizardofsoho",
    "beeple",
    "AndyAyrey",
    "truth_terminal",
    "patty_fi",
    "bazingahappy",
    "TheRoaringKitty",
  ];

  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get("message");
  if (message) {
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

  setInterval(() => {
    // hide twitter
    try {
      const list =
        document.querySelector(
          " div.flex.flex-col.items-center.w-full.overflow-auto.no-scrollbar.p-3.pb-0.twitter-feed.relative.h-full"
        ) ||
        document.querySelector(
          ".flex.flex-col.items-center.w-full.overflow-auto.no-scrollbar.p-3.pb-0.twitter-feed.relative"
        );
      if (list) {
        [...list.children].forEach((item) => {
          const el = item.querySelector("article > a")
            ? item.querySelector("article > a")
            : item.querySelector("article  a");
          if (!el) return;
          const twitterUrl = el.href;
          const isValid = twitters.some((item) => twitterUrl.includes(item));
          if (!isValid) {
            item.style.display = "none";
          }
        });
      } else {
        // console.error("List not found");
      }
    } catch (error) {
      console.log("error", error);
    }

    // thêm 2 button dev portfolio + search X
    try {
      const parent = document.querySelector(
        `[data-node-key=deployedTokens]`
      ).parentNode;
      if (!document.querySelector(`[data-node-key=devPortfolio]`)) {
        const address = document
          .querySelector(`.ant-drawer-body .px-4.text-xs button[target=_blank]`)
          .attributes[0].value.split("/")
          .slice(-1)[0];
        parent.insertAdjacentHTML(
          "beforeend",
          `
            <div data-node-key="devPortfolio"  class="ant-tabs-tab"> <a class="ant-tabs-tab-btn" target="_blank" href="https://solscan.io/account/${address}#portfolio">Dev portfolio</a> </div>
            `
        );
      }

      if (!document.querySelector(`[data-node-key=searchX]`)) {
        parent.insertAdjacentHTML(
          "beforeend",
          `
            <div data-node-key="searchX" class="ant-tabs-tab"> <a  class="ant-tabs-tab-btn" target="_blank" href="https://x.com/search?q=${urlParams.get(
              "address"
            )}&src=typed_query">Search X</a> </div>
            `
        );
      }

      if (!document.querySelector(`[data-node-key=bubbleCustom]`)) {
        parent.insertAdjacentHTML(
          "beforeend",
          `
            <div data-node-key="bubbleCustom" class="ant-tabs-tab"> <a  class="ant-tabs-tab-btn" target="_blank" href="https://app.insightx.network/bubblemaps/solana/${urlParams.get(
              "address"
            )}?link=0&proxybutton=true">Bubble</a> </div>
            `
        );
      }
    } catch (error) {
      console.log("error", error);
    }

    // update href thêm maker
    try {
      const rows = document.querySelectorAll(
        ".ant-modal .b-table-body .b-table-row"
      );
      rows.forEach((row) => {
        const token = row.childNodes[1].querySelector("a");
        const maker = [...row.childNodes].slice(-1)[0];
        if (token && maker && !token.href.includes("maker")) {
          token.href =
            token.href +
            `&maker=${maker.querySelector("a").href.split("/").slice(-1)[0]}`;
        }
      });
    } catch (error) {
      console.log("error", error);
    }
  }, 100);

  // auto thêm maker
  setTimeout(async () => {
    try {
      if (location.href.includes("neo.bullx.io/terminal")) {
        const maker = urlParams.get("maker");
        if (maker) {
          [
            ...document.querySelectorAll(
              "main #rc-tabs-0-panel-trades .b-table-head .b-table-th"
            ),
          ]
            .slice(-1)[0]
            .querySelector("button")
            .click();
          await sleep(500);
          setNativeValue(
            document.querySelector(".ant-modal-body input"),
            maker
          );

          document.querySelectorAll(".ant-modal-body footer button")[1].click();
        } else {
          if (urlParams.get("tab")) {
            realClick(findElementWithDirectText(urlParams.get("tab")));
          } else {
            document.querySelector(`[data-node-key=history]`).click();
          }
        }

        if (document.querySelector(".ant-drawer-body .text-xs.font-medium"))
          document
            .querySelector(".ant-drawer-body .text-xs.font-medium")
            .click();
      }
    } catch (error) {
      console.log("error 1", error);
    }
  }, 2000);

  // dex info
  let savePaids = [];
  let saveBoost = 0;
  let init = false;
  async function getDexInfo(address) {
    let paids = [];
    try {
      const resp = await fetch(
        `https://api.dexscreener.com/orders/v1/solana/${address}`
      );
      const json = await resp.json();
      const tmp = json
        .filter((item) => item.status === "approved")
        .map((item) => item.type);
      paids = tmp.filter(function (item, pos) {
        return tmp.indexOf(item) == pos;
      });
    } catch (error) {
      console.log("error", error);
    }

    let boost = 0;

    try {
      const resp = await fetch(
        `https://api.dexscreener.com/token-pairs/v1/solana/${address}`
      );
      const json = await resp.json();
      boost = json[0].boosts ? json[0].boosts.active : 0;
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

  async function insertDexInfo() {
    console.log("----insertDexInfo");
    try {
      const box = document.querySelector(
        "div.flex.justify-between.md\\:justify-end.gap-x-\\[8px\\].md\\:gap-x-4.xl\\:gap-x-8.flex-1.border-t.border-b.border-grey-500.md\\:border-y-0.overflow-x-auto.no-scrollbar.md\\:flex-wrap.w-full.py-1.px-2.md\\:pr-8"
      );
      let dex = document.getElementById("custom-dex-info");
      if (!dex) {
        box.innerHTML = `<div id="custom-dex-info" class="flex items-center justify-center text-xs rounded p-1"></div>${box.innerHTML}`;
        dex = document.getElementById("custom-dex-info");
      }

      const { paids, boost } = await getDexInfo(urlParams.get("address"));
      dex.innerHTML = `<div class="flex flex-col items-start">
      <span class="font-normal text-grey-200 mb-[2px] whitespace-nowrap">Dex paid ${
        paids.length ? "✅" : ""
      }</span>
      <span class="font-medium text-grey-50" style="font-size: 11px;">${
        paids.length ? paids.join(", ") : "❌"
      }</span></div>
      <div class="flex flex-col items-start" style="margin-left: 32px;">
      <span class="font-normal text-grey-200 mb-[2px] whitespace-nowrap" >Dex boost ${
        boost > 0 ? "⚡️" : ""
      }</span>
      <span class="font-medium" style="color: #f0b90b;">${boost || "❌"}</span>
      </div>
      `;
    } catch (error) {
      console.log("insertDexInfo error", error);
    }
  }

  sleep(3000).then(() => insertDexInfo());
  setInterval(() => {
    insertDexInfo();
  }, 10000);
})();
