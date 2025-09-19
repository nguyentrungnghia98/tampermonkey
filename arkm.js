// ==UserScript==
// @name         Arkm
// @namespace    http://tampermonkey.net/
// @version      2025-09-10
// @description  try to take over the world!
// @author       You
// @match        https://intel.arkm.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=arkm.com
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
  .arkm-message {
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
   .arkm-message--config {
      height: 0px;
      transition: height 0.1s;
      box-shadow: rgb(0 0 0 / 24%) 0px 3px 8px;
      background: white;
      position: relative;
      display: flex;
      overflow: hidden;
    }
    .arkm-message--open .arkm-message--config {
      height: 550px;
      width: 350px;
      display: flex;
      padding: 16px;
      border-radius: 8px;
      overflow-y: auto;
          white-space: pre-wrap;
              flex-direction: column;
    }
      .arkm-message--toggle {
      background: white;
      border: 1px solid #d9d9d9;
      padding: 4px 10px;
      border-radius: 4px;
      position: relative;
      cursor: pointer;
      font-weight: bold;
    }
    .arkm-message--close {
      background: white;
      border: 1px solid #d9d9d9;
      padding: 0px 4px;
      border-radius: 4px;
      position: relative;
      cursor: pointer;
      font-weight: bold;
      margin-left: 4px;
    }
      #arkm-option {
      height: 32px;
    width: 100%;
    }

    .arkm-message--list {
        display: flex;
        flex-direction: column;
    }

    .arkm-message--item {
        display: flex;
    }
`;

function convertCurrencyStringToNumber(currencyString) {
  // Check if the input is a valid string.
  if (typeof currencyString !== "string" || currencyString.trim() === "") {
    return null;
  }

  // Remove the dollar sign '$' and any commas ',' from the string.
  let cleanedString = currencyString.replace(/[\$,]/g, "").trim();

  // Initialize a multiplier to 1.
  let multiplier = 1;

  // Check for the 'B' (billion) suffix. The check is case-insensitive.
  if (cleanedString.endsWith("B") || cleanedString.endsWith("b")) {
    multiplier = 1e9; // 1 Billion
    // Remove the suffix from the string.
    cleanedString = cleanedString.slice(0, -1);
  }
  // Check for the 'M' (million) suffix.
  else if (cleanedString.endsWith("M") || cleanedString.endsWith("m")) {
    multiplier = 1e6; // 1 Million
    // Remove the suffix from the string.
    cleanedString = cleanedString.slice(0, -1);
  } else if (cleanedString.endsWith("K") || cleanedString.endsWith("k")) {
    multiplier = 1e3; // 1 K
    // Remove the suffix from the string.
    cleanedString = cleanedString.slice(0, -1);
  }

  // Convert the remaining cleaned string to a floating-point number.
  // The trim() method is used again to handle any leading/trailing whitespace
  // that may have been left after removing the suffix.
  const numberValue = parseFloat(cleanedString.trim());

  // Check if the parsed value is a valid number.
  if (isNaN(numberValue)) {
    return null;
  }

  // Multiply the number by the determined multiplier and return the result.
  return numberValue * multiplier;
}
function formatNumber(num) {
  const sign = num < 0 ? "-" : "+"; // Lấy dấu âm nếu có
  const absNum = Math.abs(num); // Lấy giá trị tuyệt đối để format

  if (absNum >= 1_000_000_000) {
    return `${sign}$${(absNum / 1_000_000_000)
      .toFixed(1)
      .replace(/\.0$/, "")}B`;
  } else if (absNum >= 1_000_000) {
    return `${sign}$${(absNum / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  } else if (absNum >= 1_000) {
    return `${sign}$${(absNum / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  } else {
    return `${sign}$${absNum}`;
  }
}
(function () {
  "use strict";

  addGlobalStyle(css);
  // Your code here...

  if (location.href.includes("intel.arkm.com/explorer")) {
    const minChange = localStorage.getItem("custom-min-change") || 100000;
    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div class="arkm-message">
            <div class="arkm-message--config">
            <div style="display: flex;">
            <select id="arkm-option" value="all">
            <option value="all">All</option>
            <option value="buy-only"> Buy only</option>
            <option value="sell-only">Sell only</option>
            </select>

            <div style="margin-left: 16px;display: flex;align-items: center;">
            <span>Min:</span>
      <input id="custom-min-change" value="${minChange}" />
            </div>
            </div>
            <div class="arkm-message--list"></div>
            </div>
            <div style="display: flex;">
              <button class="arkm-message--toggle">Open</button>
                <button class="arkm-message--close">x</button>
            </div>
            </div>
        `
    );
    document.querySelector(".arkm-message--toggle").onclick = (e) => {
      document
        .querySelector(".arkm-message")
        .classList.toggle("arkm-message--open");
    };

    document.querySelector(".arkm-message--close").onclick = () => {
      const elementToRemove = document.querySelector(".arkm-message"); // Replace '.my-element' with your actual selector

      if (elementToRemove) {
        elementToRemove.remove();
      }
    };

    setInterval(() => {
      try {
        const [col1, col2] = document.querySelectorAll(
          ".TimeMachine_portfolioGrid__TM8t4"
        );
        if (col1 && col2) {
          const assets1 = col1.querySelectorAll(".TimeMachine_asset__NlZLb");
          const holdings1 = col1.querySelectorAll(
            ".TimeMachine_holdings__8K5Nt"
          );
          const holdings2 = col2.querySelectorAll(
            ".TimeMachine_holdings__8K5Nt"
          );
          const tokens = [...assets1].map((item, index) => {
            const token = assets1[index].querySelector("a").innerText;
            const pre = convertCurrencyStringToNumber(
              holdings1[index].querySelector("span").innerText
            );
            const after = convertCurrencyStringToNumber(
              holdings2[index].querySelector("span").innerText
            );
            const changeAmount = after - pre;
            const changePercent = Math.abs(((after - pre) * 100) / pre);
            return { token, changeAmount, changePercent };
          });
          const option = document.getElementById("arkm-option").value;
          document.querySelector(".arkm-message--list").innerHTML = `
            ${tokens
              .filter((item) => {
                if (option === "all") return true;
                if (option === "buy-only") return item.changeAmount >= 0;
                return item.changeAmount < 0;
              })
              .filter(item => {
                const minChange1 = Number(document.getElementById("custom-min-change").value)
                return Math.abs(item.changeAmount) >= minChange1;
              })
              .sort((a, b) => b.changePercent - a.changePercent)
              .map((item, index) => {
                return `
              <div class="arkm-message--item">
              <span style="width: 40px;">${index + 1}.</span>
              <span style="width: 120px;">${item.token}</span>
              <span style="width: 90px; color:${item.changeAmount >= 0? 'green': 'tomato'};">${formatNumber(
                Number(item.changeAmount).toFixed(2)
              )}</span>
              <span style="width: 80px;">${Number(item.changePercent).toFixed(
                2
              )}%</span>
              </div>
              `;
              })
              .join("")}
          `;
        }
      } catch (error) {
        console.log(error);
      }
    }, 1000);
  }
})();
