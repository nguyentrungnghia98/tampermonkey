// ==UserScript==
// @name         daosfun
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description
// @author       You
// @match        https://www.daos.fun/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        none
// ==/UserScript==

(function () {
  document.body.insertAdjacentHTML('beforeend', `
    <audio id="mySound" src="https://cdn.pixabay.com/audio/2024/11/29/audio_0b4f12f995.mp3">
    </audio>`);

  let isInit = true;
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function check() {
    try {
      const response = await fetch('https://www.daos.fun/api/trpc/daos,banner_events.list,price.get_sol_price,discovery.sorted_daos,discovery.featured,founder_dao.live_daos?batch=1&input={"0":{"page_size":200},"3":{"interval":"24h","sort_by":"mcap","sort_order":"desc","page_size":20,"page_cursor":0,"dao_type":"partner"},"4":{"dao_type":"founder"},"5":{"limit":16,"offset":0}}', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      const daos = result[result.length - 1].result.data.daos;
      if (isInit) {
        isInit = false;
        console.table(daos.map(item => ({dao_mint: item.dao_mint, twitter_username: item.twitter_username})));
      } else {
        const find = daos.find(item => !Boolean(localStorage.getItem(`custom-daos-tool-${item.dao_mint}`)))
        if (find) {
          window.open(`https://x.com/${find.twitter_username}`);
          const newWindow = window.open(`https://www.daos.fun/dao/${find.dao_mint}`);
          const noti = new Notification(
            `New DAO deployed!`,
            {
              body: find.dao_mint,
            }
          );
          noti.addEventListener("click", async (e) => {
                  newWindow.focus();
          });
          document.getElementById("mySound").play();
        }
      }
      daos.forEach(item => {
        localStorage.setItem(`custom-daos-tool-${item.dao_mint}`, true)
      })
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function start() {
    const tmp = Date.now();
    await check();
    const time = Date.now() - tmp;
    if (time < 2000) {
      await sleep(2000 - time);
    }
    await start();
  }
  start();
})();
