// ==UserScript==
// @name         bullx-noti
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  auto retweet, follow, comment
// @author       You
// @match        https://neo.bullx.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        none
// ==/UserScript==

function convertKNotation(numberString) {
  if (typeof numberString !== 'string') {
    return "Invalid input: Input must be a string.";
  }

  const num = parseFloat(numberString); // Attempt to convert to a number

  if (isNaN(num)) {
    return "Invalid input: Could not parse number.";
  }

  const lastChar = numberString.slice(-1).toUpperCase(); // Get the last character (case-insensitive)

  switch (lastChar) {
    case 'K':
      return num * 1000;
    case 'M':
      return num * 1000000;
    case 'B':
      return num * 1000000000;
    default:
      return num; // If no K, M, or B, assume it's already a regular number
  }
}
(function () {
  "use strict";

  document.body.insertAdjacentHTML('beforeend', `
    <audio id="mySound" src="https://cdn.pixabay.com/audio/2023/06/01/audio_77fe776ce5.mp3">
    </audio>`);

  Notification.requestPermission();

    // để 0 thì không filter amount
    // 100 thì filter lệnh > $100
    const filterBuyAmount = 0;

    // true thì filter lệnh buy ra thôi
    // false thì noti cả buy + sell
    const filterBuy = true;

    const filterMarketCap = 10000;

    const autoOpenUrl = true;


  let isFirst = true;
  setInterval(() => {
    try {
      const listEl = document.querySelector(".shadow-2xl.drop-shadow-xl.relative .b-table .b-table-body .w-full.h-full div div div") || document.querySelector(".ant-modal-content .b-table .b-table-body .w-full.h-full div div div");
      if (listEl && listEl.children.length) {
        const alerts = [...listEl.children].map(item => {
          const [txEl, tokenEl, usdEl, marketCapEl, walletEl] = item.querySelectorAll(".b-table-cell");
          const [actionEl, tokenAEl] = tokenEl.firstChild.children

          const tx = txEl.querySelector("a").href;
          const time = txEl.querySelector("span").innerText;
          const action = actionEl.innerText;
          const url = tokenAEl.href;
          const tokenName = tokenAEl.innerText;
          const usd = convertKNotation(usdEl.innerText.slice(1));
          const marketCap = convertKNotation(marketCapEl.innerText.slice(1));
          const wallet = walletEl.querySelector("span.text-yellow-500").innerText
          return {time, action, url, tokenName, usd, wallet, tx, marketCap, marketCapDisplay: marketCapEl.innerText.slice(1)};
        });
          if (isFirst) {
console.log(alerts)
              isFirst = false;
}
        const findItem = alerts.find(item => {
          return !localStorage.getItem(item.tx) && item.time.includes('s') && (!filterBuyAmount || item.usd >= filterBuyAmount) && item.marketCap >= filterMarketCap && (filterBuy ? item.action === 'B' : true);
        });

        if (findItem) {
          localStorage.setItem(findItem.tx, "true");
            let newWindow;
            if (autoOpenUrl) newWindow = window.open(findItem.url);
          const noti = new Notification(`${findItem.wallet} ${findItem.action === "B"? "buy": "sell"} $${findItem.usd} ${findItem.tokenName}`, {
body: `at ${findItem.marketCapDisplay}`
})
          noti.addEventListener("click", e => {
            if (autoOpenUrl) {
               if (newWindow) {newWindow.focus()} else {window.focus()};
            } else {
                window.open(findItem.url);
            }
          });
          document.getElementById("mySound").play();
        }
      }
    } catch (error) {
      console.log("Error:", error);
    }

  }, 1000);
})();
