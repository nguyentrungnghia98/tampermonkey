/* eslint-disable no-empty */
// ==UserScript==
// @name         Photon bot
// @namespace    https://photon-sol.tinyastro.io/en/trending
// @version      1.0
// @description  notify new tweet
// @author       You
// @match        https://photon-sol.tinyastro.io/en/trending
// @icon         https://photon-sol.tinyastro.io/assets/logo-m-2ea8bb5f9fb16a1eb7c67e8c2d7688ad6b04e11465b21ba388e4b3c5bcd83847.svg
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
    .photon-bot {
      position: fixed;
      top: 67px;
      width: 100%;
      text-align: center;
      padding: 0 12px;
      box-sizing: border-box;
      z-index: 999;
    }
    .photon-bot * {
      box-sizing: border-box;
      color: black;
    }
    .photon-bot--toggle {
      background: white;
      border: 1px solid #d9d9d9;
      padding: 8px 20px;
      border-radius: 4px;
      position: relative;
      cursor: pointer;
      font-weight: bold;
      color: black;
    }
    .photon-bot--toggle::after {
    content: "";
    position: absolute;
    bottom: -9px;
      left: 28px;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid #dbdbdb;
    }
    .photon-bot--config {
      height: 0px;
      transition: height 1s;
      box-shadow: rgb(0 0 0 / 24%) 0px 3px 8px;
      background: white;
      position: relative;
      display: flex;
      overflow-y: hidden;
    }
    .photon-bot--open .photon-bot--config {
      height: 350px;
      display: flex;
      flex-direction: column;
    }

    .photon-bot--form textarea {
      padding: 10px;
      max-width: 100%;
      line-height: 1.5;
      border-radius: 5px;
      border: 1px solid #ddd;
      background: white;
    }

    .photon-bot--form textarea:focus {
      outline: none;
    }

    .photon-bot--form input {
      padding: 10px;
      border-radius: 4px;
      outline: none;
      border: 1px solid #c9c9c9;
      width: 100%;
      background: white;
    }

    .bot-form--tweets label {
      display: block;
      margin-bottom: 10px;
    }
    .bot-checkbox {
      display: block;
      position: relative;
      padding-left: 24px;
      margin-bottom: 12px;
      cursor: pointer;
      font-size: 16px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    .bot-checkbox  input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }
    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 16px;
      width: 16px;
      background-color: #eee;
      border-radius: 4px;
    }
    .bot-checkbox:hover input ~ .checkmark {
      background-color: #ccc;
    }
    .bot-checkbox input:checked ~ .checkmark {
      background-color: #2196F3;
    }
    .bot-checkbox input:checked ~ .checkmark:after {
      display: block;
    }
    .bot-checkbox .checkmark:after {
      left: 9px;
      top: 5px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 3px 3px 0;
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      transform: rotate(45deg);
    }
    .photon-bot--donate {
      text-align: right;
      padding: 20px;
      border-bottom: 1px solid #ebebeb;
      margin-bottom: 20px;
    }
    .photon-bot--box {
      display: flex;
      padding-top: 20px;
    }
    .photon-bot--form {
      width: 50%;
    }
    .bot-form--header {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    .bot-form--content {
      text-align: left;
      padding: 0 24px;
      border-right: 1px solid #eeeeee;
    }
    .bot-form--tweets {
      margin-bottom: 16px;
    }
    .bot-form--tweets textarea {
      width: 100%;
    }

    .photon-bot--result {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .photon-bot--title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    .result-item span {
      margin-left: 8px;
    }
    .success span {
      color: #00dd1b;
    }
    .error span {
      color: tomato;
    }
    .error-detail {
      display: none;
    }
    .bot-form--submit {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
    }
    .bot-form--submit button {
      background: #1c98eb;
      border: none;
      padding: 8px 20px;
      border-radius: 4px;
      cursor: pointer;
      color: white;
    }
    .bot-form--submit button:disabled {
      background: #6da1c5;
      cursor: no-drop;
    }
    .photon-bot--list {
      max-height: 400px;
      overflow-y: scroll;
    }
    .random-tag {
      margin-left: 16px;
    }
    #photon-bot-number-tag {
      margin-left: 16px;
      width: calc(100% - 16px);
      margin-bottom: 16px;
    }
    .photon-bot--tweets {
      padding-top: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e8e8e8;
      border-top: 1px solid #e8e8e8;
      overflow-y: auto;
      max-height: 460px;
    }
    .photon-bot--tweets__title {
      font-weight: bold;
      font-size: 17px;
      margin-bottom: 16px;
    }
    .bot-photon-profiles__item {
      display: flex;
      align-items: center;
      width: 100%;
      justify-content: space-between;
      padding-right: 16px;
    }
    .bot-photon-profiles__item .bot-photon-profiles__item-profile {
      width: 100%;
    }
    .bot-photon-profiles__item .bot-photon-profiles__item-keyword {
      width: 360px;
    }
    .bot-photon-profiles__item .bot-form--tweets {
      margin-right: 8px;
    }
    .photon-bot--remove-tweet {
      background: white;
      border: 1px solid #dadada;
      border-radius: 4px;
      margin-top: 8px;
    }
  `;

// ****************** Handle logic call api photon ************************* //
function formatDate(time) {
  return new Date(time).toLocaleString();
}
function covertDisToNum(display) {
  const value = display.replaceAll("$", "");
  if (isNaN(value[value.length - 1])) {
    const unit = value[value.length - 1];
    const number = value.slice(0, value.length - 1);
    switch (unit) {
      case "K":
        return Number(number) * 1000;
      case "M":
        return Number(number) * 1000000;
      case "B":
        return Number(number) * 1000000000;
    }
  }
  return Number(value);
}
// ****************** Handle logic run bot ************************* //

let isBotStarted = false;
let intervalCurrent = undefined;
let oneDay = 24 * 60 * 60 * 1000;

async function sleep(millisecond) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, millisecond);
  });
}

function getPairAddress(url) {
  try {
    return url.split("?")[0].split("/").slice(-1)[0];
  } catch (error) {
    return "";
  }
}

async function checkPair(data) {
  try {
    const notiHistory = localStorage.getItem("photon-bot-noti-history-storage")
      ? JSON.parse(localStorage.getItem("photon-bot-noti-history-storage"))
      : {};

    const result = [];
    [...document.querySelector(".c-grid-table__body").children].map((row) => {
      const url = row.getAttribute("href");
      const pairAddress = getPairAddress(url);
      const createdElement = row.querySelector(
        `[data-cell-id="created_at"] .c-indx-table__cell__left`
      );
      const createdAt = createdElement.getAttribute("data-timestamp");
      const createdDisplay = createdElement.innerText;
      const lidDisplay = row.querySelector(
        `[data-cell-id="liq"] .c-indx-table__cell__subtext`
      ).innerText;
      const marketCapDisplay = row.querySelector(
        `[data-cell-id="mkt_cap"] .c-indx-table__cell__left`
      ).innerText;
      const marketValue = covertDisToNum(marketCapDisplay);
      const volumeDisplay = row.querySelector(
        `[data-cell-id="volume"] .c-indx-table__cell__left`
      ).innerText;
      const volumeValue = covertDisToNum(volumeDisplay);
      const tokenName = row.querySelector(
        `[data-cell-id="pair_info"] .c-indx-table__cell .c-indx-table__cell__left`
      ).innerText;
      const address = row
        .querySelector(
          `[data-cell-id="pair_info"] .c-indx-table__cell__subtext  .js-index-table__pair`
        )
        ?.getAttribute("data-address");

      const [m1, m5, m03, h1] = ["1m", "5m", "30m", "1h"].map((time) => {
        return row.querySelector(`[data-cell-id="${time}"]`).innerText;
      });
      result.push({
        url,
        createdAt,
        createdDisplay,
        lidDisplay,
        marketCapDisplay,
        marketValue,
        volumeDisplay,
        volumeValue,
        tokenName,
        address,
        m1,
        m5,
        m03,
        h1,
        pairAddress,
      });
    });
    const validTokens = result.filter((row) => {
      if (Date.now() < data.minimumCreatedDay * oneDay + row.createdAt * 1000)
        return false;
      if (row.marketValue > data.maximumMarketCap) return false;
      if (row.marketValue < data.minimumMarketCap) return false;
      if (row.volumeValue > data.maximumVolume) return false;
      if (row.volumeValue < data.minimumVolume) return false;

      if (
        notiHistory[row.address] &&
        notiHistory[row.address].createdAt +
          data.ignoreAlreadyNotiSeconds * 1000 >
          Date.now()
      )
        return false;

      let numberInvalid = 0;
      for (const time of ["m1", "m5", "m03", "h1"]) {
        if (row[time] === "-") numberInvalid++;
        const percent = row[time].replace("%", "");
        if (Number(percent) < 0) numberInvalid++;
      }
      if (numberInvalid === 4) return false;

      return true;
    });

    console.log("validTokens", validTokens, new Date().toLocaleString());
    validTokens.forEach((item) => {
      notiHistory[item.address] = {
        createdAt: Date.now(),
      };
    });

    localStorage.setItem(
      "photon-bot-noti-history-storage",
      JSON.stringify(notiHistory)
    );

    for (const token of validTokens) {
      const priceChanges = ["m1", "m5", "m03", "h1"]
        .map(
          (time) =>
            `${time.split("").reverse().join("")}: <b>${token[time]}</b>\n`
        )
        .join("");
      await fetch(
        `https://api.telegram.org/bot7055694912:AAE816iCQTjGTLcwGg0RZ4r5luWTdt5D3jM/sendMessage`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: -1002001434759,
            text: `<b>${token.tokenName}</b>\n\nMarket Cap:  <b>${token.marketCapDisplay}</b>\nVolume:  <b>${token.volumeDisplay}</b>\nLiquidity:  <b>${token.lidDisplay}</b>\nCreated:  <b>${token.createdDisplay}</b>\n\nPrice Change:\n${priceChanges}\n${token.address}\n\n<a href="https://photon-sol.tinyastro.io${token.url}">Photon</a>\n\n<a href="https://dexscreener.com/solana/${token.pairAddress}">Dexscreener</a>`,
            parse_mode: "HTML",
          }),
        }
      );
      await sleep(1000);
    }
  } catch (error) {
    console.log("checkPair error:", error);
  }
}

