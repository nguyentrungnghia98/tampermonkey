// ==UserScript==
// @name         123av
// @namespace    http://tampermonkey.net/
// @version      2025-08-10
// @description  try to take over the world!
// @author       You
// @match        https://123av.ws/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=123av.ws
// @grant        none
// ==/UserScript==
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
(function() {
    'use strict';
initClick(() => findElementWithDirectText("Click here to continue"))
    // Your code here...
})();