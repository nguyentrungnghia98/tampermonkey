// ==UserScript==
// @name         filterBullXTwitter
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description
// @author       You
// @match        https://neo.bullx.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        none
// ==/UserScript==

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
    "TheRoaringKitty"
];
  setInterval(() => {
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
         const isValid = twitters.some(item => twitterUrl.includes(item));
if (!isValid) {
item.style.display = "none";
}
      });
    } else {
      // console.error("List not found");
    }
    } catch (error) {
console.log("error", error)
}
  }, 100);
})();
