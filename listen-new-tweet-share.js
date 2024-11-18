/* eslint-disable no-empty */
// ==UserScript==
// @name         Twitter bot
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  notify new tweet
// @author       You
// @match        https://twitter.com/*
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
    .twitter-bot {
      position: fixed;
      top: -2px;
      width: 100%;
      text-align: center;
      padding: 0 12px;
      box-sizing: border-box;
    }
    .twitter-bot * {
      box-sizing: border-box;
      color: black;
    }
    .twitter-bot--toggle {
      background: white;
      border: 1px solid #d9d9d9;
      padding: 8px 20px;
      border-radius: 4px;
      position: relative;
      cursor: pointer;
      font-weight: bold;
      color: black;
    }
    .twitter-bot--toggle::after {
    content: "";
    position: absolute;
    bottom: -9px;
      left: 28px;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid #dbdbdb;
    }
    .twitter-bot--config {
      height: 0px;
      transition: height 1s;
      box-shadow: rgb(0 0 0 / 24%) 0px 3px 8px;
      background: white;
      position: relative;
      display: flex;
      overflow-y: hidden;
    }
    .twitter-bot--open .twitter-bot--config {
      height: 750px;
      display: flex;
      flex-direction: column;
    }

    .twitter-bot--form textarea {
      padding: 10px;
      max-width: 100%;
      line-height: 1.5;
      border-radius: 5px;
      border: 1px solid #ddd;
      background: white;
    }

    .twitter-bot--form textarea:focus {
      outline: none;
    }

    .twitter-bot--form input {
      padding: 10px;
      border-radius: 4px;
      outline: none;
      border: 1px solid #c9c9c9;
      width: 100%;
      background: white;
    }

    .bot-form--tweets label {
      display: block;
      margin-bottom: 10px;
    }
    .bot-checkbox {
      display: block;
      position: relative;
      padding-left: 24px;
      margin-bottom: 12px;
      cursor: pointer;
      font-size: 16px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    .bot-checkbox  input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }
    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 16px;
      width: 16px;
      background-color: #eee;
      border-radius: 4px;
    }
    .bot-checkbox:hover input ~ .checkmark {
      background-color: #ccc;
    }
    .bot-checkbox input:checked ~ .checkmark {
      background-color: #2196F3;
    }
    .bot-checkbox input:checked ~ .checkmark:after {
      display: block;
    }
    .bot-checkbox .checkmark:after {
      left: 9px;
      top: 5px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 3px 3px 0;
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      transform: rotate(45deg);
    }
    .twitter-bot--donate {
      text-align: right;
      padding: 20px;
      border-bottom: 1px solid #ebebeb;
      margin-bottom: 20px;
    }
    .twitter-bot--box {
      display: flex;
    }
    .twitter-bot--form {
      width: 50%;
    }
    .bot-form--header {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    .bot-form--content {
      text-align: left;
      padding: 0 24px;
      border-right: 1px solid #eeeeee;
    }
    .bot-form--tweets {
      margin-bottom: 16px;
    }
    .bot-form--tweets textarea {
      width: 100%;
    }

    .twitter-bot--result {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .twitter-bot--title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    .result-item span {
      margin-left: 8px;
    }
    .success span {
      color: #00dd1b;
    }
    .error span {
      color: tomato;
    }
    .error-detail {
      display: none;
    }
    .bot-form--submit {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
    }
    .bot-form--submit button, #bot-add-tweet {
      background: #1c98eb;
      border: none;
      padding: 8px 20px;
      border-radius: 4px;
      cursor: pointer;
      color: white;
    }
    .bot-form--submit button:disabled {
      background: #6da1c5;
      cursor: no-drop;
    }
    .twitter-bot--list {
      max-height: 400px;
      overflow-y: scroll;
    }
    .random-tag {
      margin-left: 16px;
    }
    #twitter-bot-number-tag {
      margin-left: 16px;
      width: calc(100% - 16px);
      margin-bottom: 16px;
    }
    .twitter-bot--tweets {
      padding-top: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e8e8e8;
      border-top: 1px solid #e8e8e8;
      overflow-y: auto;
      max-height: 460px;
    }
    .twitter-bot--tweets__title {
      font-weight: bold;
      font-size: 17px;
      margin-bottom: 16px;
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
    .bot-twitter-profiles__item .bot-form--tweets {
      margin-right: 8px;
    }
    .twitter-bot--remove-tweet {
      background: white;
      border: 1px solid #dadada;
      border-radius: 4px;
      margin-top: 8px;
    }
  `;

// ****************** Handle logic call api twitter ************************* //

function setHeaders(xhr, authorization, notSetJson) {
  const xCsrfToken = document.cookie
    .split("; ")
    .find((item) => item.includes("ct0="))
    ?.split("=")[1];

  xhr.setRequestHeader("authorization", authorization);
  xhr.setRequestHeader("x-csrf-token", xCsrfToken);
  xhr.setRequestHeader("x-twitter-active-user", "yes");
  xhr.setRequestHeader("x-twitter-auth-type", "OAuth2Session");
  xhr.setRequestHeader("x-twitter-client-language", "en");
  if (!notSetJson) {
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  }
}

function getUserRestId(authorization, profile) {
  const exist = localStorage.getItem(`save-profile-id-${profile}`);
  if (exist) {
    return exist;
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      `https://twitter.com/i/api/graphql/_pnlqeTOtnpbIL9o-fS_pg/ProfileSpotlightsQuery?variables=${encodeURIComponent(
        `{"screen_name":"${profile}"}`
      )}`,
      true
    );
    setHeaders(xhr, authorization);

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.response);
        const id = data.data.user_result_by_screen_name.result.rest_id;
        localStorage.setItem(`save-profile-id-${profile}`, id);
        resolve(id);
      } else {
        reject(xhr.response);
      }
    };
    xhr.onerror = (err) => {
      reject(err);
    };
    xhr.send(null);
  });
}

async function initTweetsStorage(authorization, userId) {
  const limit = 100;
  const per = 20;
  const result = [];
  let cursor = '';

  for (let i = 0; i < limit / per; i++) {
    try {
      const resp = await queryTweets(authorization, userId, cursor);
      console.log('resp', i, resp);
      result.push(...resp.tweets);
      cursor = resp.cursor;
      if (!resp.tweets.length) {
        break;
      }
    } catch (error) {
      console.log('init error:', {
        error, userId
      });
    }
  }

  console.log('init result', result);
  localStorage.setItem(`tweets_storage_${userId}`, JSON.stringify(result));
}

async function getNewTweets(authorization, userId, keyword) {
  const {tweets} = await queryTweets(authorization, userId);
  const result = tweets;
  const exist = localStorage.getItem(`tweets_storage_${userId}`)
    ? JSON.parse(localStorage.getItem(`tweets_storage_${userId}`))
    : null;
  console.log("exist", {
    exist,
    current: result,
  });
  if (exist) {
    const nonExist = result.filter((item) => {
      return !exist.find((el) => el.tweetId === item.tweetId);
    });
    if (nonExist.length) {
      localStorage.setItem(
        `tweets_storage_${userId}`,
        JSON.stringify(nonExist.concat(exist))
      );
      return nonExist.filter((item) =>
        item.content.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())
      );
    } else {
      return [];
    }
  } else {
    localStorage.setItem(`tweets_storage_${userId}`, JSON.stringify(result));
    return [];
  }
}

function queryTweets(authorization, userId, cursor) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      `https://twitter.com/i/api/graphql/V1ze5q3ijDS1VeLwLY0m7g/UserTweets?variables=%7B%22userId%22%3A%22${userId}%22%2C%22count%22%3A20%2C${
        cursor ? `%22cursor%22%3A%22${encodeURIComponent(cursor)}%22%2C` : ""
      }%22includePromotedContent%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Afalse%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_media_download_video_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D`,
      true
    );
    setHeaders(xhr, authorization);

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.response);
        const result = [];
        let cursor = '';
        data.data.user.result.timeline_v2.timeline.instructions.forEach(
          (ins) => {
            if (!cursor && ins.entry) {
              try {
                const legacy =
                  ins.entry.content.itemContent.tweet_results.result.legacy;
                result.push({
                  tweetId: legacy.conversation_id_str,
                  content: legacy.full_text,
                  created_at: new Date(legacy.created_at).getTime(),
                });
              } catch {}
            }
            if (ins.entries) {
              for (const entry of ins.entries) {
                try {
                  if (entry.entryId.startsWith('tweet-')) {
                    const legacy =
                      entry.content.itemContent.tweet_results.result.legacy;
                    const newValue = {
                      tweetId: legacy.conversation_id_str,
                      content: legacy.full_text,
                      created_at: new Date(legacy.created_at).getTime(),
                    };
                    if (!result.find(item => item.tweetId === newValue.tweetId)) {
                      result.push(newValue);
                    }
                  } else if (entry.entryId.startsWith('cursor-bottom-')) {
                    cursor = entry.content.value;
                  }
                } catch {}
              }
            }
          }
        );
        resolve({
          tweets: result,
          cursor
        });
      } else {
        reject(xhr.response);
      }
    };
    xhr.onerror = (err) => {
      reject(err);
    };
    xhr.send(null);
  });
}

function formatDate(time) {
  return new Date(time).toLocaleString();
}
// ****************** Handle logic run bot ************************* //

let isBotStarted = false;
let intervals = {};

async function checkProfile(authorization, profile, userId) {
  try {
    const tweets = await getNewTweets(
      authorization,
      userId,
      profile.keyword,
    );
    console.log("tweets", tweets);
    if (isBotStarted && tweets.length) {
      const tweetsData = tweets.map(({ tweetId, content, created_at }) => {
        return {
          id: tweetId,
          content: `#twitter #new_tweet"\n\n🔊 New Tweet 🔊\n\n<a href='https://twitter.com/${
            profile.profile
          }/status/${tweetId}'>${profile.profile}</a> - ${formatDate(
            created_at
          )}\n\n${content}`,
        };
      });
      const summary = tweetsData.map((item) => item.content).join("");
      document.querySelector(".twitter-bot--list").insertAdjacentHTML(
        "beforeend",
        `
                <div class="result-item success">
                  ${summary}
                </div>
              `
      );

      chrome.runtime.sendMessage("nkjlcklhemhbnhlhbhbpgikjhnfdnkcn", {
        channel: "auto-bot",
        method: "notify_new_tweet",
        params: {
          tweets: tweetsData,
          telegram: {
            chat_id: "TODO",
            botToken: "TODO",
            message_thread_id: "TODO",
          },
        },
      });
    }
  } catch (error) {
    console.log("getUser error:", error);
  }
}

async function startBot() {
  if (isBotStarted) {
    document.querySelector("#twitter-bot-start").innerHTML = "Start";
    isBotStarted = false;
    Object.values(intervals).forEach((interval) => {
      try {
        clearInterval(interval);
      } catch {}
    });
    intervals = {};
    return;
  }

  const old = localStorage.getItem("twitter-bot-storage")
    ? JSON.parse(localStorage.getItem("twitter-bot-storage"))
    : {};
  const authorization = document.querySelector(
    "#twitter-bot-authorization"
  ).value;
  const intervalStr = document.querySelector("#twitter-bot-interval").value;

  if (!old.profiles || !old.profiles.length) {
    return alert("Please input profiles!");
  }

  if (!authorization.trim()) {
    return alert("Please enter authorization!");
  }
  if (isNaN(intervalStr)) {
    return alert("Invalid interval!");
  }
  const interval = Number(intervalStr) * 1000;
  const profiles = [];
  for (let i = 0; i < old.profiles.length; i++) {
    const profile = old.profiles[i];
    const profileValue = document.querySelector(
      `#tweet-profile-${profile.createdAt}`
    ).value;
    const keywordValue = document.querySelector(
      `#tweet-keyword-${profile.createdAt}`
    ).value;
    if (!profileValue) {
      return alert(`Please enter profile ${i + 1}!`);
    }
    profiles.push({
      createdAt: profile.createdAt,
      profile: profileValue,
      keyword: keywordValue,
    });
  }

  document.querySelector("#twitter-bot-start").innerHTML = "Stop";
  isBotStarted = true;

  localStorage.setItem(
    "twitter-bot-storage",
    JSON.stringify({
      authorization: authorization,
      interval: interval / 1000,
      profiles,
    })
  );
  console.log("result", {
    authorization: authorization,
    interval: interval,
    profiles,
  });

  document.querySelector(".twitter-bot--list").innerHTML = "";
  const validProfiles = profiles.filter(
    (value, index) =>
      index === profiles.findIndex((el) => el.profile === value.profile)
  );

  validProfiles.forEach(async (profile) => {
    try {
      const userId = await getUserRestId(authorization, profile.profile);
      console.log("userId", userId);
      await initTweetsStorage(authorization, userId);
      if (isBotStarted) {
        intervals[profile.profile] = setInterval(() => {
          checkProfile(authorization, profile, userId);
        }, interval);
      }
    } catch (error) {
      console.log('check profile error:', {
        error,
        profile
      })
    }
  });
}