async function startBot() {
  if (isBotStarted) {
    document.querySelector("#photon-bot-start").innerHTML = "Start";
    isBotStarted = false;
    try {
      clearInterval(intervalCurrent);
    } catch {}
    return;
  }
  // const { minimumCreatedDay, minimumMarketCap, maximumMarketCap, minimumVolume, maximumVolume, interval, ignoreAlreadyNotiSeconds } = local;
  const data = {};
  const fields = [
    "interval",
    "minimumCreatedDay",
    "minimumMarketCap",
    "maximumMarketCap",
    "minimumVolume",
    "maximumVolume",
    "interval",
    "ignoreAlreadyNotiSeconds",
  ];
  for (const field of fields) {
    const value = document.querySelector(`#photon-bot-${field}`).value;
    if (!value.trim()) {
      return alert(`Please enter ${field}!`);
    }
    if (isNaN(value.trim())) {
      return alert(`Invalid number - ${field}!`);
    }
    data[field] = Number(value.trim());
  }

  const interval = Number(data["interval"]) * 1000;

  document.querySelector("#photon-bot-start").innerHTML = "Stop";
  isBotStarted = true;

  localStorage.setItem("photon-bot-storage", JSON.stringify(data));

  checkPair(data);
  intervalCurrent = setInterval(() => {
    checkPair(data);
  }, interval);
}

