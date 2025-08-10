// ==UserScript==
// @name         javfc2
// @namespace    http://tampermonkey.net/
// @version      2025-08-10
// @description  try to take over the world!
// @author       You
// @match        https://javfc2.xyz/watch/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=javfc2.xyz
// @grant        none
// ==/UserScript==



(function() {
    'use strict';
 setTimeout(() => {
try {
    document.querySelector("#navbar1 .navbar-right").insertAdjacentHTML("afterend", `<button id="search-magnet">Search fc2ppvdb</button>`)

    document.querySelector("#search-magnet").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        window.open(`https://fc2ppvdb.com/articles/${document.querySelector("#search").value}`)
})
} catch(error){
console.log(error)
}
 }, 1000)
    // Your code here...
})();