function getDefaultTweet() {
  return {
    createdAt: Date.now(),
    profile: "",
    keyword: "",
  };
}

async function handleAddTweet() {
  const old = localStorage.getItem("twitter-bot-storage")
    ? JSON.parse(localStorage.getItem("twitter-bot-storage"))
    : {};

  const currentProfiles = old.profiles || [];
  const newProfiles = currentProfiles.concat(getDefaultTweet());
  localStorage.setItem(
    "twitter-bot-storage",
    JSON.stringify({
      ...old,
      profiles: newProfiles,
    })
  );

  renderProfiles(newProfiles);
}

async function removeProfile(profileId) {
  const old = localStorage.getItem("twitter-bot-storage")
    ? JSON.parse(localStorage.getItem("twitter-bot-storage"))
    : {};

  const currentProfiles = old.profiles || [];
  const newProfiles = currentProfiles.filter(
    (profile) => profile.createdAt !== profileId
  );
  localStorage.setItem(
    "twitter-bot-storage",
    JSON.stringify({
      ...old,
      profiles: newProfiles,
    })
  );

  renderProfiles(newProfiles);
}

function renderProfiles(profiles) {
  const content = profiles.reduce((cal, profile) => {
    const profileId = `tweet-profile-${profile.createdAt}`;
    const keywordId = `tweet-keyword-${profile.createdAt}`;
    return (
      cal +
      `<div class="bot-twitter-profiles__item">
      <div class="bot-form--tweets bot-twitter-profiles__item-profile">
        <label for="${profileId}">Profile:</label>
        <input value="${profile.profile}" id="${profileId}" placeholder="Enter profile link" name="${profileId}">
      </div>
      <div class="bot-form--tweets bot-twitter-profiles__item-keyword">
        <label for="${keywordId}">Keyword:</label>
        <input value="${profile.keyword}" id="${keywordId}" placeholder="Enter filter keyword (Optional)" name="${keywordId}">
      </div>
      <button id="remove-tweet-${profile.createdAt}" class="twitter-bot--remove-tweet">x</button>
    </div>`
    );
  }, "");
  document.querySelector(".twitter-bot--tweets__list").innerHTML = content;

  profiles.forEach((profile) => {
    document.querySelector(`#remove-tweet-${profile.createdAt}`).onclick =
      () => {
        removeProfile(profile.createdAt);
      };
  });
}

