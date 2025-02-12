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
    #bullx-noti-test {
    height: 200px;
    overflow-y: auto;
    }
#bullx-noti-test div {
  font-size: 12px;
  margin-top: 4px;
}
.bullx-noti-bot {
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
   .bullx-noti-bot--config {
      height: 0px;
      transition: height 0.1s;
      box-shadow: rgb(0 0 0 / 24%) 0px 3px 8px;
      background: white;
      position: relative;
      display: flex;
      overflow: hidden;
    }
    .bullx-noti-bot--open .bullx-noti-bot--config {
      height: 600px;
      width: 500px;
      display: flex;
      padding: 12px 16px 0;
      border-radius: 8px;
      overflow-y: auto;
    }
    .custom-bullx-noti__input {
      display: flex;
    }
    .custom-bullx-noti__input div {
      width: 70px;
    }
    .custom-bullx-noti {
      width: 100%;
    }

  .custom-bullx-noti input, .custom-bullx-noti textarea, .bullx-noti-bot--recommend input {
    border-radius: .375rem;
    border: 1px solid #e2e8f0;
    padding: 4px 8px;
    width: 100%;
    background: white;
  }

  .custom-bullx-noti__label {
    margin-bottom: 0px;
    margin-top: 0px;
  }
  .custom-bullx-noti__error {
    color: tomato;
    font-style: italic;
    font-size: 12px;
  }
  .custom-bullx-noti__checkbox {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
    margin-bottom: 4px;
  }
  .custom-bullx-noti__checkbox input {
    margin-top: 0px;
    margin-right: 8px;
    width: unset;
  }
  .custom-bullx-noti__checkbox div {
    width: 100%;
  }
  .bullx-noti-bot--toggle {
      background: white;
      border: 1px solid #d9d9d9;
      padding: 8px 20px;
      border-radius: 4px;
      position: relative;
      cursor: pointer;
      font-weight: bold;
    }
    .bullx-noti-bot--close {
      background: white;
      border: 1px solid #d9d9d9;
      padding: 0px 4px;
      border-radius: 4px;
      position: relative;
      cursor: pointer;
      font-weight: bold;
      margin-left: 4px;
    }
    .custom-bullx-noti__divider {
    border: 1px solid #efefef;
    margin-top: 4px;
    margin-bottom: 4px;
}

.bullx-noti--wallets {
border-top: 1px solid #efefef;
}
.bullx-noti--wallets__title {
  margin-bottom: 0px;
}
.bot-twitter-profiles__item {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  padding-right: 16px;
}
.bot-twitter-profiles__item .bot-twitter-profiles__item-profile {
  width: 100%;
}
.bot-twitter-profiles__item .bot-twitter-profiles__item-keyword {
  width: 360px;
}
.bot-twitter-profiles__item .bot-form--wallets {
  margin-right: 8px;
}
.bullx-noti--remove-wallet {
  background: white;
  border: 1px solid #dadada;
  border-radius: 4px;
  margin-top: 24px;
      padding: 0px 8px;
}
#bot-add-wallet {
    background: #1c98eb;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    color: white;
}
`;

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
    const result = await chrome.runtime.sendMessage(
      "aepfgcacooaadbcjdkalijfkgljogcbl",
      data
    );
    end = true;
    resolve(result);
  });
}

async function getTabsFn() {
  try {
    const result = await sendMessageFn({
      channel: "bullx-noti",
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
      channel: "bullx-noti",
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
      channel: "bullx-noti",
      method: "ping",
      params: {},
    });
  } catch {}
}

function getAlerts() {
  const filterVolume = Number(
    document.getElementById("bullx-noti__filterVolume").value
  );
  const filterMarketCap = Number(
    document.getElementById("bullx-noti__filterMarketCap").value
  );
  const filterBuy = document.getElementById("bullx-noti__filterBuyTx").checked;

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

      const filterWallets = localStorage.getItem(
          "bullx-noti__filter-wallets"
        )
          ? JSON.parse(localStorage.getItem("bullx-noti__filter-wallets"))
          : [];

    return alerts.filter((item) => {
        const a = filterWallets.find(el => el.wallet.trim() === item.wallet.trim());
        const aFilterMarketCap = a? (Number(String(a.filterMarketCap).trim()) || 0): 0;
        const aFilterVolume = a? (Number(String(a.filterVolume).trim()) || 0): 0;
        const isValid = a? ((item.usd >= aFilterVolume) &&
        item.marketCap >= aFilterMarketCap): ((item.usd >= filterVolume) &&
        item.marketCap >= filterMarketCap);
      return (
        isValid &&
        (filterBuy ? item.action === "B" : true)
      );
    });
  }
  return [];
}

async function handleAddwallet() {
  const old = localStorage.getItem("bullx-noti__filter-wallets")
    ? JSON.parse(localStorage.getItem("bullx-noti__filter-wallets"))
    : [];

  const newProfiles = old.concat({
    createdAt: Date.now(),
    wallet: "",
    filterMarketCap: "20000",
    filterVolume: "400",
  });
  localStorage.setItem(
    "bullx-noti__filter-wallets",
    JSON.stringify(newProfiles)
  );

  renderProfiles(newProfiles);
}
async function removeProfile(profileId) {
  const currentProfiles = localStorage.getItem("bullx-noti__filter-wallets")
    ? JSON.parse(localStorage.getItem("bullx-noti__filter-wallets"))
    : [];

  const newProfiles = currentProfiles.filter(
    (profile) => profile.createdAt !== profileId
  );
  localStorage.setItem(
    "bullx-noti__filter-wallets",
    JSON.stringify(newProfiles)
  );

  renderProfiles(newProfiles);
}
function renderProfiles(profiles) {
  const content = profiles.reduce((cal, profile) => {
    const walletId = `wallet-wallet-${profile.createdAt}`;
    const filterMarketCapId = `wallet-filterMarketCap-${profile.createdAt}`;
    const filterVolumeId = `wallet-filterVolume-${profile.createdAt}`;

    return (
      cal +
      `<div class="bot-twitter-profiles__item">
      <div class="bot-form--wallets bot-twitter-profiles__item-profile">
        <label for="${walletId}">wallet:</label>
        <input value="${profile.wallet}" id="${walletId}" placeholder="" name="${walletId}">
      </div>
       <div class="bot-form--wallets bot-twitter-profiles__item-profile">
        <label for="${filterMarketCapId}">filterMarketCap:</label>
        <input value="${profile.filterMarketCap}" id="${filterMarketCapId}" placeholder="" name="${filterMarketCapId}">
      </div>
      <div class="bot-form--wallets bot-twitter-profiles__item-keyword">
        <label for="${filterVolumeId}">filterVolume:</label>
        <input value="${profile.filterVolume}" id="${filterVolumeId}" placeholder="" name="${filterVolumeId}">
      </div>
      <button id="remove-wallet-${profile.createdAt}" class="bullx-noti--remove-wallet">x</button>
    </div>`
    );
  }, "");

  document.querySelector(".bullx-noti--wallets__list").innerHTML = content;

  profiles.forEach((profile) => {
    const walletId = `wallet-wallet-${profile.createdAt}`;
    const filterMarketCapId = `wallet-filterMarketCap-${profile.createdAt}`;
    const filterVolumeId = `wallet-filterVolume-${profile.createdAt}`;

    [
      ["wallet", walletId],
      ["filterMarketCap", filterMarketCapId],
      ["filterVolume", filterVolumeId],
    ].forEach(([key, id]) => {
      document.querySelector(`#`+id).addEventListener("input", async (event) => {
        const amount = event.target.value;
        const currentProfiles = localStorage.getItem(
          "bullx-noti__filter-wallets"
        )
          ? JSON.parse(localStorage.getItem("bullx-noti__filter-wallets"))
          : [];

        const findProfile = currentProfiles.find(
          (el) => el.createdAt === profile.createdAt
        );
        if (findProfile) {
          findProfile[key] = amount;
          localStorage.setItem(
            "bullx-noti__filter-wallets",
            JSON.stringify(currentProfiles)
          );
        }
      });
    });
  });

  profiles.forEach((profile) => {
    document.querySelector(`#remove-wallet-${profile.createdAt}`).onclick =
      () => {
        removeProfile(profile.createdAt);
      };
  });
}

