// ==UserScript==
// @name         fc2ppvdb
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  auto retweet, follow, comment
// @author       You
// @match        https://fc2ppvdb.com/*
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
.custom-btn-code {
    position: absolute;
    top: 7px;
    right: 13px;
    background: #0072ff;
    padding: 4px 10px;
    border-radius: 4px;
    color: white;
    z-index: 999999;
}
.custom-btn-code-watched {
    position: absolute;
    top: 7px;
    right: 13px;
    background: grey;
    padding: 4px 10px;
    border-radius: 4px;
    color: white;
    z-index: 999999;
}
    .custom-code {
      position: relative;
      margin-right: 16px;
    }
      .custom-code img{
        width: 150px;
      }
    .custom-list {
      display: flex;
      flex-wrap: wrap;
    }
    
`;

function findElementWithDirectText(text, parent) {
  const elements = (parent || document).querySelectorAll("*");
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

const backend = "https://telegram-bot-new-2-lingering-river-6317.fly.dev/";
async function sendBackendApi(url, method, body, headers, useLocal) {
  const response = await fetch(`${useLocal? backendLocal: backend}${url}`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: body? JSON.stringify(body): undefined,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return await response.json();
}
const parseJSON = (value, key) => {
  try {
    return value === "undefined" ? undefined : JSON.parse(value ?? "");
  } catch {
    if (key) {}
    // console.log("Parsing error on ", { key, value });
    return undefined;
  }
};
function getStorage(store, key) {
  try {
      const storedValue = parseJSON(localStorage.getItem(store)) || {};
      return storedValue[key];
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}": `, error);
      return undefined;
    }
}
function setStorage(store, key, value) {
  try {
      const storedValue = parseJSON(localStorage.getItem(store)) || {};
      storedValue[key] = value;
      localStorage.setItem(store, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}": `, error);
    }
}
async function getJavDetail(code) {
  const oldData = getStorage("fc2-data", code);
  if (oldData) return oldData;

  try {
    const html = await sendBackendApi("proxy", "POST", {
      method: "GET",
      url: `https://javfc2.xyz/watch/fc2ppv-${code}.html`,
    });
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const img = doc.querySelector(".tab-content img");
    const imgSrc = img? img.src: '';

    const label = findElementWithDirectText("Seller:", doc)
    const sellerEl = label? label.parentNode.querySelector("a"): null;
    const seller = sellerEl? sellerEl.innerText: '';
    const newData = {img: imgSrc, seller}

    setStorage("fc2-data", code, newData)
    return newData;
  } catch (error) {
    console.log(error)
  }
}

(function () {
  "use strict";
  addGlobalStyle(css);

  setInterval(() => {
    let list = (
      document.querySelector(".flex.flex-wrap.-m-4.pb-4") ||
      document.querySelector(".flex.flex-wrap.-m-4.py-4")
    ).children;
    if (!list) return;

    const stored = localStorage.getItem("custom-watched");
    const newValue = stored ? JSON.parse(stored) : {};
    [...list].forEach((item) => {
      let code = item.children[0].querySelector("span").innerText;
      if (!item.querySelector(".relative .custom-btn-code")) {
        let btn = document.createElement("button");
        btn.classList.add(
          newValue[code] ? "custom-btn-code-watched" : "custom-btn-code"
        );
        btn.innerHTML = newValue[code] ? "Watched" : `Open`;
        //btn.target = "_blank";
        // btn.href = `https://missav123.com/dm13/en/fc2-ppv-${code}`
        // btn.href = `https://123av.com/en/dm2/v/fc2-ppv-${code}`
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(`https://123av.ws/en/dm4/v/fc2-ppv-${code}`);
          window.open(`https://bt4gprx.com/search?q=${code}`);

          const stored = localStorage.getItem("custom-watched");
          const newValue = stored ? JSON.parse(stored) : {};
          newValue[code] = "true";
          localStorage.setItem("custom-watched", JSON.stringify(newValue));
        });
        getJavDetail(code).then(resp => {
          if (resp && resp.img) {
            const img = item.querySelector("img");
            if (img) {
              img.src = resp.img;
            }
          }
        })
        item.querySelector(".relative").insertAdjacentElement("beforeend", btn);
      }
    });
  }, 1000);
})();

// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// function findElementWithDirectText(text, parent) {
//   const elements = (parent || document).querySelectorAll("*");
//   return Array.from(elements).find((el) => {
//     // Lấy text node con trực tiếp của element
//     for (let node of el.childNodes) {
//       if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(text)) {
//         return true;
//       }
//     }
//     return false;
//   });
// }

// (function () {
//   addGlobalStyle(css);

//   setInterval(() => {
//     if (!document.querySelector(".custom-list")) {
//       try {
//         let codes = [];
//         try {
//           codes = document.querySelector("div > main > div > section .px-2.py-6 > div.flex.flex-nowrap").innerText.trim().split("\n");
//         } catch (error) {}
//         if (!codes.length) {
//           try {
//           codes = document.querySelector("div > main > div > section div.flex.flex-wrap").innerText.trim().split("\n");
//           } catch (error) {}
//         }
//         console.log('codes', codes);
//         if (codes.filter(item => Boolean(item)).length) {
//           const stored = localStorage.getItem("custom-watched");
//           const newValue = stored? JSON.parse(stored): {};

//           document.querySelector("main > div > section").insertAdjacentHTML("beforeend", `<div id="custom-list" class="custom-list">
//           ${codes.map(code => `<div id="custom-${code}" class="custom-code">
//             <button id="custom-btn-${code}" class="${newValue[code]? "custom-btn-code-watched": "custom-btn-code"}">${newValue[code]? "Watched": `Open`}</button>
//             </div>`).join("")}
//             </div>`);

//           codes.map(code => {
//             document.getElementById(`custom-btn-${code}`).addEventListener("click", (e) => {
//               e.preventDefault()
//               e.stopPropagation()
//               window.open(`https://123av.ws/en/dm4/v/fc2-ppv-${code}`)
//               window.open(`https://bt4gprx.com/search?q=${code}`)

//               const stored = localStorage.getItem("custom-watched");
//                   const newValue = stored? JSON.parse(stored): {};
//                   newValue[code] = "true";
//                   localStorage.setItem("custom-watched", JSON.stringify(newValue))
//             })

//             getJavDetail(code).then(resp => {
//               if (resp) {
//                 const item = document.getElementById(`custom-${code}`)
//                 if (item) {
//                   item.insertAdjacentHTML("beforeend", `
//                     <img src="${resp.img}" alt=""/>
//                     <div>${code}</div>
//                     <div>${resp.seller}</div>
//                     `)
//                 }
//               }
//             })
//           })
//         }
//       } catch (error) {
//         console.log(error)
//       }
//     }
//   }, 1000);
// })();
