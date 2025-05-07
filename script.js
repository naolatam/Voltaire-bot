// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2025-02-24
// @description  try to take over the world!
// @author       You
// @match        https://www.projet-voltaire.fr/*
// @grant        none
// ==/UserScript==

/*
 ******* CONFIGURATION *******
 */
// Set this to 0 for automatic mode
// Set this to 1 for no automatic response and hidden response
let hiddenLevel = 0;

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
        if (e.key == "r" && hiddenLevel == 1) {
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
    if (reversoCache.filter((a) => a[0] == phrase).length > 0) {
        return reversoCache.filter((a) => a[0] == phrase)[0][1];
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

async function respond(response) {
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
    if (hiddenLevel == 0) {
        log("Waiting 7s before responding...");
        await sleep(7000);

        if (response.status == 0) {
            let btn = await waitForQuerySelector(".noMistakeButton", 2000);
            if(btn) btn.click();
            await sleep(500);
            await nextQuestion();
        } else if (response.status == 1) {
            let sentenceContainer = getContainer(".sentence");
            if (sentenceContainer == null) return;

            for (let i = 0; i < sentenceContainer.children.length; i++) {
                let word = sentenceContainer.children[i].innerText;
                for (let j = 0; j < response.response.length; j++) {
                    if (response.response[j].wrong.includes(word)) {
                        sentenceContainer.children[i].click();
                        await sleep(1000);
                        await nextQuestion();
                        break;
                    }
                }
            }
        }
    }
    if (hiddenLevel == 1) {
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

async function nextQuestion() {
    let btn = await waitForQuerySelector(".nextButton", 2000);
    if (btn == null) {
        log("Button not found!");
        return;
    }
    btn.click();
    await sleep(500);
}

function checkIfQCM() {
    let qcm = getContainer(".popupContent")
    if(qcm == null) {
        return false;
    }
    if(qcm.querySelector(".intensiveTraining") == null) {
        return false;
    }
    return true;

}
async function doQCM() {
    if(!checkIfQCM()) {
        log("Not a QCM!");
        return;
    }
    let btn = document.querySelector(".understoodButton");
    if(btn == null) {
        return;
    }
    btn.click();
    await sleep(750);
    let questions = document.querySelector(".innerIntensiveQuestions").children
    for(let i = 0; i < questions.length; i++) {
        let question = questions[i];
        question.querySelector("button").click();
        await sleep(600)
    }
    document.querySelector(".exitButton").click();  
    await sleep(1000);

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

function findNextActivity() {
    let activityListContainer = document.querySelectorAll(
        ".activity-selector-list"
    );
    let activity = null;
    for (let i = 0; i < activityListContainer.length; i++) {
        activity = activityListContainer[i].querySelector(
            ".activity-selector-cell:not(.completed):not(.disabled)"
        );
        if (activity != null) {
            break;
        }
        activity = activityListContainer[i].querySelector(
            ".validation-activity-cell:not(.completed):not(.disabled)"
        );
        if (activity != null) {
            break;
        }
    }
    log("Activity found:", activity);
    return activity;
}

async function findResponse(sentence) {
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

    log("Response ", response.response?? "Aucune");
    await respond(response);
}

// This function is used to start the bot
async function start() {
    while (true) {
        log(`Analysing current page`);

        if (getContainer(".sentence") != null) {
            if(checkIfQCM()) {
                await doQCM();
            }
            log("Sentence found!");
            let sentence = getContainer(".sentence").innerText.replace(
                "\\",
                ""
            );
            log("Sentence:", sentence);
            await findResponse(sentence);
        } else if (
            hiddenLevel == 0 &&
            getContainer(".activity-selector-title") != null
        ) {
            findNextActivity().click();
            await sleep(5000);
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