(function () {
  "use strict";

  setInterval(() => {
    ping();
  }, 1000);

  addGlobalStyle(css);

  document.body.insertAdjacentHTML(
    "beforeend",
    `
<div class="bullx-noti-bot">
    <div class="bullx-noti-bot--config">
    <div class="custom-bullx-noti" id="bullx-noti">

    <div class="custom-bullx-noti__label">filter volume</div>
    <input id="bullx-noti__filterVolume" />
    <div class="custom-bullx-noti__error" id="bullx-noti__filterVolume-error">
      Required
    </div>

    <div class="custom-bullx-noti__label" style="margin-top: 4px;">filter market cap</div>
    <input id="bullx-noti__filterMarketCap" />
    <div class="custom-bullx-noti__error" id="bullx-noti__filterMarketCap-error">
      Required
    </div>

    <div class="custom-bullx-noti custom-bullx-noti__checkbox" style="margin-top: 4px;">
        <input
          type="checkbox"
          id="bullx-noti__filterBuyTx"
        />
        <div class="custom-bullx-noti__label">filter buy tx</div>
      </div>
      <div class="custom-bullx-noti custom-bullx-noti__checkbox">
        <input
          type="checkbox"
          id="bullx-noti__autoOpenUrl"
        />
        <div class="custom-bullx-noti__label">auto open url</div>
      </div>
      <div class="bullx-noti--wallets">
<div class="bullx-noti--wallets__title">filter by wallets</div>
<div class="bullx-noti--wallets__list">
</div>
<div style="margin-top: 4px;">
  <button id="bot-add-wallet">Add</button>
</div>
</div>
      <div class="custom-bullx-noti__divider"></div>
      <div>Filter result:</div>
      <div id="bullx-noti-test">

      </div>
    </div>
    </div>
    <div style="display: flex;">
      <button class="bullx-noti-bot--toggle">Noti</button>
       <button class="bullx-noti-bot--close">x</button>
    </div>
    </div>
    <audio id="mySound" src="https://cdn.pixabay.com/audio/2023/06/01/audio_77fe776ce5.mp3">
    </audio>`
  );

  document.querySelector(".bullx-noti-bot--toggle").onclick = (e) => {
    document
      .querySelector(".bullx-noti-bot")
      .classList.toggle("bullx-noti-bot--open");
  };

  document.querySelector(".bullx-noti-bot--close").onclick = () => {
    const elementToRemove = document.querySelector(".bullx-noti-bot"); // Replace '.my-element' with your actual selector

    if (elementToRemove) {
      elementToRemove.remove();
    }
  };

  const defaultFilterVolume =
    localStorage.getItem("bullx-noti__filterVolume") || "400";
  document.getElementById("bullx-noti__filterVolume-error").style.display =
    isNaN(defaultFilterVolume) ||
    !defaultFilterVolume ||
    defaultFilterVolume <= 0
      ? "block"
      : "none";
  document.getElementById("bullx-noti__filterVolume").value =
    defaultFilterVolume;
  document
    .getElementById("bullx-noti__filterVolume")
    .addEventListener("input", async (event) => {
      const amount = event.target.value;
      localStorage.setItem("bullx-noti__filterVolume", amount);

      if (isNaN(amount) || !amount || amount <= 0) {
        document.getElementById(
          "bullx-noti__filterVolume-error"
        ).style.display = "block";
        document.getElementById("bullx-noti__filterVolume-error").innerText =
          "invalid";
      } else {
        document.getElementById(
          "bullx-noti__filterVolume-error"
        ).style.display = "none";
      }
    });

  const defaultFilterMarketCap =
    localStorage.getItem("bullx-noti__filterMarketCap") || "20000";
  document.getElementById("bullx-noti__filterMarketCap-error").style.display =
    isNaN(defaultFilterMarketCap) ||
    !defaultFilterMarketCap ||
    defaultFilterMarketCap <= 0
      ? "block"
      : "none";
  document.getElementById("bullx-noti__filterMarketCap").value =
    defaultFilterMarketCap;
  document
    .getElementById("bullx-noti__filterMarketCap")
    .addEventListener("input", async (event) => {
      const amount = event.target.value;
      localStorage.setItem("bullx-noti__filterMarketCap", amount);

      if (isNaN(amount) || !amount || amount <= 0) {
        document.getElementById(
          "bullx-noti__filterMarketCap-error"
        ).style.display = "block";
        document.getElementById("bullx-noti__filterMarketCap-error").innerText =
          "invalid";
      } else {
        document.getElementById(
          "bullx-noti__filterMarketCap-error"
        ).style.display = "none";
      }
    });

  const filterBuyTx = localStorage.getItem("custom-filterBuyTx");
  document.getElementById("bullx-noti__filterBuyTx").checked =
    filterBuyTx === null || filterBuyTx === "true";
  document
    .getElementById("bullx-noti__filterBuyTx")
    .addEventListener("change", (e) => {
      localStorage.setItem("custom-filterBuyTx", e.target.checked);
    });

  const autoOpenUrl = localStorage.getItem("custom-autoOpenUrl");
  document.getElementById("bullx-noti__autoOpenUrl").checked =
    autoOpenUrl === null || autoOpenUrl === "true";
  document
    .getElementById("bullx-noti__autoOpenUrl")
    .addEventListener("change", (e) => {
      localStorage.setItem("custom-autoOpenUrl", e.target.checked);
    });

  const filterWallets = localStorage.getItem("bullx-noti__filter-wallets")
    ? JSON.parse(localStorage.getItem("bullx-noti__filter-wallets"))
    : [];

  document.querySelector("#bot-add-wallet").onclick = () => {
    handleAddwallet();
  };
  renderProfiles(filterWallets);

  Notification.requestPermission();

  let isFirst = true;
  setInterval(async () => {
    try {
      const autoOpenUrl = document.getElementById(
        "bullx-noti__autoOpenUrl"
      ).checked;
      const alerts = getAlerts(true);
      try {
        document.getElementById("bullx-noti-test").innerHTML = alerts.length
          ? `
            ${alerts
              .map(
                (findItem) => `
            <div>${findItem.wallet} ${
                  findItem.action === "B" ? "buy" : "sell"
                } $${findItem.usd} ${findItem.tokenName} at ${
                  findItem.marketCapDisplay
                }</div>
            `
              )
              .join("")}
          `
          : `<i>empty</i>`;
      } catch (error) {
        document.getElementById("bullx-noti-test").innerHTML = "";
        console.log("render test error:", error);
      }

      const items = alerts.filter(
        (item) => !localStorage.getItem(item.tx) && item.time.includes("s")
      );
      if (isFirst) {
        console.log("items", items);
        isFirst = false;
      }
      if (!items.length) return;

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
          `${findItem.wallet} ${findItem.action === "B" ? "buy" : "sell"} $${
            findItem.usd
          } ${findItem.tokenName}`,
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
    } catch (error) {
      console.log("Error:", error);
    }
  }, 1000);
})();
