// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2025-02-24
// @description  try to take over the world!
// @author       You
// @match        https://www.projet-voltaire.fr/*
// @grant        none
// ==/UserScript==

/* (function() {
    let requestMap = []
    console.log("script started3")

    

    setTimeout(() => {
        requestMap.sort((b, a) => a.responseText.length - b.responseText.length)
        console.log("requestMap sorted!")
        let reponseData = requestMap[0].responseText.slice(5, -1).split(",")
        let newList = []
        for(let i = 0; i < reponseData.length; i++) {
            if(parseInt(reponseData[i]) != NaN) {
                continue
            }
            newList.push(reponseData[i])
        }      
        console.log(newList)  

    }, 5000);

})();
 */

/*
 ******* CONFIGURATION *******
 */
// Set this to 0 for normal mode
// Set this to 1 for no automatic response and hidden response
let hiddenLevel = 1;

// Set the place where you want to hide the response in hiddenLevel 3.
// You can choose one and set multiple between:
// - "TITLE" : This replace the version number in the title
//     - Example: "Projet Voltaire v7.2.99.0" => "Projet Voltaire v2" if the wrong word is the second one
// - "URL" : This add a href '#' into the url with the word that is incorect
//    - Example: "projet-voltaire.fr/.../Voltaire.html?returnUrl=...&...=pv" => "projet-voltaire.fr/.../Voltaire.html?returnUrl=...&...=pv#avenir"
// - "KEYBOARD" : This add an event on keyboard, press the r key to see a text at the left bottom corner. Press r again to make it disappears

let hiddingPlace = ["TITLE", "URL", "KEYBOARD"];

// This variable is void. It's used by the code. Please do not tuch them! It may break the code for you.
let responseMap = [];
let requestMap = [];
let actualResponse = "";

if (hiddingPlace.includes("KEYBOARD")) {
  window.addEventListener("keydown", (e) => {
    if (e.key == "r") {
      let div = getContainer(".responseDiv");
      log(div);
      if (div == null) {
        let newDiv = document.createElement("div");
        newDiv.style.position = "absolute";
        newDiv.style.bottom = "0";
        newDiv.style.display = "block";
        newDiv.classList.add("responseDiv");
        newDiv.innerHTML = actualResponse;
        document.body.append(newDiv);
        div = newDiv;
        return;
      }
      div.innerHTML = actualResponse;
      if (div.style.display == "none") {
        document.querySelector(".responseDiv").style.display = "block";
      } else {
        document.querySelector(".responseDiv").style.display = "none";
      }
    }
  });
}

/*
 ******* FUNCTIONS *******
 */

// This function is very utils and very easy to understand...
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isPath = (regex) => regex.test(location.pathname);
const min = (a, b) => (a < b ? a : b);
const randomBool = () => Math.random() > 0.5;
const isUpperCase = (c) => c === c.toUpperCase() && c !== c.toLowerCase();
// This function is used to log text in the console depending on the hiddenLevel
function log(...text) {
  if (hiddenLevel <= 1) {
    console.log("[Voltaire-BOT]", ...text);
  }
}

function setInterceptor() {
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (...args) {
    this._url = args[1];
    return originalXhrOpen.apply(this, args);
  };
  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (...args) {
    if (
      this._url ===
      "https://www.projet-voltaire.fr/services-pjv/gwt/WolLearningContentWebService"
    ) {
      const originalReady = this.onreadystatechange;
      this.onreadystatechange = function (...args) {
        if (this.readyState === 4) {
          responseMap.push(...parseResponseFile(this.responseText));
          //console.log("XHR response:", this.responseText);
        }
        return originalReady.apply(this, args);
      };
      requestMap.push(this);
    }
    originalSend.apply(this, args);
  };
  log("Interceptor ready!");
}

