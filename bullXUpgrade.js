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
(function () {
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
          document.querySelector(`[data-node-key=history]`).click();
        }
      }
    } catch (error) {
      console.log("error 1", error);
    }
  }, 2000);
})();