// ***************** Handle render **************************//

(function () {
  "use strict";
  addGlobalStyle(css);

  const local = localStorage.getItem("photon-bot-storage")
    ? JSON.parse(localStorage.getItem("photon-bot-storage"))
    : {
        minimumCreatedDay: 7,
        minimumMarketCap: 4000,
        maximumMarketCap: 100000,
        minimumVolume: 1000,
        maximumVolume: 25000,
        interval: 10,
        ignoreAlreadyNotiSeconds: 60 * 60,
      };

  const {
    minimumCreatedDay,
    minimumMarketCap,
    maximumMarketCap,
    minimumVolume,
    maximumVolume,
    interval,
    ignoreAlreadyNotiSeconds,
  } = local;

  let div = document.createElement("div");
  div.classList.add("photon-bot");
  div.innerHTML = `
    <div class="photon-bot--config">
       <div class="photon-bot--box">
       <div class="photon-bot--form">
          <div class="bot-form--header">Photon Noti Bot</div>

          <div class="bot-form--content">
            <div class="bot-form--tweets">
              <label for="minimumCreatedDay">Minimum Created Day:</label>
              <input value="${minimumCreatedDay}" id="photon-bot-minimumCreatedDay" placeholder="Enter Minimum Created Day" name="minimumCreatedDay">
            </div>
            <div style="display: flex; align-items: center;justify-content: space-between; margin-top: 12px;">
              <div class="bot-form--tweets">
                <label for="minimumMarketCap">Minimum Market Cap:</label>
                <input value="${minimumMarketCap}" id="photon-bot-minimumMarketCap" placeholder="Enter Minimum Market Cap" name="minimumMarketCap">
              </div>
              <div class="bot-form--tweets">
                <label for="maximumMarketCap">Maximum Market Cap:</label>
                <input value="${maximumMarketCap}" id="photon-bot-maximumMarketCap" placeholder="Enter Maximum Market Cap" name="maximumMarketCap">
              </div>
            </div>
            <div style="display: flex; align-items: center;justify-content: space-between; margin-top: 12px;">
              <div class="bot-form--tweets">
                <label for="minimumVolume">Minimum Volume:</label>
                <input value="${minimumVolume}" id="photon-bot-minimumVolume" placeholder="Enter Minimum Volume" name="minimumVolume">
              </div>
              <div class="bot-form--tweets">
                <label for="maximumVolume">Maximum Volume:</label>
                <input value="${maximumVolume}" id="photon-bot-maximumVolume" placeholder="Enter Maximum Volume" name="maximumVolume">
              </div>
            </div>
          </div>
       </div>
       <div class="photon-bot--form" style="display: flex;">
       <div class="bot-form--content" style="margin-top: 76px; width: 100%;">
       <div class="bot-form--tweets">
       <label for="ignoreAlreadyNotiSeconds">Ignore Already Noti Seconds:</label>
       <input value="${ignoreAlreadyNotiSeconds}" id="photon-bot-ignoreAlreadyNotiSeconds" placeholder="Enter Ignore Already Noti Seconds" name="ignoreAlreadyNotiSeconds">
     </div>
     <div class="bot-form--tweets" style="margin-top: 12px;">
           <label for="interval">Interval (second):</label>
           <input value="${interval}" id="photon-bot-interval" placeholder="Enter interval" name="interval">
         </div>

       <div style="display: flex; align-items: flex-end;margin-top: 12px;">
       <div class="bot-form--submit">
       <button id="photon-bot-start">Start</button>
     </div>
       </div>
       </div>
       </div>
       </div>
    </div>
    <button class="photon-bot--toggle">Open</button>
    `;
  document.querySelector("body").appendChild(div);

  document.querySelector(".photon-bot--toggle").onclick = () => {
    document.querySelector(".photon-bot").classList.toggle("photon-bot--open");
  };

  document.querySelector("#photon-bot-start").onclick = () => {
    startBot();
  };
  // Your code here...
})();
