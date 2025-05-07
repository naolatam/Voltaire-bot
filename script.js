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
// Set this to 0 for automatic mode
// Set this to 1 for no automatic response and hidden response
let hiddenLevel = 1;

// Set the place where you want to hide the response in hiddenLevel 3.
// You can choose one and set multiple between:
// - "URL" : This add a href '#' into the url with the word that is incorect
//    - Example: "projet-voltaire.fr/.../Voltaire.html?returnUrl=...&...=pv" => "projet-voltaire.fr/.../Voltaire.html?returnUrl=...&...=pv#avenir"
// - "KEYBOARD" : This add an event on keyboard, press the r key to see a text at the left bottom corner. Press r again to make it disappears

let hiddingPlace = ["URL", "KEYBOARD"];

// This variable is void. It's used by the code. Please do not tuch them! It may break the code for you.
let responseMap = [];
let requestMap = [];
let actualResponse = "";

if (hiddingPlace.includes("KEYBOARD")) {
    window.addEventListener("keydown", (e) => {
        if (e.key == "r") {
            let div = getContainer(".responseDiv");
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

let reversoCache = [];

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

async function requestReverso(phrase) {
  console.log(reversoCache, reversoCache[phrase]);
    if (reversoCache.filter(a => a[0] == phrase).length > 0) {
      log("Cache hit for phrase:", phrase);
        return reversoCache.filter(a => a[0] == phrase)[0][1];
    }
    const url = "https://orthographe.reverso.net/api/v1/Spelling/";
    const payLoad = {
        englishDialect: "indifferent",
        autoReplace: true,
        getCorrectionDetails: true,
        interfaceLanguage: "fr",
        locale: "",
        language: "fra",
        text: phrase,
        originalText: "",
        spellingFeedbackOptions: { insertFeedback: true, userLoggedOn: false },
        origin: "interactive",
        isHtml: false,
        IsUserPremium: false,
    };
    const headers = {
        accept: "text/json",
        "content-type": "application/*+json",
        "sec-ch-ua": '"Not.A/Brand";v="99", "Chromium";v="136"',
        "sec-ch-ua-mobile": "?0",
        Referer: "https://www.reverso.net/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0 Safari/537.36",
    };

    const req = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payLoad),
    }).catch((error) => {
        return {
            status: -1,
            message: "Error " + response.status + " : " + error,
        };
    });

    if (req.ok) {
        const data = await req.json();
        if (data.corrections && data.corrections.length == 0) {
            reversoCache.push([phrase, { status: 0, response: null }]);
            return { status: 0, response: null };
        }
        let response = [];
        for (let i = 0; i < data.corrections.length; i++) {
            let correction = data.corrections[i].correctionText;
            let original = data.corrections[i].mistakeText;
            console.log(
                "Correction:",
                correction,
                "Original:",
                original.toLowerCase()
            );
            if (correction.toLowerCase() != original.toLowerCase()) {
                response.push({ good: correction, wrong: original });
            }
        }
        reversoCache.push([phrase, { status: 1, response: response }]);
        return { status: 1, response: response };
    } else {
        return {
            status: -1,
            message: "Error " + response.status + " : " + (await req.text()),
        };
    }
}

function respond(response) {
    if (hiddenLevel == 0) {
    }
    if (hiddenLevel == 1) {
        if (response.status == -1) {
            log("Response not found!");
        } else if (response.status == 0) {
            actualResponse = "Response is correct!";
        } else {
            actualResponse = "";
            for (let i = 0; i < response.response.length; i++) {
                actualResponse +=
                    response.response[i].wrong +
                    " => " +
                    response.response[i].good +
                    "\n";
            }
        }

        if (hiddingPlace.includes("URL")) {
            let url = window.location.href;
            let newUrl = url + "#" + actualResponse;
            window.history.pushState({ path: newUrl }, "", newUrl);
        }
        if (hiddingPlace.includes("KEYBOARD")) {
            let div = getContainer(".responseDiv");
            if (div == null) {
                let newDiv = document.createElement("div");
                newDiv.style.position = "absolute";
                newDiv.style.bottom = "0";
                newDiv.style.display = "none";
                newDiv.classList.add("responseDiv");
                newDiv.innerHTML = actualResponse;
                document.body.append(newDiv);
            } else {
                div.innerHTML = actualResponse;
            }
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
    while (true) {
        log(`Analysing current page`);

        if (getContainer(".sentence") != null) {
            log("Sentence found!");
            let sentence = getContainer(".sentence").innerText.replace(
                "\\",
                ""
            );
            log("Sentence:", sentence);
            log("Searching for response...");
            let response = await requestReverso(sentence);
            let count = 0;
            while (response.status == -1) {
                await sleep(1000);
                if (count > 5) {
                    actualResponse =
                        "Error while getting reponse from Reverso. Check your internet connection. " +
                        response.message;
                    break;
                }
                response = await requestReverso(sentence);
                count++;
            }

            log(responseMap, response);
            respond(response);
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