function parseResponseFile(response) {
  let responseMapQuestion = [{ phrase: "", response: "", correct: false }];
  response = response
    .slice(4)
    .replaceAll("\\xA0", " ")
    .replaceAll("\\x27", "'")
    .replaceAll("\\x26nbsp;", " ")
    .replaceAll("\\x3CB\\x3E", "<")
    .replaceAll("\\x26#x2011;", "‑")
    .replaceAll("\\x3C/B\\x3E", ">")
    .replaceAll("\\x26#x2013;", "–")
    .replaceAll("\\x3Cbr/\\x3Eou", " @@ ")
    .replaceAll(" @@ ", "\\n\\n")
    .replaceAll("\\x3Cbr/\\x3E", "\\n")
    .replaceAll("\\x3CI\\x3E", "")
    .replaceAll("\\x3C/I\\x3E", "")
    .replaceAll("\\x3CSUP\\x3E", "")
    .replaceAll("\\x3C/SUP\\x3E", "")
    .replaceAll("\\x3Cspanclass\\x3Dsmallcaps\\x3E", "")
    .replaceAll("\\x3C!-- smallcaps end --\\x3E", "")
    .replaceAll("\\x3C/span\\x3E", "")
    .replaceAll("\\x3", "\\u003")

    .replaceAll(' "," ', " ___ ")
    .replaceAll(",'", ',"')
    .replaceAll("',", '",');
  response = JSON.parse(response).filter((e) => typeof e == "object")[0];
  let responseJSON = [];

  response.forEach((el) => {
    if (el.includes("java.")) {
      return;
    }
    if (el.match(/\b[a-fA-F0-9]{40,50}\b/g)) {
      return;
    }
    if (el.includes("com.")) {
      return;
    }
    if (el.includes("«") || el.includes("»")) {
      return;
    }
    responseJSON.push(el);
  });

  for (let i = 0; i < responseJSON.length; i++) {
    let el = responseJSON[i];
    let lastResponse = responseMapQuestion[responseMapQuestion.length - 1];
    lastResponse.phrase += el;

    const isSentenceEnd = /[.!?]$/.test(el);
    const hasNext = i + 1 < responseJSON.length;
    const nextIsBold =
      hasNext &&
      responseJSON[i + 1].includes("<") &&
      responseJSON[i + 1].includes(">");
    const nextIsUppercase = hasNext && isUpperCase(responseJSON[i + 1][0]);

    if (isSentenceEnd || nextIsBold || nextIsUppercase) {
      if (nextIsBold) {
        lastResponse.response += responseJSON[++i];
      } else {
        lastResponse.correct = true;
      }
      // Remplacement des espaces et ponctuations spécifiques
      lastResponse.phrase = lastResponse.phrase
        .replace(/\s'$/, " ___")
        .replace(/\s,$/, " ___,")
        .replace(/ , /g, " ___, ")
        .replace(/', /g, "'___, ")
        .replace(/^\s/, "___ ")
        .replace(/ /g, " ___ ");

      lastResponse.response = lastResponse.response.replace(/ /g, " ");

      if (lastResponse.phrase.includes("___")) {
        lastResponse.correct = false;
      }

      responseMapQuestion.push({ phrase: "", response: "", correct: false });
    }
  }
  responseMapQuestion.pop();
  return responseMapQuestion;
}

function respond(response, sentence) {
  if (response.length == 0) {
    log("Response not found!");
    actualResponse = "Response not found";
  } else {
    response = response[0];
    if (response.response == "") {
      actualResponse = "Response not found";
      log("Response not found");
      return;
    }
    let responseWithOutCote = response.response
      .replaceAll("<", "")
      .replaceAll(">", "");
    let responseInBold = response.response
      .replaceAll("<", "003Cb003E")
      .replaceAll(">", "003C/b003E")
      .replaceAll("003E", ">")
      .replaceAll("003C", "<");
    let WordIndexThatIsDifferent = response.response.indexOf(
      response.response.split(" ").filter((e) => e.includes("<"))[0]
    );
    if (response.correct || sentence == responseWithOutCote) {
      log("Sentence is correct!");
      actualResponse = "Correct";
    } else {
      if (hiddingPlace.includes("TITLE")) {
        document.title = "Projet Voltaire v" + WordIndexThatIsDifferent;
      }
      if (hiddingPlace.includes("URL")) {
        location.hash = WordIndexThatIsDifferent;
      }
      actualResponse = responseInBold;
      log("Response sentence: ", response.response);
    }
  }
}

function getContainer(selector) {
  return document.querySelector(selector);
}
function waitForQuerySelector(selector, timeOut) {
  return new Promise((resolve) => {
    let count = 0;
    let element = getContainer(selector);
    if (element) {
      resolve(element);
    }
    const interval = setInterval(() => {
      element = getContainer(selector);
      if (element) {
        clearInterval(interval);
        resolve(element);
      }
      if (count >= timeOut) {
        clearInterval(interval);
        resolve(null);
      }
      count++;
    }, 100);
  });
}

// This function is used to start the bot
async function start() {
  setInterceptor();
  while (true) {
    log(`Analysing current page`);

    if (getContainer(".sentence") != null) {
      if (responseMap.length == 0) {
        log("No response found! Please wait the page");
        await sleep(1000);
        continue;
      }

      log("Sentence found!");
      let sentence = getContainer(".sentence").innerText.replace("\\", "");
      log("Sentence:", sentence);
      log("Searching for response...");
      let response;
      response = responseMap.filter(
        (e) =>
          (sentence.startsWith(e.response.split("<")[0]) &&
            sentence.endsWith(e.response.split(">")[1])) ||
          sentence.includes(e.phrase) ||
          e.phrase.replace("___", "").includes(sentence) ||
          sentence == e.response
      );
      log(responseMap, response);
      if (sentence.includes("  ") || sentence.includes("  ")) {
        const regexPhrase = new RegExp(sentence.replace(/  /g, " \\w+ "));
        const regexResponse = new RegExp(sentence.replace(/  /g, " <\\w+> "));

        response = responseMap.filter((e) => {
          log(
            e.response.match(regexResponse),
            regexResponse.test(e.response),
            regexPhrase.test(e.phrase.replace("___", "aaa")),
            e
          );
          return (
            regexResponse.test(e.response) ||
            e.phrase.replace("___", "") == sentence || 
            regexPhrase.test(e.phrase.replace("___", "aaa"))
          );
        });
        log("after 1", response)
        if (response.length == 0) {
          const regexPhrase = new RegExp(sentence.split("  ")[0] + "\\w+");
          const regexResponse = new RegExp(sentence.split("  ")[0] + "<\\w+>");
          response = responseMap.filter((e) => {
            return (
              regexResponse.test(e.response) ||
              regexPhrase.test(e.phrase.replace("___", "aaa"))
            );
          });
        }
      } else if (sentence.slice(-2, -1) == " " || sentence.slice(-2, -1) == " " && response.length == 0) {
        const regexPhrase = new RegExp(sentence.replace(/ $/, " \\w+"));
        const regexResponse = new RegExp(sentence.replace(/ $/, " <\\w+>"));
        response = responseMap.filter((e) => {
          log(
            e.response.match(regexResponse),
            regexResponse.test(e.response),
            regexPhrase.test(e.phrase.replace("___", "aaa")),
            e
          );
          return (
            regexResponse.test(e.response) ||
            regexPhrase.test(e.phrase.replace("___", "aaa"))
          );
        });
      } else if (sentence.includes(" , ")  && response.length == 0) {
        {
          const regexPhrase = new RegExp(sentence.replace(/  /g, " \\w+, "));
          const regexResponse = new RegExp(
            sentence.replace(/  /g, " <\\w+>, ")
          );

          response = responseMap.filter((e) => {
            return (
              regexResponse.test(e.response) ||
              regexPhrase.test(e.phrase.replace("___", "aaa"))
            );
          });
        }
      }
      respond(response, sentence);
      break;
    }
    await sleep(1000);
  }
}

(function () {
  if (document.readyState === "complete") {
    log(
      "Before starting, we implement many timer before responding. This is just for simulating a real person reading text and listening to audio. We try to make the wait time the shorter and optimised as we can!\nThe time you need to wait will be printed in this section every time you will need to wait.\n\nDON'T TRY TO RELOAD THE PAGE! IT WILL JUST RESTART THE TIMER FROM 0! IF YOU RESPOND MANUALLY, PLEASE NOTICE THAT THE TIMER WILL NOT BE RESETED FOR CORRESPODING THE NEW QUESTION!"
    );
    start();
  } else {
    window.addEventListener("load", async () => {
      log(
        "Before starting, we implement many timer before responding. This is just for simulating a real person reading text and listening to audio. We try to make the wait time the shorter and optimised as we can!\nThe time you need to wait will be printed in this section every time you will need to wait.\n\nDON'T TRY TO RELOAD THE PAGE! IT WILL JUST RESTART THE TIMER FROM 0! IF YOU RESPOND MANUALLY, PLEASE NOTICE THAT THE TIMER WILL NOT BE RESETED FOR CORRESPODING THE NEW QUESTION!"
      );
      start();
    });
  }
})();
