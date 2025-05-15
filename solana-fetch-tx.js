// ==UserScript==
// @name         Solana Transactions Fetcher
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fetch Solana transactions and display them in a list with top 5 results.
// @author       You
// @match        https://gmgn.ai/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Add custom styles
  const style = document.createElement('style');
  style.textContent = `
  .custom-gmgn-bot {
      z-index: 999999999999;
      position: absolute;
      bottom: 38px;
      right: 0;
      box-sizing: border-box;
      border-radius: 8px;
      padding-right: 10px;
      display: flex;
      flex-direction: column;
      align-items: end;
    }
   .custom-gmgn-bot--config {
      height: 0px;
      transition: height 0.1s;
      box-shadow: rgb(0 0 0 / 24%) 0px 3px 8px;
      background: white;
      position: relative;
      display: flex;
      overflow: hidden;
    }
    .custom-gmgn-bot--open .custom-gmgn-bot--config {
      height: 700px;
      width: 1000px;
      display: flex;
      padding: 12px 16px 0;
      border-radius: 8px;
      overflow-y: auto;
      background: black;
    }
        .custom-gmgn-bot--toggle {
      background: white;
      border: 1px solid #d9d9d9;
      padding: 4px 12px;
      border-radius: 4px;
      position: relative;
      cursor: pointer;
      color: black;
    }
    .custom-gmgn-bot--close {
      background: white;
      border: 1px solid #d9d9d9;
      padding: 0px 4px;
      border-radius: 4px;
      position: relative;
      cursor: pointer;
      font-weight: bold;
      margin-left: 4px;
    }
    .custom-tool-container {
      max-width: 1200px;
      width: 100%;
    }
    .custom-tool-input-group {
      margin-bottom: 10px;
    }
    .custom-tool-input-group label {
      display: block;
      margin-bottom: 5px;
    }
    .custom-tool-input-group input, .custom-tool-input-group select {
      width: 100%;
      padding: 5px;
    }
    .custom-tool-button-group {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .custom-tool-button-group button {
      padding: 5px 10px;
      cursor: pointer;
    }
    .custom-tool-result-list {
      margin-top: 6px;
    }
    .custom-tool-result-list .item {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    .custom-tool-result-list .custom-tool-item a {
      color: #656565;
      text-decoration: underline;
    }
    .custom-tool-time-group {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .custom-tool-time-group input[type="number"] {
      width: 80px;
    }
    .custom-tool-input-groups {
      display: flex;
    align-items: center;
    justify-content: space-between;
      }
    .custom-gmgn-bot--config button {
    background: #1664b5;
    padding: 4px 12px;
    border-radius: 4px;
    }
    .custom-tool-item {
          display: flex
      ;
      }
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="custom-gmgn-bot">
    <div class="custom-gmgn-bot--config">
     </div>
    <div style="display: flex;">
      <button class="custom-gmgn-bot--toggle">Noti</button>
       <button class="custom-gmgn-bot--close">x</button>
    </div>
    </div>
    `);

    document.querySelector(".custom-gmgn-bot--toggle").onclick = (e) => {
      document
        .querySelector(".custom-gmgn-bot")
        .classList.toggle("custom-gmgn-bot--open");
    };

    document.querySelector(".custom-gmgn-bot--close").onclick = () => {
      const elementToRemove = document.querySelector(".custom-gmgn-bot"); // Replace '.my-element' with your actual selector

      if (elementToRemove) {
        elementToRemove.remove();
      }
    };


  // Helper function to create elements
  function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    Object.keys(attributes).forEach((key) => {
      element[key] = attributes[key];
    });
    children.forEach((child) => {
      element.appendChild(child);
    });
    return element;
  }

  // Helper function to format date
  function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
  }

  // Main function to initialize the UI
  function init() {
    const container = createElement('div', { className: 'custom-tool-container' });
    const group = createElement('div', { className: 'custom-tool-input-groups' });
    // Token Address Input
    const tokenAddressInput = createElement('input', { type: 'text', placeholder: 'Token Address' });
    const tokenAddressGroup = createElement('div', { className: 'custom-tool-input-group' }, [
      createElement('label', { textContent: 'Token Address:' }),
      tokenAddressInput,
    ]);

    // Start Time Input
    const startTimeInput = createElement('input', { type: 'datetime-local' });
    const startSecondsInput = createElement('input', { type: 'number', min: 0, max: 59, value: 0 });
    const startTimeGroup = createElement('div', { className: 'custom-tool-input-group' }, [
      createElement('label', { textContent: 'Start Time:' }),
      createElement('div', { className: 'custom-tool-time-group' }, [
        startTimeInput,
        startSecondsInput,
      ]),
    ]);

    // End Time Input
    const endTimeInput = createElement('input', { type: 'datetime-local' });
    const endSecondsInput = createElement('input', { type: 'number', min: 0, max: 59, value: 0 });
    const endTimeGroup = createElement('div', { className: 'custom-tool-input-group' }, [
      createElement('label', { textContent: 'End Time:' }),
      createElement('div', { className: 'custom-tool-time-group' }, [
        endTimeInput,
        endSecondsInput,
      ]),
    ]);

    // Event Select
    const eventSelect = createElement('select', {}, [
      createElement('option', { value: '', textContent: 'All' }),
      createElement('option', { value: 'sell', textContent: 'Sell' }),
      createElement('option', { value: 'buy', textContent: 'Buy' }),
    ]);
    const eventGroup = createElement('div', { className: 'custom-tool-input-group' }, [
      createElement('label', { textContent: 'Event:' }),
      eventSelect,
    ]);

    // Buttons to adjust time
    const timeAdjustButtons = [
      { label: '-30s', seconds: -30 },
      { label: '-15s', seconds: -15 },
      { label: '-5s', seconds: -5 },
      { label: '-2s', seconds: -2 },
      { label: '-1s', seconds: -1 },
      { label: '+1s', seconds: 1 },
      { label: '+2s', seconds: 2 },
      { label: '+5s', seconds: 5 },
      { label: '+15s', seconds: 15 },
      { label: '+30s', seconds: 30 },
    ];

    const startTimeButtonGroup = createElement('div', { className: 'custom-tool-button-group' }, [
      createElement('div', { textContent: 'Start Time:' }),
      ...timeAdjustButtons.map((btn) =>
        createElement('button', {
          textContent: btn.label,
          onclick: () => adjustTime(startTimeInput, startSecondsInput, btn.seconds),
        })
      ),
    ]);

    const endTimeButtonGroup = createElement('div', { className: 'custom-tool-button-group' }, [
      createElement('div', { textContent: 'End Time:' }),
      ...timeAdjustButtons.map((btn) =>
        createElement('button', {
          textContent: btn.label,
          onclick: () => adjustTime(endTimeInput, endSecondsInput, btn.seconds),
        })
      ),
    ]);

    // Get Button
    const getButton = createElement('button', {
      textContent: 'Get',
      style: 'margin-top: 16px;',
      onclick: () => handleGet(),
    });
    const copyButton = createElement('button', {
      textContent: '->',
      style: 'margin-top: 16px;',
      onclick: () => {
        endTimeInput.value = startTimeInput.value;
      },
    });

    // Result Lists
    const top5List = createElement('div', { className: 'custom-tool-result-list' });
    const allResultsList = createElement('div', { className: 'custom-tool-result-list' });
    const loadmore = createElement('div', { className: 'custom-tool-result-loadmore' });

     // filter
      const filterMinVol = createElement('input', { type: 'text', placeholder: 'Min volume' });
      const filterMaxVol = createElement('input', { type: 'text', placeholder: 'Max volume' });
        const filterNumTransBuy = createElement('input', { type: 'text', placeholder: 'Num trans buy' });
      const filterNumTransSell = createElement('input', { type: 'text', placeholder: 'Num trans sell' });
      const filterNumTrans = createElement('input', { type: 'text', placeholder: 'Num trans' });
      const filterGroup = createElement('div', { style: "display: flex;gap: 10px;" }, [
      createElement('div', { textContent: 'Filter:' }),
          createElement('div', { className: 'custom-tool-input-group' }, [filterMinVol]),
          createElement('div', { className: 'custom-tool-input-group' }, [filterMaxVol]),
           createElement('div', { className: 'custom-tool-input-group' }, [filterNumTransBuy]),
          createElement('div', { className: 'custom-tool-input-group' }, [filterNumTransSell]),
              createElement('div', { className: 'custom-tool-input-group' }, [filterNumTrans]),
    ]);


    // Append all elements to the container
    container.appendChild(tokenAddressGroup);
    group.appendChild(startTimeGroup);
    group.appendChild(copyButton);
    group.appendChild(endTimeGroup);
    group.appendChild(eventGroup);
    group.appendChild(getButton);
    container.appendChild(group);
    container.appendChild(startTimeButtonGroup);
    container.appendChild(endTimeButtonGroup);
    container.appendChild(filterGroup);

    container.appendChild(createElement('div', { textContent: 'Top 5 Volume:' }));
    container.appendChild(top5List);
    container.appendChild(createElement('div', { textContent: 'All Results:', style: "margin-top: 20px;" }));
    container.appendChild(allResultsList);
    container.appendChild(loadmore);

    // Append container to the body
    document.querySelector(".custom-gmgn-bot--config").appendChild(container);

    function getLocalDateTimeString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Function to adjust time
    function adjustTime(dateInput, secondsInput, seconds) {
      const currentTime = new Date(dateInput.value || new Date());
      const currentSeconds = parseInt(secondsInput.value, 10) || 0;
      currentTime.setSeconds(currentSeconds + seconds);
      dateInput.value = getLocalDateTimeString(currentTime);
      secondsInput.value = currentTime.getSeconds();
    }

    // Function to handle the Get button click

    let data = [];

    async function handleGet(cursor) {
      const tokenAddress = tokenAddressInput.value;
      const startTime = new Date(startTimeInput.value);
      const startSeconds = parseInt(startSecondsInput.value, 10) || 0;
      startTime.setSeconds(startSeconds);
      const endTime = new Date(endTimeInput.value);
      const endSeconds = parseInt(endSecondsInput.value, 10) || 0;
      endTime.setSeconds(endSeconds);

      if (!tokenAddress || !startTime || !endTime) {
        alert('Please fill in all fields');
        return;
      }

      const url = `https://gmgn.ai/api/v1/token_trades/sol/${tokenAddress}?device_id=a25bb802-b5cb-45b1-8b77-d64356b06112&client_id=gmgn_web_2025.0220.100826&from_app=gmgn&app_ver=2025.0220.100826&tz_name=Asia%2FSaigon&tz_offset=25200&app_lang=en&limit=100&maker=&from=${Math.floor(
        startTime.getTime() / 1000
      )}&to=${Math.floor(endTime.getTime() / 1000)}${
        eventSelect.value ? `&event=${eventSelect.value}` : ''
      }${cursor? `&cursor=${cursor}`: ''}`;

      try {
        if (!cursor) allResultsList.innerHTML = '';
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const newCursor = result.data.next;
        const tmp = result.data.history.map((item) => ({
          timestamp: item.timestamp,
          tx_hash: item.tx_hash,
          event: item.event,
          quote_amount: item.quote_amount,
          quote_symbol: item.quote_symbol,
          maker: item.maker,
            price_usd: item.price_usd,
        }));

        data = cursor? data.concat(...tmp): tmp;

          const countWalletSell = {};
          const countWalletBuy = {};
          data.forEach(item => {
              if (item.event === 'sell') {
              countWalletSell[item.maker] = (countWalletSell[item.maker] || 0) + 1
              } else {
              countWalletBuy[item.maker] = (countWalletBuy[item.maker] || 0) + 1
              }
          });

          const filterMinVolValue = Number(filterMinVol.value.trim());
          const filterMaxVolValue = Number(filterMaxVol.value.trim());
            const filterNumTransBuyValue = Number(filterNumTransBuy.value.trim());
            const filterNumTransSellValue = Number(filterNumTransSell.value.trim());
            const filterNumTransValue = Number(filterNumTrans.value.trim());
          const filterData = data.filter(item => (filterMinVolValue? Number(item.quote_amount) >= filterMinVolValue: true) && (filterMaxVolValue? Number(item.quote_amount) <= filterMaxVolValue: true)
                                         && (filterNumTransBuyValue? countWalletBuy[item.maker] === filterNumTransBuyValue: true)
                                        && (filterNumTransSellValue? countWalletSell[item.maker] === filterNumTransSellValue: true)
                                        && (filterNumTransValue? countWalletBuy[item.maker] + countWalletSell[item.maker] === filterNumTransValue: true))
        // Display top 5 results
        top5List.innerHTML = '';


        [...filterData]
          .sort((a, b) => Number(b.quote_amount) - Number(a.quote_amount))
          .slice(0, 5)
          .forEach((item) => {
            top5List.appendChild(createResultItem(item, countWalletSell, countWalletBuy));
          });

        if (cursor) allResultsList.innerHTML = '';


        // Display all results
        filterData.forEach((item) => {
          allResultsList.appendChild(createResultItem(item, countWalletSell, countWalletBuy));
        });


        loadmore.innerHTML = '';
        if (newCursor) {
          const button = createElement('button', {
            textContent: 'Load more',
            style: 'margin-top: 16px;margin-bottom: 16px;',
            onclick: () => handleGet(newCursor),
          });
          loadmore.appendChild(button)
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching data');
      }
    }

    // Function to create a result item
    function createResultItem(item, countWalletSell, countWalletBuy) {
      return createElement('div', { className: 'custom-tool-item' }, [
        createElement('div', { textContent: formatDate(item.timestamp), style: "width: 150px;" }),
        createElement('div', {
          textContent: item.event,
          style: `width: 80px; color: ${item.event === 'sell' ? 'tomato' : item.event === 'buy' ? '#2fd52f' : 'black'};`
        }),
        createElement('div', {
          textContent: `${Number(item.quote_amount).toFixed(3)} ${item.quote_symbol}`,
          style: "width: 150px;"
        }),
          createElement('div', {
          textContent: `${Number(item.price_usd).toFixed(8)}`,
          style: "width: 150px;"
        }),
        createElement('a', {
          href: `https://gmgn.ai/sol/address/${item.maker}`,
          textContent: `${item.maker} (${countWalletBuy[item.maker] || 0},${countWalletSell[item.maker] || 0})`,
          target: '_blank',
        }),
      ]);
    }
  }

  // Initialize the script
  init();
})();