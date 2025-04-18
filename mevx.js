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

(function () {
  //////////////////

  const urlParams = new URLSearchParams(window.location.search);

  // auto thêm maker
  let success = false;
  const interval = setInterval(async () => {
    if (success) {
      clearInterval(interval);
      return;
    }
    console.log("RUN----");
    try {
      if (location.href.includes("mevx.io/solana/")) {
        const matched = findElementWithDirectText("Auto TP/SL");
        if (matched) {
          realClick(matched.parentNode.querySelector("input"));
        } else {
          throw new Error("not found");
        }

        realClick(findElementWithDirectText("Top Traders"));
        realClick(findElementWithDirectText("5M"));
      }
      success = true;
    } catch (error) {
      console.log("error 1", error);
    }
  }, 2000);
})();