// ***************** Handle render **************************//

(function () {
  "use strict";
  addGlobalStyle(css);

  const local = localStorage.getItem("twitter-bot-storage")
    ? JSON.parse(localStorage.getItem("twitter-bot-storage"))
    : {
        authorization: "",
        interval: 60,
      };

  const { authorization, interval } = local;
  const defaultTweet = getDefaultTweet();
  if (!local.profiles || !local.profiles.length) {
    localStorage.setItem(
      "twitter-bot-storage",
      JSON.stringify({
        ...local,
        profiles: [defaultTweet],
      })
    );
  }
  const profiles = local.profiles || [defaultTweet];

  let div = document.createElement("div");
  div.classList.add("twitter-bot");
  div.innerHTML = `
    <div class="twitter-bot--config">
       <div class="twitter-bot--donate">
         <span><b>Donate:</b></span><span style="margin-left: 5px;">0xC9d60454152F19ab50d0fdB983f81bD1f0d0967F</span>
       </div>
       <div class="twitter-bot--box">
       <div class="twitter-bot--form">
          <div class="bot-form--header">Twitter Noti Bot</div>

          <div class="bot-form--content">
            <div class="bot-form--tweets">
              <label for="authorization">Authorization:</label>
              <input value="${authorization}" id="twitter-bot-authorization" placeholder="Enter authorization" name="authorization">
            </div>
            <div class="twitter-bot--tweets">
              <div class="twitter-bot--tweets__title">Profiles</div>
              <div class="twitter-bot--tweets__list">
              </div>
              <div style="display: flex; width: 100%; justify-content: center;">
                <button id="bot-add-tweet">Add Profile</button>
              </div>
            </div>
            <div style="display: flex; align-items: center;justify-content: space-between; margin-top: 12px;">
              <div class="bot-form--tweets">
                <label for="interval">Interval (second):</label>
                <input value="${interval}" id="twitter-bot-interval" placeholder="Enter interval" name="interval">
              </div>
              <div class="bot-form--submit">
                <button id="twitter-bot-start">Start</button>
              </div>
            </div>
          </div>
       </div>
       <div class="twitter-bot--result">
        <div class="twitter-bot--title">
          Result
        </div>
          <div class="twitter-bot--list">

          </div>
       </div>
       </div>
    </div>
    <button class="twitter-bot--toggle">Open</button>
    `;
  document.querySelector("body").appendChild(div);

  document.querySelector(".twitter-bot--toggle").onclick = () => {
    document
      .querySelector(".twitter-bot")
      .classList.toggle("twitter-bot--open");
  };

  document.querySelector("#twitter-bot-start").onclick = () => {
    startBot();
  };

  document.querySelector("#bot-add-tweet").onclick = () => {
    handleAddTweet();
  };

  renderProfiles(profiles);
  // Your code here...
})();
