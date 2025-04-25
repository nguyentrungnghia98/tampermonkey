// ==UserScript==
// @name         mevxUpgrade
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description
// @author       You
// @match        https://mevx.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        none
// ==/UserScript==

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

  const urlParams = new URLSearchParams(window.location.search);
  if (location.href.includes("mevx.io/solana/")) {
    initClick(() => {
      const matched = findElementWithDirectText("Auto TP/SL");
      if (matched) {
        return matched.parentNode.querySelector("input");
      }
    });
    initClick(() => findElementWithDirectText("Top Traders"));
    initClick(() => findElementWithDirectText("5M"));
  }

  // dex info
  function getChain() {
    if (location.href.includes("/bsc/")) return "bsc";
    if (location.href.includes("/solana/")) return "solana";
    if (location.href.includes("/base/")) return "base";
    if (location.href.includes("/eth/")) return "eth";
  }
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
    return { paids, boost };
  }

  function getAddress() {
    try {
      const refLink =
        findElementWithDirectText("REF link").parentNode.querySelector(
          "button"
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
        "#root div.flex.flex-col.gap-2.rounded-lg.bg-dark-500 > div.grid.grid-cols-2.gap-1.px-4"
      );
      let dexPaid = document.getElementById("custom-dex-paid");
      let dexBoost = document.getElementById("custom-dex-boost");
      if (!dexPaid || !dexBoost) {
        box.innerHTML = `${box.innerHTML}<div role="button" tabindex="0" aria-disabled="false" aria-roledescription="sortable" aria-describedby="DndDescribedBy-0" class="rounded-lg bg-dark-400 px-2 py-1 lg:p-2" style="" id="custom-dex-paid"></div><div role="button" tabindex="0" aria-disabled="false" aria-roledescription="sortable" aria-describedby="DndDescribedBy-0" class="rounded-lg bg-dark-400 px-2 py-1 lg:p-2" style="" id="custom-dex-boost"></div>`;
        dexPaid = document.getElementById("custom-dex-paid");
        dexBoost = document.getElementById("custom-dex-boost");
      }

      const { paids, boost } = await getDexInfo(address);

      dexPaid.innerHTML = `<p class="text-textSub text-[12px] uppercase truncate">Dex paid${
        paids.length ? "✅" : ""
      }</p>${
        paids.length
          ? paids.map((item) => `<h1 class="text-[11px]">${item}</h1>`).join("")
          : ""
      }`;

      dexBoost.innerHTML = `<p class="text-textSub text-[12px] uppercase truncate">Dex boost ${
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
