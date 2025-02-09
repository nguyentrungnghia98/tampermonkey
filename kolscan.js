// ==UserScript==
// @name         kolscan
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  auto retweet, follow, comment
// @author       You
// @match        https://kolscan.io/*
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
.custom-traders {
}
.custom-traders .transaction_transactionContainer {

}
.transaction_transactionContainer a{
text-align: right;
}
.transaction_transactionContainer > div {
display: flex;
justify-content: space-between;
}
#custom-activity-list {
display: grid
;
    gap: 20px;
    grid-template-columns: repeat(auto-fit, minmax(var(--min-width), 1fr));
    padding-bottom: 25px;
    }
.custom-activity-list-divider {
    height: 1px;
    width: 100%;
    background: gray;
    margin-top: 40px;
    margin-bottom: 40px;
}
.custom-activity-list-divider2 {
    height: 1px;
    width: 100%;
    background: gray;
    margin-top: 4px;
    margin-bottom: 4px;
}
    .trades_kolBox {
    background-color: var(--box-color);
    border: .5px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 16px;
    height: 250px;
    display: flex
;
    flex-direction: column;
    overflow: hidden;
    font-size: 17px;
}
.trades_kolHeader {
    display: flex
;
    font-size: 20px;
    font-weight: 550;
    gap: 10px;
    align-items: center;
    flex-shrink: 0;
}
.trades_kolTxns {
    overflow-y: auto;
    flex-grow: 1;
    margin-top: 10px;
    margin-right: -12px;
    padding-right: 12px;
}
.transaction_transactionContainer {
    display: grid
;
    grid-template-columns: 15% 70% 15%;
    align-items: center;
    border-radius: 5px;
    transition: background-color .1sease;
}
  `;

// ****************** Handle logic run bot ************************* //

// ***************** Handle render **************************//
(function () {
  "use strict";
  addGlobalStyle(css);

  setInterval(() => {
console.log("check")
    try {
if (!document.getElementById("custom-activity-list")) {
     let div = document.createElement("div");
  div.id = "custom-activity-list";
  div.innerHTML = ``;
  let h1 = document.querySelectorAll(".outer-container > h1")[1];
  h1.parentNode.insertBefore(div, h1.nextSibling);
}

const list = document.querySelector(".trades_kolsContainer__YZCa9").children;
    const result = [...list]
      .map((item) => {
        const twitterEl = item.querySelector("a");
        const twitterName = twitterEl.innerText;
        const twitterImage = twitterEl.querySelector("img").src;

        const isEmpty = item.querySelector(".loading-color");

        return {
          twitterName,
          twitterImage,
          txs: isEmpty
            ? []
            : [...item.children[1].children].map((tx) => {
                const [actionEl, contentEl, timeEl] = tx.children;
                const action = actionEl.innerText;
                const time = new Date(timeEl.title).getTime();
                const arr = contentEl.innerText.split("\n");
                const tokenContent = action === "Sell" ? arr[0] : arr[1];
                const tokenName = tokenContent.split(" ")[1];
                return {
                  element: tx,
                  tokenName,
                    time
                };
              }),
        };
      })
      .filter((item) => item.txs.length > 0);

    let format = [];
    result.forEach((item) => {
      item.txs.forEach((tx) => {
        const index = format.findIndex((item) => item.tokenName === tx.tokenName);
        const newTx = {
          twitterImage: item.twitterImage,
          twitterName: item.twitterName,
          element: tx.element,
            time: tx.time
        };
        if (index >= 0) {
          const exist = format[index].txs.find(a => a.twitterName === newTx.twitterName);
          if (!exist) format[index].txs.push(newTx);
        } else {
          format.push({
            tokenName: tx.tokenName,
            txs: [newTx],
          });
        }
      });
    });
        format = format.map(item => {
             return {
...item,
txs: item.txs.sort((a,b) => b.time-a.time)
}
       })
format = format.sort((a,b) => b.txs[0].time - a.txs[0].time)

    document.getElementById("custom-activity-list").innerHTML = `
${format
  .map((item) => {
    return `
    <div class="trades_kolBox">
<div class="trades_kolHeader">
<p class="cursor-pointer text-base">${item.tokenName}</p>
</div>
<div class="custom-activity-list-divider2"></div>
<div class="trades_kolTxns">
${item.txs
  .map((el) => {
    return `
        <div class="custom-traders">
        <div class="trades_kolHeader" ><div style="position: relative; min-width: 20px; width: 20px; min-height: 20px; height: 20px; overflow: hidden; display: inline-block; border-radius: 1000px; cursor: pointer;"><img alt="kol pfp" loading="lazy" decoding="async" data-nimg="fill" src="${el.twitterImage}" style="position: absolute; height: 100%; width: 100%; inset: 0px; object-fit: cover; color: transparent;"></div>${el.twitterName}</div>
        <div class="transaction_transactionContainer">
        ${el.element.innerHTML}
        </div>
        </div>
        `;
  })
  .join("")}
</div>
    </div>
    `;
  })
  .join("")}
<div class="custom-activity-list-divider"></div>
`;
} catch (error) {
console.log("error", error)}
  }, 1000);
})();
