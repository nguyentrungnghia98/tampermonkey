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
  if (typeof numberString !== "string") {
    return "Invalid input: Input must be a string.";
  }

  const num = parseFloat(numberString); // Attempt to convert to a number

  if (isNaN(num)) {
    return "Invalid input: Could not parse number.";
  }

  const lastChar = numberString.slice(-1).toUpperCase(); // Get the last character (case-insensitive)

  switch (lastChar) {
    case "K":
      return num * 1000;
    case "M":
      return num * 1000000;
    case "B":
      return num * 1000000000;
    default:
      return num; // If no K, M, or B, assume it's already a regular number
  }
}

async function sendMessageFn(data) {
  return new Promise(async (resolve, reject) => {
    let end = false;
    setTimeout(() => {
      reject("sendMessage timeout");
    }, 1000);
    const result = await chrome.runtime.sendMessage("aepfgcacooaadbcjdkalijfkgljogcbl", data);
    end = true;
    resolve(result);
  });
}

async function getTabsFn() {
  try {
    const result = await sendMessageFn({
      channel: "pumpfun-launch",
      method: "get-current-tabs",
      params: {},
    });
    return result.tabs.filter((item) => item.windowId === result.windowId);
  } catch (error) {
    console.log("getTabsFn error", error);
    return [];
  }
}

async function getFocusTabFn(tabId, windowId) {
  try {
    await sendMessageFn({
      channel: "pumpfun-launch",
      method: "focus-tab",
      params: {
        tabId: tabId,
        windowId: windowId,
      },
    });
  } catch (error) {
    console.log("getFocusTabFn error", error);
  }
}

async function ping() {
  try {
    await chrome.runtime.sendMessage("aepfgcacooaadbcjdkalijfkgljogcbl", {
      channel: "pumpfun-launch",
      method: "ping",
      params: {},
    });
  } catch {}
}

(function () {
  "use strict";

  setInterval(() => {
    ping();
  }, 1000);

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <audio id="mySound" src="https://cdn.pixabay.com/audio/2023/06/01/audio_77fe776ce5.mp3">
    </audio>`
  );

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
  setInterval(async () => {
    try {
      const listEl =
        document.querySelector(
          ".shadow-2xl.drop-shadow-xl.relative .b-table .b-table-body .w-full.h-full div div div"
        ) ||
        document.querySelector(
          ".ant-modal-content .b-table .b-table-body .w-full.h-full div div div"
        );
      if (listEl && listEl.children.length) {
        const alerts = [...listEl.children].map((item) => {
          const [txEl, tokenEl, usdEl, marketCapEl, walletEl] =
            item.querySelectorAll(".b-table-cell");
          const [actionEl, tokenAEl] = tokenEl.firstChild.children;

          const tx = txEl.querySelector("a").href;
          const time = txEl.querySelector("span").innerText;
          const action = actionEl.innerText;
          const url = tokenAEl.href;
          const tokenName = tokenAEl.innerText;
          const usd = convertKNotation(usdEl.innerText.slice(1));
          const marketCap = convertKNotation(marketCapEl.innerText.slice(1));
          const wallet = walletEl.querySelector("span.text-yellow-500").innerText;
          return {
            time,
            action,
            url,
            tokenName,
            usd,
            wallet,
            tx,
            marketCap,
            marketCapDisplay: marketCapEl.innerText.slice(1),
          };
        });
        if (isFirst) {
          console.log(alerts);
          isFirst = false;
        }
        const items = alerts.filter((item) => {
          return (
            !localStorage.getItem(item.tx) &&
            item.time.includes("s") &&
            (!filterBuyAmount || item.usd >= filterBuyAmount) &&
            item.marketCap >= filterMarketCap &&
            (filterBuy ? item.action === "B" : true)
          );
        });

        for (let findItem of items) {
          localStorage.setItem(findItem.tx, "true");
          let newWindow;
          let existTab;
          if (autoOpenUrl) {
            const tabs = await getTabsFn();
            existTab = tabs.find((tab) => tab.url === findItem.url);
            if (existTab) {
              await getFocusTabFn(existTab.id, existTab.windowId);
            } else {
              newWindow = window.open(findItem.url);
            }
          }
          const noti = new Notification(
            `${findItem.wallet} ${findItem.action === "B" ? "buy" : "sell"} $${findItem.usd} ${
              findItem.tokenName
            }`,
            {
              body: `at ${findItem.marketCapDisplay}`,
            }
          );
          noti.addEventListener("click", async (e) => {
            if (autoOpenUrl) {
              if (existTab) {
                await getFocusTabFn(existTab.id, existTab.windowId);
              } else {
                if (newWindow) {
                  newWindow.focus();
                } else {
                  window.focus();
                }
              }
            } else {
              window.open(findItem.url);
            }
          });
        }

        if (items.length) document.getElementById("mySound").play();
      }
    } catch (error) {
      console.log("Error:", error);
    }
  }, 1000);
})();
